import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import {
  rollDice,
  nextTurn,
  moveToken,
  setWinner,
  selectToken,
  increaseKillCount,
} from "../redux/gameSlice";

import { moveTokenSteps, findCutTokens } from "../helpers/MoveLogic";

import { playFX } from "../utils/sound";
import { getDiceAI } from "../utils/diceAI";

export function useGameLogic({
  diceValue,
  currentPlayer,
  players,
  winner,
  triggerFirework,
  triggerTrophy,
  gameMode,
  activePlayerIndexes,
}: {
  diceValue: number;
  currentPlayer: number;
  players: any[];
  winner: string | null;
  triggerFirework: () => void;
  triggerTrophy: () => void;
  gameMode: "quick" | "classic";
  activePlayerIndexes: number[];
}) {
  const dispatch = useDispatch();

  const safePositions = [1, 9, 14, 22, 27, 35, 40, 48];

  const isTokenFinished = (pos: number) => {
    return pos >= 100 && pos % 100 === 6;
  };

  const playersRef = useRef(players);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const autoMoveLock = useRef<string | null>(null);
  const mustMoveRef = useRef(false);
  const sixCountRef = useRef(0);
  const lastDiceRef = useRef<number>(1);
  const movingRef = useRef(false);

  const [canRollDice, setCanRollDice] = useState(true);
  const [lastDiceValue, setLastDiceValue] = useState<number>(1);
  const [cuttingTokenKey, setCuttingTokenKey] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1400);
  };

  // ✅ if currentPlayer is not active, auto skip
  useEffect(() => {
    if (!activePlayerIndexes.includes(currentPlayer)) {
      setTimeout(() => {
        dispatch(nextTurn());
        dispatch(rollDice(0));
      }, 200);
    }
  }, [currentPlayer, activePlayerIndexes, dispatch]);

  useEffect(() => {
    autoMoveLock.current = null;
    mustMoveRef.current = false;
    movingRef.current = false;
    sixCountRef.current = 0;

    setCanRollDice(true);

    dispatch(rollDice(0));
    setCuttingTokenKey(null);
  }, [currentPlayer, dispatch]);

  useEffect(() => {
    autoMoveLock.current = null;
  }, [diceValue]);

  const movableTokens =
    diceValue > 0
      ? players[currentPlayer].tokens
          .map((pos: number, idx: number) => ({ pos, idx }))
          .filter((t: any) => {
            const steps = moveTokenSteps(currentPlayer, t.pos, diceValue);
            return steps.length > 0;
          })
          .map((t: any) => t.idx)
      : [];

  const roll = useCallback(() => {
    if (winner) return;
    if (mustMoveRef.current === true) return;
    if (movingRef.current === true) return;

    // ❌ if current player is not active, do nothing
    if (!activePlayerIndexes.includes(currentPlayer)) return;

    const playerTokens = playersRef.current[currentPlayer].tokens;

    const enemyTokens = playersRef.current
      .filter((_: any, idx: number) => idx !== currentPlayer)
      .filter((_: any, idx: number) => activePlayerIndexes.includes(idx))
      .flatMap((p: any) => p.tokens);

    const aiDice = getDiceAI({
      playerTokens,
      enemyTokens,
      safePositions,
      lastDice: lastDiceRef.current,
      winPosition: 57,
      difficulty: "normal",
      currentPlayer,
    });

    lastDiceRef.current = aiDice;
    setLastDiceValue(aiDice);

    if (aiDice === 6) {
      sixCountRef.current += 1;

      if (sixCountRef.current >= 3) {
        showToast("3 SIX! Turn skipped!");

        dispatch(rollDice(0));

        mustMoveRef.current = false;
        movingRef.current = false;
        sixCountRef.current = 0;

        setCanRollDice(true);

        dispatch(nextTurn());
        return;
      }
    } else {
      sixCountRef.current = 0;
    }

    playFX("dice_roll");
    dispatch(rollDice(aiDice));

    mustMoveRef.current = true;
    setCanRollDice(false);
  }, [winner, dispatch, currentPlayer, activePlayerIndexes]);

  const moveSelectedToken = useCallback(
    async (tokenIndex: number) => {
      if (winner) return;
      if (movingRef.current) return;

      if (!activePlayerIndexes.includes(currentPlayer)) return;

      const dice = diceValue;
      if (!dice) return;

      movingRef.current = true;

      try {
        const tokenPos = playersRef.current[currentPlayer].tokens[tokenIndex];

        const steps = moveTokenSteps(currentPlayer, tokenPos, dice);

        if (steps.length === 0) {
          mustMoveRef.current = false;
          setCanRollDice(true);

          if (dice !== 6) {
            sixCountRef.current = 0;

            setTimeout(() => {
              dispatch(nextTurn());
              dispatch(rollDice(0));
            }, 800);
          }

          movingRef.current = false;
          return;
        }

        setCanRollDice(false);

        const totalMoveTime = steps.length === 1 ? 350 : 800;
        const stepDelay = Math.floor(totalMoveTime / steps.length);

        for (let i = 0; i < steps.length; i++) {
          await new Promise((res) => setTimeout(res, stepDelay));

          playFX("pileMove");

          dispatch(
            moveToken({
              playerIndex: currentPlayer,
              tokenIndex,
              newPosition: steps[i],
            })
          );
        }

        const finalPos = steps[steps.length - 1];

        if (finalPos >= 100 && finalPos % 100 === 6) {
          playFX("homepass");
          triggerFirework();
        }

        const safeSpots = [9, 22, 35, 48];
        const isHomeLane = finalPos >= 100;

        if (!isHomeLane && safeSpots.includes(finalPos)) {
          playFX("safespot");
        }

        const cuts = findCutTokens(playersRef.current, currentPlayer, finalPos);

        for (const cut of cuts) {
          playFX("collide");
          setCuttingTokenKey(`${cut.playerIndex}-${cut.tokenIndex}`);

          await new Promise((res) => setTimeout(res, 420));

          dispatch(
            moveToken({
              playerIndex: cut.playerIndex,
              tokenIndex: cut.tokenIndex,
              newPosition: 0,
            })
          );

          setCuttingTokenKey(null);
        }

        if (cuts.length > 0) {
          dispatch(increaseKillCount({ playerIndex: currentPlayer }));
        }

        // ✅ WINNER CHECK BASED ON MODE
        const finishedCount = playersRef.current[currentPlayer].tokens.filter(
          (p: number) => isTokenFinished(p)
        ).length;

        const neededToWin = gameMode === "quick" ? 2 : 4;

        if (finishedCount >= neededToWin) {
          dispatch(setWinner(playersRef.current[currentPlayer].name));
          triggerTrophy();
          movingRef.current = false;
          return;
        }

        dispatch(rollDice(0));
        mustMoveRef.current = false;

        if (dice === 6) {
          setCanRollDice(true);
        } else {
          setCanRollDice(true);
          sixCountRef.current = 0;
          dispatch(nextTurn());
        }

        movingRef.current = false;
      } catch (err) {
        movingRef.current = false;
      }
    },
    [
      currentPlayer,
      winner,
      dispatch,
      diceValue,
      triggerFirework,
      triggerTrophy,
      gameMode,
      activePlayerIndexes,
    ]
  );

  const onTokenPress = useCallback(
    (playerIndex: number, tokenIndex: number) => {
      if (winner) return;
      if (playerIndex !== currentPlayer) return;
      if (!diceValue) return;
      if (movingRef.current) return;

      if (!activePlayerIndexes.includes(currentPlayer)) return;

      if (!movableTokens.includes(tokenIndex)) return;

      dispatch(selectToken(tokenIndex));

      setTimeout(() => {
        moveSelectedToken(tokenIndex);
      }, 40);
    },
    [
      winner,
      currentPlayer,
      dispatch,
      moveSelectedToken,
      movableTokens,
      diceValue,
      activePlayerIndexes,
    ]
  );

  useEffect(() => {
    if (winner) return;
    if (!diceValue) return;
    if (movingRef.current) return;

    if (!activePlayerIndexes.includes(currentPlayer)) return;

    const lockKey = `${currentPlayer}-${diceValue}-${players[
      currentPlayer
    ].tokens.join("-")}`;

    if (autoMoveLock.current === lockKey) return;
    autoMoveLock.current = lockKey;

    if (movableTokens.length === 0) {
      mustMoveRef.current = false;
      setCanRollDice(false);

      setTimeout(() => {
        dispatch(nextTurn());
        dispatch(rollDice(0));
        setCanRollDice(true);
      }, 700);

      return;
    }

    if (movableTokens.length === 1) {
      setCanRollDice(false);

      dispatch(selectToken(movableTokens[0]));

      setTimeout(() => {
        moveSelectedToken(movableTokens[0]);
      }, 250);

      return;
    }

    setCanRollDice(false);
  }, [
    currentPlayer,
    diceValue,
    movableTokens,
    players,
    winner,
    dispatch,
    moveSelectedToken,
    activePlayerIndexes,
  ]);

  return {
    roll,
    onTokenPress,
    canRollDice,
    movableTokens,
    toastMessage,
    lastDiceValue,
    cuttingTokenKey,
  };
}
