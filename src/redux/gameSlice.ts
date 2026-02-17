import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Colors } from "../constants/Colors";

type Player = {
  name: string;
  color: string;
  tokens: number[];
  killedCount: number;
};

export type GameState = {
  diceValue: number;
  lastDiceValue: number;
  currentPlayer: number;
  winner: string | null;
  players: Player[];
  selectedToken: number | null;

  // ✅ Resume System
  isGameSaved: boolean;
  gameMode: "quick" | "classic";
  selectedColors: string[];
  playerCount: number;

  // ✅ IMPORTANT (FIX COLOR SWAP BUG)
  activePlayerIndexes: number[];
};

const initialState: GameState = {
  diceValue: 0,
  lastDiceValue: 0,
  currentPlayer: 0,
  winner: null,
  selectedToken: null,

  isGameSaved: false,
  gameMode: "classic",
  selectedColors: ["red", "green"],
  playerCount: 2,

  activePlayerIndexes: [0, 1], // red green default

  players: [
    { name: "Red", color: Colors.red, tokens: [0, 0, 0, 0], killedCount: 0 },
    { name: "Green", color: Colors.green, tokens: [0, 0, 0, 0], killedCount: 0 },
    { name: "Yellow", color: Colors.yellow, tokens: [0, 0, 0, 0], killedCount: 0 },
    { name: "Blue", color: Colors.blue, tokens: [0, 0, 0, 0], killedCount: 0 },
  ],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    rollDice: (state, action: PayloadAction<number>) => {
      state.diceValue = action.payload;

      if (action.payload > 0) {
        state.lastDiceValue = action.payload;
      }
    },

    nextTurn: (state) => {
      state.currentPlayer = (state.currentPlayer + 1) % 4;
      state.selectedToken = null;
      state.diceValue = 0;
      state.lastDiceValue = 0;
    },

    selectToken: (state, action: PayloadAction<number>) => {
      state.selectedToken = action.payload;
    },

    moveToken: (
      state,
      action: PayloadAction<{
        playerIndex: number;
        tokenIndex: number;
        newPosition: number;
      }>
    ) => {
      const { playerIndex, tokenIndex, newPosition } = action.payload;
      state.players[playerIndex].tokens[tokenIndex] = newPosition;
      state.isGameSaved = true;
    },

    resetToken: (
      state,
      action: PayloadAction<{
        playerIndex: number;
        tokenIndex: number;
      }>
    ) => {
      const { playerIndex, tokenIndex } = action.payload;
      state.players[playerIndex].tokens[tokenIndex] = 0;
      state.isGameSaved = true;
    },

    increaseKillCount: (
      state,
      action: PayloadAction<{
        playerIndex: number;
      }>
    ) => {
      const { playerIndex } = action.payload;
      state.players[playerIndex].killedCount += 1;
      state.isGameSaved = true;
    },

    setWinner: (state, action: PayloadAction<string | null>) => {
      state.winner = action.payload;

      if (action.payload) {
        state.isGameSaved = false;
      }
    },

    // ✅ SAVE GAME SETTINGS WHEN GAME STARTS
    setGameConfig: (
      state,
      action: PayloadAction<{
        gameMode: "quick" | "classic";
        selectedColors: string[];
        playerCount: number;
      }>
    ) => {
      state.gameMode = action.payload.gameMode;
      state.selectedColors = action.payload.selectedColors;
      state.playerCount = action.payload.playerCount;

      // ✅ SAVE ACTIVE PLAYER INDEXES (FIX RESUME COLOR SWAP)
      const map: any = {
        red: 0,
        green: 1,
        yellow: 2,
        blue: 3,
      };

      state.activePlayerIndexes = action.payload.selectedColors.map(
        (c) => map[c.toLowerCase()]
      );

      state.isGameSaved = true;
    },

    loadSavedGameState: (state, action: PayloadAction<GameState>) => {
      return action.payload;
    },

    clearSavedGame: (state) => {
      state.diceValue = 0;
      state.lastDiceValue = 0;
      state.currentPlayer = 0;
      state.winner = null;
      state.selectedToken = null;

      state.isGameSaved = false;

      state.gameMode = "classic";
      state.selectedColors = ["red", "green"];
      state.playerCount = 2;

      state.activePlayerIndexes = [0, 1];

      state.players = JSON.parse(JSON.stringify(initialState.players));
    },

    resetGame: () => {
      return JSON.parse(JSON.stringify(initialState));
    },
  },
});

export const {
  rollDice,
  nextTurn,
  moveToken,
  setWinner,
  resetGame,
  selectToken,
  resetToken,
  increaseKillCount,

  setGameConfig,
  loadSavedGameState,
  clearSavedGame,
} = gameSlice.actions;

export default gameSlice.reducer;
