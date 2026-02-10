import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";

import {
  rollDice,
  nextTurn,
  moveToken,
  setWinner,
} from "../src/redux/gameSlice";

import {
  selectDiceValue,
  selectCurrentPlayer,
  selectPlayers,
  selectWinner,
} from "../src/redux/selectors";

import { BackgroundImage } from "../src/helpers/GetIcons";
import { startingPoints } from "../src/helpers/PlotData";

const GameBG = require("../src/assets/images/ludo-bg2.png");

export default function GameScreen() {
  const dispatch = useDispatch();

  const diceValue = useSelector(selectDiceValue);
  const currentPlayer = useSelector(selectCurrentPlayer);
  const players = useSelector(selectPlayers);
  const winner = useSelector(selectWinner);

  const roll = useCallback(() => {
    if (winner) return;

    const random = Math.floor(Math.random() * 6) + 1;
    dispatch(rollDice(random));
  }, [winner]);

  const handleMove = useCallback(() => {
    if (winner) return;

    const player = players[Number(currentPlayer)];

    // move first token only (simple demo)
    let tokenPos = player.tokens[0];

    // if token is at home
    if (tokenPos === 0) {
      if (diceValue === 6) {
        tokenPos = startingPoints[currentPlayer];
        dispatch(moveToken({ playerIndex: currentPlayer, tokenIndex: 0, newPosition: tokenPos }));
      } else {
        dispatch(nextTurn());
      }
      return;
    }

    // normal move
    tokenPos = tokenPos + diceValue;

    dispatch(moveToken({ playerIndex: currentPlayer, tokenIndex: 0, newPosition: tokenPos }));

    // winner check
    if (tokenPos >= 60) {
      dispatch(setWinner(player.name));
      return;
    }

    if (diceValue !== 6) {
      dispatch(nextTurn());
    }
  }, [diceValue, currentPlayer, players, winner]);

  return (
    <ImageBackground source={GameBG} style={styles.container} resizeMode="cover">
      <Text style={styles.heading}>LUDO OFFLINE</Text>

      {/* Winner */}
      {winner && (
        <View style={styles.winnerBox}>
          <Text style={styles.winnerText}>🏆 Winner: {winner}</Text>
        </View>
      )}

      {/* Dice */}
      <View style={styles.diceBox}>
        <Image source={BackgroundImage.GetImage(diceValue)} style={styles.diceImg} />
      </View>

      {/* Current Player */}
      <View style={styles.turnBox}>
        <Text style={styles.turnText}>
          Turn: {players[currentPlayer].name}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={roll}>
          <Text style={styles.btnText}>ROLL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn2} onPress={handleMove}>
          <Text style={styles.btnText}>MOVE</Text>
        </TouchableOpacity>
      </View>

      {/* Tokens */}
      <View style={styles.tokensBox}>
       {players.map((p: any, index: number) => (
          <View key={index} style={styles.playerRow}>
            <Text style={[styles.playerName, { color: p.color }]}>
              {p.name}:
            </Text>
            <Text style={styles.posText}>{p.tokens.join(" , ")}</Text>
          </View>
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
  },

  heading: {
    fontSize: 22,
    fontWeight: "900",
    color: "white",
    letterSpacing: 2,
    marginBottom: 20,
  },

  diceBox: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 15,
  },

  diceImg: {
    width: 65,
    height: 65,
    resizeMode: "contain",
  },

  turnBox: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 20,
  },

  turnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },

  btnRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },

  btn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  btn2: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 18,
    backgroundColor: "rgba(0,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.35)",
  },

  btnText: {
    color: "white",
    fontWeight: "900",
    letterSpacing: 1,
  },

  tokensBox: {
    width: "90%",
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  playerRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  playerName: {
    width: 80,
    fontWeight: "900",
  },

  posText: {
    color: "white",
    fontWeight: "700",
  },

  winnerBox: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0,255,255,0.20)",
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.40)",
    marginBottom: 15,
  },

  winnerText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
