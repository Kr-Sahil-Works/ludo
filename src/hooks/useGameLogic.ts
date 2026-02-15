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
}: {
  diceValue: number;
  currentPlayer: number;
  players: any[];
  winner: string | null;
  triggerFirework: () => void;
  triggerTrophy: () => void;
}) {
  const dispatch = useDispatch();

  // ✅ Safe tiles positions
  const safePositions = [1, 9, 14, 22, 27, 35, 40, 48];

  // ✅ helper: token finished (106 / 206 / 306 / 406)
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

  // ✅ LAST DICE REF (for AI)
  const lastDiceRef = useRef<number>(1);

  // ✅ Prevent double move
  const movingRef = useRef(false);

  const [canRollDice, setCanRollDice] = useState(true);

  // ✅ UI last dice
  const [lastDiceValue, setLastDiceValue] = useState<number>(1);

  // ✅ cutting animation trigger key
  const [cuttingTokenKey, setCuttingTokenKey] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 1400);
  };

  // ✅ reset locks when player changes
  useEffect(() => {
    autoMoveLock.current = null;
    mustMoveRef.current = false;
    movingRef.current = false;
    sixCountRef.current = 0;

    setCanRollDice(true);

    dispatch(rollDice(0));
    setCuttingTokenKey(null);
  }, [currentPlayer, dispatch]);

  // reset auto move lock when dice changes
  useEffect(() => {
    autoMoveLock.current = null;
  }, [diceValue]);

  // ✅ movable tokens ONLY using redux diceValue
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

  // ✅ Dice roll (AI Integrated)
  const roll = useCallback(() => {
    if (winner) return;
    if (mustMoveRef.current === true) return;
    if (movingRef.current === true) return;

    const playerTokens = playersRef.current[currentPlayer].tokens;

    const enemyTokens = playersRef.current
      .filter((_: any, idx: number) => idx !== currentPlayer)
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

    // ✅ update UI dice
    setLastDiceValue(aiDice);

    // 6 streak check
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
  }, [winner, dispatch, currentPlayer]);

  // ✅ Move token STEP BY STEP
  const moveSelectedToken = useCallback(
    async (tokenIndex: number) => {
      if (winner) return;
      if (movingRef.current) return;

      const dice = diceValue;
      if (!dice) return;

      movingRef.current = true;

      try {
        const tokenPos = playersRef.current[currentPlayer].tokens[tokenIndex];

        const steps = moveTokenSteps(currentPlayer, tokenPos, dice);

        // ❌ no movement possible
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

        // ✅ move step-by-step
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

        // ✅ FINAL HOME SOUND + FIREWORK
        if (finalPos >= 100 && finalPos % 100 === 6) {
          playFX("homepass");
          triggerFirework();
        }

        // ✅ SAFE SPOT SOUND (ONLY STAR SAFE SPOTS)
        const safeSpots = [9, 22, 35, 48];
        const isHomeLane = finalPos >= 100;

        if (!isHomeLane && safeSpots.includes(finalPos)) {
          playFX("safespot");
        }

        // ✅ CUT opponent
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

        // ✅ WINNER CHECK (ALL 4 TOKENS FINISHED)
        const allFinished = playersRef.current[currentPlayer].tokens.every(
          (p: number) => isTokenFinished(p)
        );

        if (allFinished) {
          dispatch(setWinner(playersRef.current[currentPlayer].name));
          triggerTrophy();
          movingRef.current = false;
          return;
        }

        // reset dice
        dispatch(rollDice(0));

        mustMoveRef.current = false;

        // if dice was 6 -> same player
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
    ]
  );

  // Token press
  const onTokenPress = useCallback(
    (playerIndex: number, tokenIndex: number) => {
      if (winner) return;
      if (playerIndex !== currentPlayer) return;
      if (!diceValue) return;
      if (movingRef.current) return;

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
    ]
  );

  // ✅ Auto move
  useEffect(() => {
    if (winner) return;
    if (!diceValue) return;
    if (movingRef.current) return;

    const lockKey = `${currentPlayer}-${diceValue}-${players[
      currentPlayer
    ].tokens.join("-")}`;

    if (autoMoveLock.current === lockKey) return;
    autoMoveLock.current = lockKey;

    // no movable tokens
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

    // only one movable token
    if (movableTokens.length === 1) {
      setCanRollDice(false);

      dispatch(selectToken(movableTokens[0]));

      setTimeout(() => {
        moveSelectedToken(movableTokens[0]);
      }, 250);

      return;
    }

    // multiple movable tokens
    setCanRollDice(false);
  }, [
    currentPlayer,
    diceValue,
    movableTokens,
    players,
    winner,
    dispatch,
    moveSelectedToken,
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
