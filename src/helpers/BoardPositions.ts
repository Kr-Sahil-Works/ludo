export const GRID_SIZE = 15;

export const getCellXY = (cellSize: number, row: number, col: number) => {
  return {
    x: col * cellSize,
    y: row * cellSize,
  };
};

// ✅ MAIN 52 PATH (Correct Full Loop)
export const MainPath: { id: number; row: number; col: number }[] = [
  // RED start (left middle)
  { id: 1, row: 6, col: 1 },
  { id: 2, row: 6, col: 2 },
  { id: 3, row: 6, col: 3 },
  { id: 4, row: 6, col: 4 },
  { id: 5, row: 6, col: 5 },

  { id: 6, row: 5, col: 6 },
  { id: 7, row: 4, col: 6 },
  { id: 8, row: 3, col: 6 },
  { id: 9, row: 2, col: 6 },
  { id: 10, row: 1, col: 6 },
  { id: 11, row: 0, col: 6 },

  { id: 12, row: 0, col: 7 },
  { id: 13, row: 0, col: 8 },

  { id: 14, row: 1, col: 8 },
  { id: 15, row: 2, col: 8 },
  { id: 16, row: 3, col: 8 },
  { id: 17, row: 4, col: 8 },
  { id: 18, row: 5, col: 8 },

  { id: 19, row: 6, col: 9 },
  { id: 20, row: 6, col: 10 },
  { id: 21, row: 6, col: 11 },
  { id: 22, row: 6, col: 12 },
  { id: 23, row: 6, col: 13 },
  { id: 24, row: 6, col: 14 },

  { id: 25, row: 7, col: 14 },
  { id: 26, row: 8, col: 14 },

  { id: 27, row: 8, col: 13 },
  { id: 28, row: 8, col: 12 },
  { id: 29, row: 8, col: 11 },
  { id: 30, row: 8, col: 10 },
  { id: 31, row: 8, col: 9 },

  { id: 32, row: 9, col: 8 },
  { id: 33, row: 10, col: 8 },
  { id: 34, row: 11, col: 8 },
  { id: 35, row: 12, col: 8 },
  { id: 36, row: 13, col: 8 },
  { id: 37, row: 14, col: 8 },

  { id: 38, row: 14, col: 7 },
  { id: 39, row: 14, col: 6 },

  { id: 40, row: 13, col: 6 },
  { id: 41, row: 12, col: 6 },
  { id: 42, row: 11, col: 6 },
  { id: 43, row: 10, col: 6 },
  { id: 44, row: 9, col: 6 },

  { id: 45, row: 8, col: 5 },
  { id: 46, row: 8, col: 4 },
  { id: 47, row: 8, col: 3 },
  { id: 48, row: 8, col: 2 },
  { id: 49, row: 8, col: 1 },
  { id: 50, row: 8, col: 0 },

  { id: 51, row: 7, col: 0 },
  { id: 52, row: 6, col: 0 },
];

// ✅ Victory lanes (MUST BE 6 CELLS)
export const HomePaths = {
  red: [
    { id: 101, row: 7, col: 1 },
    { id: 102, row: 7, col: 2 },
    { id: 103, row: 7, col: 3 },
    { id: 104, row: 7, col: 4 },
    { id: 105, row: 7, col: 5 },
    { id: 106, row: 7, col: 6 },
  ],

  green: [
    { id: 201, row: 1, col: 7 },
    { id: 202, row: 2, col: 7 },
    { id: 203, row: 3, col: 7 },
    { id: 204, row: 4, col: 7 },
    { id: 205, row: 5, col: 7 },
    { id: 206, row: 6, col: 7 },
  ],

  yellow: [
    { id: 301, row: 7, col: 13 },
    { id: 302, row: 7, col: 12 },
    { id: 303, row: 7, col: 11 },
    { id: 304, row: 7, col: 10 },
    { id: 305, row: 7, col: 9 },
    { id: 306, row: 7, col: 8 },
  ],

  blue: [
    { id: 401, row: 13, col: 7 },
    { id: 402, row: 12, col: 7 },
    { id: 403, row: 11, col: 7 },
    { id: 404, row: 10, col: 7 },
    { id: 405, row: 9, col: 7 },
    { id: 406, row: 8, col: 7 },
  ],
};

// ✅ Home token slots (your values are fine)
export const HomeTokenSlots = {
  red: [
    { row: 1.7, col: 1.6 },
    { row: 1.7, col: 3.5 },
    { row: 3.6, col: 1.7 },
    { row: 3.6, col: 3.5 },
  ],

  green: [
    { row: 1.6, col: 10.7 },
    { row: 1.6, col: 12.5 },
    { row: 3.5, col: 10.7 },
    { row: 3.5, col: 12.5 },
  ],

  yellow: [
    { row: 10.6, col: 10.7 },
    { row: 10.6, col: 12.5 },
    { row: 12.4, col: 10.7 },
    { row: 12.4, col: 12.5 },
  ],

  blue: [
    { row: 10.7, col: 1.7 },
    { row: 10.7, col: 3.5 },
    { row: 12.5, col: 1.7 },
    { row: 12.5, col: 3.5 },
  ],
};


export const getTokenPositionXY = (
  pos: number,
  cellSize: number
): { x: number; y: number } => {
  const main = MainPath.find((p) => p.id === pos);
  if (main) return getCellXY(cellSize, main.row, main.col);

  const red = HomePaths.red.find((p) => p.id === pos);
  if (red) return getCellXY(cellSize, red.row, red.col);

  const green = HomePaths.green.find((p) => p.id === pos);
  if (green) return getCellXY(cellSize, green.row, green.col);

  const yellow = HomePaths.yellow.find((p) => p.id === pos);
  if (yellow) return getCellXY(cellSize, yellow.row, yellow.col);

  const blue = HomePaths.blue.find((p) => p.id === pos);
  if (blue) return getCellXY(cellSize, blue.row, blue.col);

  return { x: 0, y: 0 };
};
