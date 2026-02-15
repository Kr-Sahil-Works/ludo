import { MainPath, HomePaths } from "./BoardPositions";
import { startingPoints, SafeSpots } from "./PlotData";

const MAIN_PATH_LENGTH = MainPath.length;

const homeEntryIndexMap = {
  0: MainPath.findIndex((p) => p.id === 52), // red
  1: MainPath.findIndex((p) => p.id === 13), // green
  2: MainPath.findIndex((p) => p.id === 26), // yellow
  3: MainPath.findIndex((p) => p.id === 39), // blue
};

const getHomePath = (playerIndex: number) => {
  if (playerIndex === 0) return HomePaths.red;
  if (playerIndex === 1) return HomePaths.green;
  if (playerIndex === 2) return HomePaths.yellow;
  return HomePaths.blue;
};

const isMainPathPos = (pos: number) => {
  return MainPath.some((p) => p.id === pos);
};

const isHomePathPos = (playerIndex: number, pos: number) => {
  return getHomePath(playerIndex).some((p) => p.id === pos);
};

const getMainIndex = (pos: number) => {
  return MainPath.findIndex((p) => p.id === pos);
};

const getHomeIndex = (playerIndex: number, pos: number) => {
  return getHomePath(playerIndex).findIndex((p) => p.id === pos);
};

export const getVictoryId = (playerIndex: number) => {
  const homePath = getHomePath(playerIndex);
  return homePath[homePath.length - 1].id;
};

// winner check
export const checkWinner = (playerIndex: number, pos: number) => {
  return pos === getVictoryId(playerIndex);
};

// safe spot check
export const isSafeSpot = (pos: number) => {
  return SafeSpots.includes(pos);
};

export function findCutTokens(players: any[], currentPlayer: number, pos: number) {
  if (pos === 0 || pos >= 100) return [];

  const cuts: { playerIndex: number; tokenIndex: number }[] = [];

  for (let p = 0; p < players.length; p++) {
    if (p === currentPlayer) continue;

    const tokensAtPos = players[p].tokens
      .map((t: number, idx: number) => ({ t, idx }))
      .filter((obj: any) => obj.t === pos);

    // ✅ BLOCK RULE (2+ tokens = no cut)
    if (tokensAtPos.length >= 2) {
      return [];
    }

    if (tokensAtPos.length === 1) {
      cuts.push({ playerIndex: p, tokenIndex: tokensAtPos[0].idx });
    }
  }

  return cuts;
}


// ✅ FIXED: step-by-step movement
export const moveTokenSteps = (
  playerIndex: number,
  currentPos: number,
  diceValue: number
): number[] => {
  const steps: number[] = [];

  if (diceValue <= 0) return steps;

  // token at home
  if (currentPos === 0) {
    if (diceValue === 6) {
      steps.push(startingPoints[playerIndex]);
    }
    return steps;
  }

  // already finished
  if (currentPos === getVictoryId(playerIndex)) return steps;

  const homePath = getHomePath(playerIndex);

  // inside home lane
  if (isHomePathPos(playerIndex, currentPos)) {
    const homeIndex = getHomeIndex(playerIndex, currentPos);

    for (let i = 1; i <= diceValue; i++) {
      const nextIndex = homeIndex + i;

      if (nextIndex >= homePath.length) return []; // cannot move
      steps.push(homePath[nextIndex].id);
    }

    return steps;
  }

  // inside main path
  if (isMainPathPos(currentPos)) {
    const currentIndex = getMainIndex(currentPos);
    const homeEntryIndex = homeEntryIndexMap[playerIndex as 0 | 1 | 2 | 3];

    // ✅ distance from currentIndex to homeEntryIndex (forward wrap safe)
    let distanceToEntry = homeEntryIndex - currentIndex;
    if (distanceToEntry < 0) distanceToEntry += MAIN_PATH_LENGTH;

    for (let i = 1; i <= diceValue; i++) {
      // ✅ if crossed entry -> go into home lane
      if (i > distanceToEntry) {
        const stepsIntoHome = i - distanceToEntry - 1;

        if (stepsIntoHome >= homePath.length) return []; // cannot move
        steps.push(homePath[stepsIntoHome].id);
      } else {
        const nextIndex = (currentIndex + i) % MAIN_PATH_LENGTH;
        steps.push(MainPath[nextIndex].id);
      }
    }

    return steps;
  }

  return steps;
};

export const moveTokenWithPath = (
  playerIndex: number,
  currentPos: number,
  diceValue: number
): number => {
  const steps = moveTokenSteps(playerIndex, currentPos, diceValue);

  if (steps.length === 0) return currentPos;

  return steps[steps.length - 1];
};

// ✅ FIXED reverse animation to home
export const moveTokenReverseSteps = (
  playerIndex: number,
  currentPos: number
): number[] => {
  const steps: number[] = [];

  if (currentPos === 0) return steps;

  const homePath = getHomePath(playerIndex);

  // if token is in home lane
  if (isHomePathPos(playerIndex, currentPos)) {
    const homeIndex = getHomeIndex(playerIndex, currentPos);

    for (let i = homeIndex - 1; i >= 0; i--) {
      steps.push(homePath[i].id);
    }

    steps.push(0);
    return steps;
  }

  // if token is in main path
  if (isMainPathPos(currentPos)) {
    let currentIndex = getMainIndex(currentPos);

    while (true) {
      currentIndex -= 1;
      if (currentIndex < 0) currentIndex = MAIN_PATH_LENGTH - 1;

      steps.push(MainPath[currentIndex].id);

      if (MainPath[currentIndex].id === startingPoints[playerIndex]) break;
    }

    steps.push(0);
    return steps;
  }

  return steps;
};
