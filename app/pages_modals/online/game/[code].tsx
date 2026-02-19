import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";

import LudoBoardOnline from "@/app/gameLogic/LudoBoardOnline";
import { useOnlineGameLogic } from "@/src/hooks/useOnlineGameLogic";
import OnlineTurnBox from "@/app/gameLogic/OnlineTurnBox";

const RedToken = require("@/src/assets/images/piles/red_1024_transparent.png");
const GreenToken = require("@/src/assets/images/piles/green_1024_transparent.png");
const YellowToken = require("@/src/assets/images/piles/yellow_1024_transparent.png");
const BlueToken = require("@/src/assets/images/piles/blue_1024_transparent.png");

const BackIcon = require("@/src/assets/images/back.png");
const BgImage = require("@/src/assets/images/ludogmbg.png");

export default function OnlineGameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { user, isLoaded } = useUser();

  const roomCode = String(code || "").toUpperCase();
  const userId = user?.id ?? "";

  const data = useQuery(
    api.rooms.getRoom,
    roomCode ? { code: roomCode } : "skip"
  );

  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      },
      bg: {
        ...StyleSheet.absoluteFillObject,
      },
      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
      },
      backBtn: {
        position: "absolute",
        left: 15,
        top: 55,
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
      titleWrap: {
        position: "absolute",
        top: 65,
        alignItems: "center",
      },
      title: {
        fontSize: 24,
        fontWeight: "900",
        color: "#ffd24a",
        letterSpacing: 1.5,
      },
      boardWrapper: {
        marginTop: 150,
      },
      loadingText: {
        fontSize: 16,
        fontWeight: "900",
        color: "#fff",
      },
    });
  }, []);

  // -------- SAFE VALUES --------

  const safeRoom = data?.room ?? null;
  const safeState = safeRoom?.gameState ?? null;
  const safePlayers = safeState?.players ?? [];

  const {
    roll,
    onTokenPress,
    canRollDice,
    movableTokens,
    diceValue,
    cuttingTokenKey,
    currentPlayerIndex,
    isMyTurn,
  } = useOnlineGameLogic({
    roomCode,
    userId,
    room: safeRoom,
    players: safePlayers,
    triggerFirework: () => {},
    triggerTrophy: () => {},
  });

  if (!isLoaded || !safeState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const boardSize = width * 0.92;
  const activePlayerIndexes = safePlayers.map((_: any, i: number) => i);
  const currentPlayer = safePlayers[currentPlayerIndex];
  const turnColor = currentPlayer?.color ?? "red";

  // ✅ map token image cleanly
  const tokenMap: Record<string, any> = {
    red: RedToken,
    green: GreenToken,
    yellow: YellowToken,
    blue: BlueToken,
  };

  const tokenImage = tokenMap[turnColor] ?? RedToken;

  // ✅ only active player box should look active
  const isActiveTurn = currentPlayer?.userId === userId;

  return (
    <View style={styles.container}>
      <ImageBackground source={BgImage} style={styles.bg} resizeMode="cover" />
      <View style={styles.overlay} />

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Image source={BackIcon} style={styles.backIcon} />
      </Pressable>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>ONLINE GAME</Text>
      </View>

      <View style={styles.boardWrapper}>
        <LudoBoardOnline
          boardSize={boardSize}
          players={safePlayers}
          onTokenPress={onTokenPress}
          diceValue={diceValue}
          currentPlayer={currentPlayerIndex}
          movableTokens={movableTokens}
          cuttingTokenKey={cuttingTokenKey}
          activePlayerIndexes={activePlayerIndexes}
        />
      </View>

      {/* TURN BOX */}
      <View
        style={{
          position: "absolute",
          bottom: 40,
          alignSelf: "center",
        }}
      >
        <OnlineTurnBox
          tokenImage={tokenImage}
          color={turnColor}
          diceValue={diceValue}
          isActive={isActiveTurn}
          isMyTurn={isActiveTurn}
          disabled={!canRollDice || !isActiveTurn}
          onRoll={roll}
        />
      </View>
    </View>
  );
}
