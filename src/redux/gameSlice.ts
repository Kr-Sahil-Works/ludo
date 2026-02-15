import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Colors } from "../constants/Colors";

type Player = {
  name: string;
  color: string;
  tokens: number[];
  killedCount: number;
};

type GameState = {
  diceValue: number;
  lastDiceValue: number; // ✅ NEW
  currentPlayer: number;
  winner: string | null;
  players: Player[];
  selectedToken: number | null;
};

const initialState: GameState = {
  diceValue: 0,
  lastDiceValue: 0, // ✅ NEW
  currentPlayer: 0,
  winner: null,
  selectedToken: null,

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

      // ✅ store last dice ONLY if valid roll
      if (action.payload > 0) {
        state.lastDiceValue = action.payload;
      }
    },

    nextTurn: (state) => {
      state.currentPlayer = (state.currentPlayer + 1) % 4;
      state.selectedToken = null;

      // ✅ reset dice
      state.diceValue = 0;

      // ✅ IMPORTANT: clear lastDiceValue so new player doesn't flash old dice
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
    },

    increaseKillCount: (
      state,
      action: PayloadAction<{
        playerIndex: number;
      }>
    ) => {
      const { playerIndex } = action.payload;
      state.players[playerIndex].killedCount += 1;
    },

    setWinner: (state, action: PayloadAction<string | null>) => {
      state.winner = action.payload;
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
} = gameSlice.actions;

export default gameSlice.reducer;
