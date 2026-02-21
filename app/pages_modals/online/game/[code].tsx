import React, { useMemo, useState, useEffect } from "react";
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

import LudoBoardOnline from "@/app/gameLogic/online/LudoBoardOnline";
import { useOnlineGameLogic } from "@/src/hooks/useOnlineGameLogic";
import OnlineTurnBox from "@/app/gameLogic/online/OnlineTurnBox";
import DiceRoller from "@/app/gameLogic/online/OnlineDiceRoller"; // ✅ NEW

const RedToken = require("@/src/assets/images/piles/red_1024_transparent.png");
const GreenToken = require("@/src/assets/images/piles/green_1024_transparent.png");
const YellowToken = require("@/src/assets/images/piles/yellow_1024_transparent.png");
const BlueToken = require("@/src/assets/images/piles/blue_1024_transparent.png");

const BackIcon = require("@/src/assets/images/back.png");
const BgImage = require("@/src/assets/images/ludogmbg.png");

type PlayerLite = { userId: string };

export default function OnlineGameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const { code } = useLocalSearchParams<{ code?: string }>();
  const { user, isLoaded } = useUser();

  const roomCode = String(code || "").toUpperCase();
  const userId = user?.id ?? "";

  const data = useQuery(
    api.rooms.getRoom,
    roomCode ? { code: roomCode } : "skip"
  );

  // 🔥 dice animation state
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [lastDiceValue, setLastDiceValue] = useState(1);

  // 🔥 ULTRA DEVICE SAFE VALUES
  const boardSize = Math.min(width * 0.92, height * 0.58);
  const topSafe = Math.max(90, height * 0.1);
  const bottomSafe = Math.max(24, height * 0.035);

  // ✅ responsive styles
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
        marginTop: topSafe,
      },
      diceWrapper: {
        position: "absolute",
        bottom: bottomSafe + 90,
        alignSelf: "center",
        zIndex: 9999,
      },
      loadingText: {
        fontSize: 16,
        fontWeight: "900",
        color: "#fff",
      },
    });
  }, [topSafe, bottomSafe]);

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
    lastMoveSteps,
    lastMovePlayerIndex,
    lastMoveTokenIndex,
  } = useOnlineGameLogic({
    roomCode,
    userId,
    room: safeRoom,
    players: safePlayers,
    triggerFirework: () => {},
    triggerTrophy: () => {},
  });

  // 🔥 sync dice animation with server value
  useEffect(() => {
    if (!diceValue) return;

    setLastDiceValue(diceValue);
    setIsDiceRolling(false);
  }, [diceValue]);

  // 🔥 wrapped roll handler (PART 4 FIX)
  const handleRoll = async () => {
    if (!canRollDice) return;

    setIsDiceRolling(true);
    await roll(); // server call happens inside hook
  };

  // ---------------- LOADING ----------------

  if (!isLoaded || !safeState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const activePlayerIndexes = safePlayers.map(
    (_: PlayerLite, i: number) => i
  );

  const currentPlayer = safePlayers[currentPlayerIndex];
  const turnColor = currentPlayer?.color ?? "red";

  const tokenMap: Record<string, any> = {
    red: RedToken,
    green: GreenToken,
    yellow: YellowToken,
    blue: BlueToken,
  };

  const tokenImage = tokenMap[turnColor] ?? RedToken;
  const isActiveTurn = currentPlayer?.userId === userId;

  // ---------------- UI ----------------

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
          lastMoveSteps={lastMoveSteps}
          lastMovePlayerIndex={lastMovePlayerIndex}
          lastMoveTokenIndex={lastMoveTokenIndex}
        />
      </View>

      {/* TURN BOX */}
      <View
        style={{
          position: "absolute",
          bottom: bottomSafe,
          alignSelf: "center",
          zIndex: 9999,
        }}
      >
      <OnlineTurnBox
  color={turnColor}
  diceValue={lastDiceValue}
  isActive={isActiveTurn}
  isMyTurn={isActiveTurn}
  disabled={!canRollDice || !isActiveTurn}
  onRoll={handleRoll}
  isRolling={isDiceRolling}
/>
      </View>
    </View>
  );
}