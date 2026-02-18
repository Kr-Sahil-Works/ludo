import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { moveTokenSteps, findCutTokens } from "@/src/helpers/MoveLogic";
import { playFX } from "@/src/utils/sound";

type Props = {
  roomCode: string;
  userId: string;

  room: any; // convex room doc
  players: any[]; // roomPlayers list

  triggerFirework: () => void;
  triggerTrophy: () => void;
};

export function useOnlineGameLogic({
  roomCode,
  userId,
  room,
  players,
  triggerFirework,
  triggerTrophy,
}: Props) {
  const rollDiceOnline = useMutation(api.rooms.rollDiceOnline);
  const moveTokenOnline = useMutation(api.rooms.moveTokenOnline);

  const safePositions = [1, 9, 14, 22, 27, 35, 40, 48];

  const [canRollDice, setCanRollDice] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [cuttingTokenKey, setCuttingTokenKey] = useState<string | null>(null);

  const movingRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1400);
  };

  const gameState = room?.gameState;

  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  const diceValue = gameState?.diceValue ?? 0;
  const winnerId = gameState?.winnerId ?? null;

  const myIndex = useMemo(() => {
    if (!gameState?.players) return -1;
    return gameState.players.findIndex((p: any) => p.userId === userId);
  }, [gameState?.players, userId]);

  const isMyTurn = myIndex === currentPlayerIndex;

  const movableTokens = useMemo(() => {
    if (!gameState?.players) return [];
    if (!diceValue) return [];
    if (winnerId) return [];

    const me = gameState.players[currentPlayerIndex];
    if (!me) return [];

    return me.tokens
      .map((pos: number, idx: number) => ({ pos, idx }))
      .filter((t: any) => {
        const steps = moveTokenSteps(currentPlayerIndex, t.pos, diceValue);
        return steps.length > 0;
      })
      .map((t: any) => t.idx);
  }, [gameState?.players, currentPlayerIndex, diceValue, winnerId]);

  // keep local cutting animation sync
  useEffect(() => {
    if (gameState?.cuttingTokenKey) {
      setCuttingTokenKey(gameState.cuttingTokenKey);
      return;
    }
    setCuttingTokenKey(null);
  }, [gameState?.cuttingTokenKey]);

  // enable roll when dice resets
  useEffect(() => {
    if (diceValue === 0) {
      setCanRollDice(true);
      movingRef.current = false;
    }
  }, [diceValue]);

  const roll = useCallback(async () => {
    try {
      if (!roomCode) return;
      if (!gameState) return;
      if (winnerId) return;

      if (!isMyTurn) {
        showToast("Not your turn!");
        return;
      }

      if (!canRollDice) return;
      if (diceValue !== 0) return;

      setCanRollDice(false);

      playFX("dice_roll");

      await rollDiceOnline({
        code: roomCode,
        userId,
      });
    } catch (err: any) {
      console.log("ROLL ERROR:", err?.message);
      setCanRollDice(true);
    }
  }, [roomCode, userId, isMyTurn, canRollDice, diceValue, gameState, winnerId]);

  const moveSelectedToken = useCallback(
    async (tokenIndex: number) => {
      try {
        if (!roomCode) return;
        if (!gameState) return;
        if (winnerId) return;
        if (movingRef.current) return;

        if (!isMyTurn) {
          showToast("Not your turn!");
          return;
        }

        if (!diceValue) return;
        if (!movableTokens.includes(tokenIndex)) return;

        movingRef.current = true;
        setCanRollDice(false);

        // 🔥 play local movement sound
        playFX("pileMove");

        await moveTokenOnline({
          code: roomCode,
          userId,
          tokenIndex,
        });

        movingRef.current = false;
      } catch (err: any) {
        console.log("MOVE ERROR:", err?.message);
        movingRef.current = false;
        setCanRollDice(true);
      }
    },
    [roomCode, userId, gameState, winnerId, isMyTurn, diceValue, movableTokens]
  );

  const onTokenPress = useCallback(
    (playerIndex: number, tokenIndex: number) => {
      if (!gameState) return;
      if (winnerId) return;

      if (playerIndex !== currentPlayerIndex) return;
      if (!diceValue) return;
      if (!isMyTurn) return;

      moveSelectedToken(tokenIndex);
    },
    [
      gameState,
      winnerId,
      currentPlayerIndex,
      diceValue,
      isMyTurn,
      moveSelectedToken,
    ]
  );

  // win animations trigger
  useEffect(() => {
    if (!winnerId) return;
    if (winnerId === userId) {
      triggerTrophy();
    }
  }, [winnerId]);

  return {
  roll,
  onTokenPress,
  canRollDice,
  movableTokens,
  toastMessage,
  diceValue,
  currentPlayerIndex,
  cuttingTokenKey,
  winnerId,
  isMyTurn
}

}
