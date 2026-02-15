import { RootState } from "./store";

export const selectDiceValue = (state: RootState) => state.game.diceValue;
export const selectLastDiceValue = (state: RootState) =>
  state.game.lastDiceValue; // ✅ NEW

export const selectCurrentPlayer = (state: RootState) =>
  state.game.currentPlayer;

export const selectPlayers = (state: RootState) => state.game.players;

export const selectWinner = (state: RootState) => state.game.winner;

export const selectSelectedToken = (state: RootState) =>
  state.game.selectedToken;
