import { createSlice } from "@reduxjs/toolkit";
import { colorPlayer } from "../helpers/PlotData";
import { Colors } from "../constants/Colors";

const initialState = {
  diceValue: 1,
  currentPlayer: 0,
  winner: null,

  players: [
    { name: "Red", color: Colors.red, tokens: [0, 0, 0, 0] },
    { name: "Green", color: Colors.green, tokens: [0, 0, 0, 0] },
    { name: "Yellow", color: Colors.yellow, tokens: [0, 0, 0, 0] },
    { name: "Blue", color: Colors.blue, tokens: [0, 0, 0, 0] },
  ],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    rollDice: (state, action) => {
      state.diceValue = action.payload;
    },

    nextTurn: (state) => {
      state.currentPlayer = (state.currentPlayer + 1) % 4;
    },

    moveToken: (state, action) => {
      const { playerIndex, tokenIndex, newPosition } = action.payload;
      state.players[playerIndex].tokens[tokenIndex] = newPosition;
    },

    setWinner: (state, action) => {
      state.winner = action.payload;
    },

    resetGame: () => initialState,
  },
});

export const { rollDice, nextTurn, moveToken, setWinner, resetGame } =
  gameSlice.actions;

export default gameSlice.reducer;
