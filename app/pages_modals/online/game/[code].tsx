import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import LudoBoard from "@/app/gameLogic/LudoBoard";
import DiceRoll from "@/app/gameLogic/DiceRoll";
import { useOnlineGameLogic } from "@/src/hooks/useOnlineGameLogic";

import { useUser } from "@clerk/clerk-expo";

const BackIcon = require("@/src/assets/images/back.png");

// ✅ ADD YOUR BACKGROUND IMAGE HERE
const BgImage = require("@/src/assets/images/ludogmbg.png"); // change path if needed

export default function OnlineGameScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();

  const { user, isLoaded } = useUser();

  const roomCode = String(code || "").toUpperCase();

  const data = useQuery(
    api.rooms.getRoom,
    roomCode ? { code: roomCode } : "skip"
  );

  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      },

      bg: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        opacity: 0.9,
      },

      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
      },

      title: {
        position: "absolute",
        top: 55,
        fontSize: 18,
        fontWeight: "900",
        color: "#ffd24a",
        textTransform: "uppercase",
        zIndex: 20,
      },

      backBtn: {
        position: "absolute",
        left: 18,
        top: 45,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      },

      backIcon: {
        width: 55,
        height: 55,
        resizeMode: "contain",
      },

      diceWrap: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        width: 110,
        height: 110,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
        borderWidth: 3,
        borderColor: "#ffd24a",
        borderRadius: 22,
        zIndex: 30,
      },

      loadingText: {
        fontSize: 16,
        fontWeight: "900",
        color: "#fff",
      },

      debugText: {
        position: "absolute",
        top: 90,
        color: "white",
        fontWeight: "800",
        fontSize: 12,
        zIndex: 30,
      },
    });
  }, []);

  // wait clerk
  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user...</Text>
      </View>
    );
  }

  const userId = user?.id;

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Login required</Text>
      </View>
    );
  }

  if (data === undefined) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Room not found</Text>
      </View>
    );
  }

  const { room, players } = data;

  const state = room.gameState;

  if (!state) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Game not started</Text>
      </View>
    );
  }

  const boardSize = 330;

  const activePlayerIndexes = state.players.map((_: any, i: number) => i);

  const triggerFirework = () => {};
  const triggerTrophy = () => {};

  const {
    roll,
    onTokenPress,
    canRollDice,
    movableTokens,
    diceValue,
    currentPlayerIndex,
    cuttingTokenKey,
  } = useOnlineGameLogic({
    roomCode,
    userId,
    room,
    players,
    triggerFirework,
    triggerTrophy,
  });

  return (
    <View style={styles.container}>
      {/* ✅ BG */}
      <Image source={BgImage} style={styles.bg} />
      <View style={styles.overlay} />

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Image source={BackIcon} style={styles.backIcon} />
      </Pressable>

      <Text style={styles.title}>ONLINE GAME : {roomCode}</Text>

      {/* DEBUG TURN INFO */}
      <Text style={styles.debugText}>
        TURN: {room.turnUserId} | ME: {userId} | CANROLL:{" "}
        {String(canRollDice)}
      </Text>

      {/* BOARD */}
      <LudoBoard
        boardSize={boardSize}
        players={state.players}
        onTokenPress={onTokenPress}
        diceValue={diceValue}
        currentPlayer={currentPlayerIndex}
        movableTokens={movableTokens}
        cuttingTokenKey={cuttingTokenKey}
        activePlayerIndexes={activePlayerIndexes}
      />

      {/* DICE */}
      <View style={styles.diceWrap}>
        <DiceRoll
          displayDice={diceValue}
          disabled={!canRollDice}
          onFinish={roll}
        />
      </View>
    </View>
  );
}
