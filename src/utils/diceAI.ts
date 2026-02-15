// src/utils/diceAI.ts
import { moveTokenSteps } from "../helpers/MoveLogic";

export type Difficulty = "easy" | "normal" | "hard";

export type DiceAIParams = {
  playerTokens: number[];
  enemyTokens: number[];
  safePositions?: number[];
  lastDice?: number | null;
  winPosition?: number;
  difficulty?: Difficulty;

  // ✅ IMPORTANT: needed for moveTokenSteps()
  currentPlayer: number;
};

// ----------------------------------
// Weighted Dice (more 4,5,6)
// ----------------------------------
function weightedDice(difficulty: Difficulty): number {
  let weights: { value: number; weight: number }[] = [];

  if (difficulty === "easy") {
    weights = [
      { value: 1, weight: 25 },
      { value: 2, weight: 20 },
      { value: 3, weight: 18 },
      { value: 4, weight: 15 },
      { value: 5, weight: 12 },
      { value: 6, weight: 10 },
    ];
  } else if (difficulty === "hard") {
    weights = [
      { value: 1, weight: 5 },
      { value: 2, weight: 8 },
      { value: 3, weight: 12 },
      { value: 4, weight: 20 },
      { value: 5, weight: 25 },
      { value: 6, weight: 30 },
    ];
  } else {
    // normal
    weights = [
      { value: 1, weight: 10 },
      { value: 2, weight: 12 },
      { value: 3, weight: 15 },
      { value: 4, weight: 20 },
      { value: 5, weight: 20 },
      { value: 6, weight: 23 },
    ];
  }

  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * total;

  for (let w of weights) {
    if (rand < w.weight) return w.value;
    rand -= w.weight;
  }

  return 6;
}

// ----------------------------------
// Check if any valid move exists for dice
// ----------------------------------
function hasValidMoveWithPath(
  currentPlayer: number,
  playerTokens: number[],
  dice: number
): boolean {
  return playerTokens.some((pos) => {
    const steps = moveTokenSteps(currentPlayer, pos, dice);
    return steps.length > 0;
  });
}

// ----------------------------------
// MAIN AI DICE FUNCTION (PATH BASED)
// ----------------------------------
export function getDiceAI({
  playerTokens,
  enemyTokens,
  safePositions = [],
  lastDice = null,
  winPosition = 57,
  difficulty = "normal",
  currentPlayer,
}: DiceAIParams): number {
  // block 6 sometimes (prevents too many 6 streak)
  const sixBlocked = lastDice === 6 && Math.random() < 0.35;

  // ------------------------------------------------
  // STEP 1: Try random weighted dice first
  // ------------------------------------------------
  for (let i = 0; i < 8; i++) {
    let dice = weightedDice(difficulty);

    if (dice === 6 && sixBlocked) dice = 5;

    if (hasValidMoveWithPath(currentPlayer, playerTokens, dice)) {
      return dice;
    }
  }

  // ------------------------------------------------
  // STEP 2: Try all dice from best to worst
  // ------------------------------------------------
  for (let dice = 6; dice >= 1; dice--) {
    if (dice === 6 && sixBlocked) continue;

    if (hasValidMoveWithPath(currentPlayer, playerTokens, dice)) {
      return dice;
    }
  }

  // ------------------------------------------------
  // STEP 3: If no dice gives move, return 6
  // ------------------------------------------------
  return 6;
}
