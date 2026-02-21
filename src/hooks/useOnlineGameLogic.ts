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

type TokenInfo = {
pos: number;
idx: number;
};

export function useOnlineGameLogic({
roomCode,
userId,
room,
triggerFirework,
triggerTrophy,
}: Props) {
const rollDiceOnline = useMutation(api.rooms.rollDiceOnline);
const moveTokenOnline = useMutation(api.rooms.moveTokenOnline);

const [canRollDice, setCanRollDice] = useState(true);
const [toastMessage, setToastMessage] = useState("");
const [cuttingTokenKey, setCuttingTokenKey] = useState<string | null>(null);

const [predictedMove, setPredictedMove] = useState<{
steps: number[];
playerIndex: number;
tokenIndex: number;
} | null>(null);

const movingRef = useRef(false);
const autoMoveLockRef = useRef(false); // 🔥 prevents double auto move

const gameState = room?.gameState ?? null;
const playersState = gameState?.players ?? [];

const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
const diceValue = gameState?.diceValue ?? 0;
const winnerId = gameState?.winnerId ?? null;

// ---------------- MY INDEX ----------------

const myIndex = useMemo(() => {
if (!userId || playersState.length === 0) return -1;
return playersState.findIndex((p: any) => p.userId === userId);
}, [playersState, userId]);

const isMyTurn =
myIndex !== -1 && myIndex === currentPlayerIndex && !winnerId;

// ---------------- MOVABLE TOKENS ----------------

const movableTokens = useMemo(() => {
if (!isMyTurn) return [];
if (!diceValue) return [];
if (myIndex === -1) return [];


const me = playersState[myIndex];
if (!me) return [];

return me.tokens
  .map((pos: number, idx: number): TokenInfo => ({ pos, idx }))
  .filter((t: TokenInfo) => {
    const steps = moveTokenSteps(me, t.pos, diceValue);
    return steps.length > 0;
  })
  .map((t: TokenInfo) => t.idx);


}, [playersState, myIndex, diceValue, isMyTurn]);

// ---------------- CUT SYNC ----------------

useEffect(() => {
setCuttingTokenKey(gameState?.cuttingTokenKey ?? null);
}, [gameState?.cuttingTokenKey]);

// ---------------- ROLL RESET ----------------

useEffect(() => {
if (!isMyTurn) {
setCanRollDice(false);
return;
}


if (diceValue === 0) {
  setCanRollDice(true);
  movingRef.current = false;
  autoMoveLockRef.current = false; // 🔥 reset lock
}


}, [diceValue, isMyTurn]);

useEffect(() => {
if (!isMyTurn) {
movingRef.current = false;
autoMoveLockRef.current = false;
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
if (!isMyTurn) return;
if (!diceValue) return;
if (!movableTokens.includes(tokenIndex)) return;
if (movingRef.current) return;


  try {
    const me = playersState[myIndex];
    if (!me) return;

    movingRef.current = true;
    setCanRollDice(false);

    const currentPos = me.tokens[tokenIndex];
    const steps = moveTokenSteps(me, currentPos, diceValue);

    if (steps.length > 0) {
      setPredictedMove({
        steps,
        playerIndex: myIndex,
        tokenIndex,
      });
    }

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
  playersState,
  myIndex,
]


);

// =====================================================
// 🤖 AUTO MOVE (single option)
// =====================================================
useEffect(() => {
  if (!isMyTurn) return;
  if (!diceValue) return;
  if (diceValue === 6) return; // ❌ skip auto on six
  if (movingRef.current) return;

  // case 1: only one movable token
  if (movableTokens.length === 1) {
    const tokenIndex = movableTokens[0];

    const t = setTimeout(() => {
      moveSelectedToken(tokenIndex);
    }, 420);

    return () => clearTimeout(t);
  }

  // case 2: only one token outside home
  if (myIndex === -1) return;

  const me = playersState[myIndex];
  if (!me) return;

  const outsideTokens = me.tokens
    .map((pos: number, idx: number): TokenInfo => ({ pos, idx }))
    .filter((t: TokenInfo) => t.pos !== 0);

  if (outsideTokens.length === 1 && movableTokens.length > 0) {
    const tokenIndex = outsideTokens[0].idx;

    const t = setTimeout(() => {
      moveSelectedToken(tokenIndex);
    }, 420);

    return () => clearTimeout(t);
  }
}, [
  movableTokens,
  diceValue,
  isMyTurn,
  myIndex,
  playersState,
  moveSelectedToken,
]);

// ---------------- TOKEN PRESS ----------------

const onTokenPress = useCallback(
(playerIndex: number, tokenIndex: number) => {
if (!isMyTurn) return;
if (!diceValue) return;
if (playerIndex !== myIndex) return;


  moveSelectedToken(tokenIndex);
},
[isMyTurn, diceValue, myIndex, moveSelectedToken]


);

// ---------------- CLEAR PREDICTION ----------------

useEffect(() => {
if (!predictedMove) return;


const realPos =
  playersState[predictedMove.playerIndex]?.tokens[
    predictedMove.tokenIndex
  ];

const predictedFinal =
  predictedMove.steps[predictedMove.steps.length - 1];

if (realPos === predictedFinal) {
  setPredictedMove(null);
}


}, [playersState, predictedMove]);

// ---------------- WIN EFFECT ----------------

useEffect(() => {
if (!winnerId || !userId) return;


if (winnerId === userId) triggerTrophy?.();
else triggerFirework?.();


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


lastMoveSteps: predictedMove?.steps,
lastMovePlayerIndex: predictedMove?.playerIndex ?? null,
lastMoveTokenIndex: predictedMove?.tokenIndex ?? null,


};
}
