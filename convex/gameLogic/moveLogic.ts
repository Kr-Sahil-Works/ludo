import { MainPath, HomePaths } from "./boardPositions";
import { startingPoints, SafeSpots } from "./plotData";

const MAIN_PATH_LENGTH = MainPath.length;

// map color -> entry cell id
const homeEntryIdByColor: Record<string, number> = {
  red: 52,
  green: 13,
  yellow: 26,
  blue: 39,
};

// map color -> starting cell id
const startingIdByColor: Record<string, number> = {
  red: startingPoints[0], // 1
  green: startingPoints[1], // 14
  yellow: startingPoints[2], // 27
  blue: startingPoints[3], // 40
};

const getHomePathByColor = (color: string) => {
  if (color === "red") return HomePaths.red;
  if (color === "green") return HomePaths.green;
  if (color === "yellow") return HomePaths.yellow;
  return HomePaths.blue;
};

const isMainPathPos = (pos: number) => {
  return MainPath.some((p) => p.id === pos);
};

const getMainIndex = (pos: number) => {
  return MainPath.findIndex((p) => p.id === pos);
};

const getHomeIndex = (homePath: any[], pos: number) => {
  return homePath.findIndex((p: any) => p.id === pos);
};

export const getVictoryIdByColor = (color: string) => {
  const homePath = getHomePathByColor(color);
  return homePath[homePath.length - 1].id;
};

export const checkWinner = (color: string, pos: number) => {
  return pos === getVictoryIdByColor(color);
};

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

    // BLOCK rule: if 2+ tokens stacked, cannot cut
    if (tokensAtPos.length >= 2) {
      return [];
    }

    if (tokensAtPos.length === 1) {
      cuts.push({ playerIndex: p, tokenIndex: tokensAtPos[0].idx });
    }
  }

  return cuts;
}

// ✅ FIXED: movement uses player.color instead of playerIndex
export const moveTokenSteps = (
  player: any,
  currentPos: number,
  diceValue: number
): number[] => {
  const steps: number[] = [];

  if (diceValue <= 0) return steps;

  const color = player.color || "red";
  const homePath = getHomePathByColor(color);
  const homeEntryId = homeEntryIdByColor[color] ?? 52;
  const startingId = startingIdByColor[color] ?? 1;

  // token at home
  if (currentPos === 0) {
    if (diceValue === 6) {
      steps.push(startingId);
    }
    return steps;
  }

  // already finished
  if (currentPos === getVictoryIdByColor(color)) return steps;

  // inside home lane
  const isInHomeLane = homePath.some((p: any) => p.id === currentPos);

  if (isInHomeLane) {
    const homeIndex = getHomeIndex(homePath, currentPos);

    for (let i = 1; i <= diceValue; i++) {
      const nextIndex = homeIndex + i;
      if (nextIndex >= homePath.length) return [];
      steps.push(homePath[nextIndex].id);
    }

    return steps;
  }

  // inside main path
  if (isMainPathPos(currentPos)) {
    const currentIndex = getMainIndex(currentPos);
    const homeEntryIndex = MainPath.findIndex((p) => p.id === homeEntryId);

    let distanceToEntry = homeEntryIndex - currentIndex;
    if (distanceToEntry < 0) distanceToEntry += MAIN_PATH_LENGTH;

    for (let i = 1; i <= diceValue; i++) {
      if (i > distanceToEntry) {
        const stepsIntoHome = i - distanceToEntry - 1;
        if (stepsIntoHome >= homePath.length) return [];
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
  player: any,
  currentPos: number,
  diceValue: number
): number => {
  const steps = moveTokenSteps(player, currentPos, diceValue);
  if (steps.length === 0) return currentPos;
  return steps[steps.length - 1];
};

// reverse movement when cut
export const moveTokenReverseSteps = (
  player: any,
  currentPos: number
): number[] => {
  const steps: number[] = [];

  if (currentPos === 0) return steps;

  const color = player.color || "red";
  const homePath = getHomePathByColor(color);
  const startingId = startingIdByColor[color] ?? 1;

  // if token is in home lane
  const isInHomeLane = homePath.some((p: any) => p.id === currentPos);

  if (isInHomeLane) {
    const homeIndex = getHomeIndex(homePath, currentPos);

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

      if (MainPath[currentIndex].id === startingId) break;
    }

    steps.push(0);
    return steps;
  }

  return steps;
};
