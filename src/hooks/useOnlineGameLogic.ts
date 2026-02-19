import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { moveTokenSteps } from "@/src/helpers/MoveLogic";
import { playFX } from "@/src/utils/sound";

type Props = {
  roomCode?: string;
  userId?: string;
  room?: any;
  players?: any[];
  triggerFirework?: () => void;
  triggerTrophy?: () => void;
};

export function useOnlineGameLogic({
  roomCode,
  userId,
  room,
  triggerFirework,
  triggerTrophy,
}: Props) {
  // ✅ ALWAYS call hooks
  const rollDiceOnline = useMutation(api.rooms.rollDiceOnline);
  const moveTokenOnline = useMutation(api.rooms.moveTokenOnline);

  const [canRollDice, setCanRollDice] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [cuttingTokenKey, setCuttingTokenKey] = useState<string | null>(null);

  const movingRef = useRef(false);

  const gameState = room?.gameState ?? null;
  const playersState = gameState?.players ?? [];

  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  const diceValue = gameState?.diceValue ?? 0;
  const winnerId = gameState?.winnerId ?? null;

  // ✅ find my index
  const myIndex = useMemo(() => {
    if (!userId || playersState.length === 0) return -1;
    return playersState.findIndex((p: any) => p.userId === userId);
  }, [playersState, userId]);

  const isMyTurn =
    myIndex !== -1 && myIndex === currentPlayerIndex && !winnerId;

  // ✅ movable tokens (COLOR BASED FIX)
type TokenInfo = {
  pos: number;
  idx: number;
};

const movableTokens = useMemo(() => {
  if (!isMyTurn) return [];
  if (!diceValue) return [];
  if (myIndex === -1) return [];

  const me = playersState[myIndex];
  if (!me) return [];

  return me.tokens
    .map((pos: number, idx: number): TokenInfo => ({
      pos,
      idx,
    }))
    .filter((t: TokenInfo) => {
      const steps = moveTokenSteps(me, t.pos, diceValue);
      return steps.length > 0;
    })
    .map((t: TokenInfo) => t.idx);
}, [playersState, myIndex, diceValue, isMyTurn]);


  // sync cutting animation
  useEffect(() => {
    if (gameState?.cuttingTokenKey) {
      setCuttingTokenKey(gameState.cuttingTokenKey);
    } else {
      setCuttingTokenKey(null);
    }
  }, [gameState?.cuttingTokenKey]);

  // reset roll when dice clears
 useEffect(() => {
  // whenever turn changes OR dice resets
  if (!isMyTurn) {
    setCanRollDice(false);
    return;
  }

  if (diceValue === 0) {
    setCanRollDice(true);
    movingRef.current = false;
  }
}, [diceValue, isMyTurn]);

useEffect(() => {
  if (!isMyTurn) {
    movingRef.current = false;
  }
}, [isMyTurn]);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1400);
  };

  // ---------------- ROLL ----------------

  const roll = useCallback(async () => {
    if (!roomCode || !userId) return;
    if (!gameState) return;
    if (!isMyTurn) {
      showToast("Not your turn");
      return;
    }
    if (!canRollDice) return;
    if (diceValue !== 0) return;

    try {
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
  }, [
    roomCode,
    userId,
    gameState,
    isMyTurn,
    canRollDice,
    diceValue,
    rollDiceOnline,
  ]);

  // ---------------- MOVE ----------------

  const moveSelectedToken = useCallback(
    async (tokenIndex: number) => {
      if (!roomCode || !userId) return;
      if (!gameState) return;
      if (!isMyTurn) {
        showToast("Not your turn");
        return;
      }
      if (!diceValue) return;
      if (!movableTokens.includes(tokenIndex)) return;
      if (movingRef.current) return;

      try {
        movingRef.current = true;
        setCanRollDice(false);

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
    [
      roomCode,
      userId,
      gameState,
      isMyTurn,
      diceValue,
      movableTokens,
      moveTokenOnline,
    ]
  );

  // only allow my tokens
  const onTokenPress = useCallback(
    (playerIndex: number, tokenIndex: number) => {
      if (!isMyTurn) return;
      if (!diceValue) return;
      if (playerIndex !== myIndex) return;

      moveSelectedToken(tokenIndex);
    },
    [isMyTurn, diceValue, myIndex, moveSelectedToken]
  );

  // win animation
  useEffect(() => {
    if (!winnerId || !userId) return;

    if (winnerId === userId) {
      triggerTrophy?.();
    } else {
      triggerFirework?.();
    }
  }, [winnerId, userId, triggerTrophy, triggerFirework]);

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
    isMyTurn,
  };
}
