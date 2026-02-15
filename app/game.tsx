import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  ImageBackground,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";

import DiceRoll from "../src/components/DiceRoll";
import GameSkeleton from "../src/components/GameSkeleton";
import LudoBoard from "../src/components/LudoBoard";

import LottieView from "lottie-react-native";
import FireworkAnim from "../src/assets/animation/firework.json";
import TrophyAnim from "../src/assets/animation/trophy.json";

import {
  selectDiceValue,
  selectCurrentPlayer,
  selectPlayers,
  selectWinner,
} from "../src/redux/selectors";

import { useGameLogic } from "../src/hooks/useGameLogic";

const GameBG = require("../src/assets/images/ludogmbg.png");

const RedToken = require("../src/assets/images/piles/red_1024.png");
const GreenToken = require("../src/assets/images/piles/green_1024.png");
const YellowToken = require("../src/assets/images/piles/yellow_1024.png");
const BlueToken = require("../src/assets/images/piles/blue_1024.png");

const { width } = Dimensions.get("window");

const BOX_W = width * 0.34;
const BOX_H = width * 0.18;

export default function GameScreen() {
  const { width, height } = useWindowDimensions();

  const diceValue = useSelector(selectDiceValue);
  const currentPlayer = useSelector(selectCurrentPlayer);
  const players = useSelector(selectPlayers);
  const winner = useSelector(selectWinner);

  const boardSize = Math.min(width * 0.95, height * 0.55);

  const [showFirework, setShowFirework] = useState(false);
  const [showTrophy, setShowTrophy] = useState(false);

  const triggerFirework = () => {
    setShowFirework(true);

    setTimeout(() => {
      setShowFirework(false);
    }, 2500);
  };

  const triggerTrophy = () => {
    setShowTrophy(true);
  };

  const {
    roll,
    onTokenPress,
    canRollDice,
    movableTokens,
    lastDiceValue,
    cuttingTokenKey,
  } = useGameLogic({
    diceValue,
    currentPlayer,
    players,
    winner,
    triggerFirework,
    triggerTrophy,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const shimmerAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    shimmerAnim.setValue(-100);

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 180,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const activeGlowStyle = {
    borderColor: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(0,255,255,0.4)", "rgba(0,255,255,1)"],
    }),
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 22],
    }),
  };

  if (loading) return <GameSkeleton />;

  return (
    <ImageBackground source={GameBG} style={styles.container} resizeMode="cover">
      {/* TOP PLAYERS */}
      <View style={styles.topRow}>
        {/* RED */}
        <View style={styles.playerOuter}>
          <Animated.View
            style={[
              styles.playerBoxSmall,
              currentPlayer === 0 && styles.activeBox,
              currentPlayer === 0 && activeGlowStyle,
            ]}
          >
            {currentPlayer === 0 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmerLine,
                  {
                    transform: [
                      { translateX: shimmerAnim },
                      { rotate: "25deg" },
                    ],
                  },
                ]}
              />
            )}

            <View style={styles.boxRow}>
              <Image source={RedToken} style={styles.bigToken} />

              <View style={styles.diceSlotBorder}>
                <View style={styles.diceSlot}>
                  {currentPlayer === 0 ? (
                    <DiceRoll
                      displayDice={diceValue > 0 ? diceValue : lastDiceValue}
                      onFinish={roll}
                      disabled={!canRollDice}
                    />
                  ) : null}
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* GREEN */}
        <View style={styles.playerOuter}>
          <Animated.View
            style={[
              styles.playerBoxSmall,
              currentPlayer === 1 && styles.activeBox,
              currentPlayer === 1 && activeGlowStyle,
            ]}
          >
            {currentPlayer === 1 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmerLine,
                  {
                    transform: [
                      { translateX: shimmerAnim },
                      { rotate: "25deg" },
                    ],
                  },
                ]}
              />
            )}

            <View style={styles.boxRow}>
              <Image source={GreenToken} style={styles.bigToken} />

              <View style={styles.diceSlotBorder}>
                <View style={styles.diceSlot}>
                  {currentPlayer === 1 ? (
                    <DiceRoll
                      displayDice={diceValue > 0 ? diceValue : lastDiceValue}
                      onFinish={roll}
                      disabled={!canRollDice}
                    />
                  ) : null}
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* BOARD */}
      <View style={styles.boardContainer}>
        <LudoBoard
          boardSize={boardSize}
          players={players}
          onTokenPress={onTokenPress}
          diceValue={diceValue}
          currentPlayer={currentPlayer}
          movableTokens={movableTokens}
          cuttingTokenKey={cuttingTokenKey}
        />
      </View>

      {/* BOTTOM PLAYERS */}
      <View style={styles.bottomRow}>
        {/* BLUE */}
        <View style={styles.playerOuter}>
          <Animated.View
            style={[
              styles.playerBoxSmall,
              currentPlayer === 3 && styles.activeBox,
              currentPlayer === 3 && activeGlowStyle,
            ]}
          >
            {currentPlayer === 3 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmerLine,
                  {
                    transform: [
                      { translateX: shimmerAnim },
                      { rotate: "25deg" },
                    ],
                  },
                ]}
              />
            )}

            <View style={styles.boxRow}>
              <Image source={BlueToken} style={styles.bigToken} />

              <View style={styles.diceSlotBorder}>
                <View style={styles.diceSlot}>
                  {currentPlayer === 3 ? (
                    <DiceRoll
                      displayDice={diceValue > 0 ? diceValue : lastDiceValue}
                      onFinish={roll}
                      disabled={!canRollDice}
                    />
                  ) : null}
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* YELLOW */}
        <View style={styles.playerOuter}>
          <Animated.View
            style={[
              styles.playerBoxSmall,
              currentPlayer === 2 && styles.activeBox,
              currentPlayer === 2 && activeGlowStyle,
            ]}
          >
            {currentPlayer === 2 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmerLine,
                  {
                    transform: [
                      { translateX: shimmerAnim },
                      { rotate: "25deg" },
                    ],
                  },
                ]}
              />
            )}

            <View style={styles.boxRow}>
              <Image source={YellowToken} style={styles.bigToken} />

              <View style={styles.diceSlotBorder}>
                <View style={styles.diceSlot}>
                  {currentPlayer === 2 ? (
                    <DiceRoll
                      displayDice={diceValue > 0 ? diceValue : lastDiceValue}
                      onFinish={roll}
                      disabled={!canRollDice}
                    />
                  ) : null}
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* 🎆 FIREWORK ANIMATION */}
      {showFirework && (
        <View style={styles.fireworkOverlay} pointerEvents="none">
          <LottieView
            source={FireworkAnim}
            autoPlay
            loop={false}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      )}

      {/* 🏆 TROPHY WINNER ANIMATION */}
      {showTrophy && (
        <View style={styles.trophyOverlay} pointerEvents="none">
          <LottieView
            source={TrophyAnim}
            autoPlay
            loop={true}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      )}
    </ImageBackground>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
  },

  topRow: {
    width: "94%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  bottomRow: {
    width: "94%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  boardContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },

  playerOuter: {
    borderRadius: 18,
    overflow: "hidden",
  },

  playerBoxSmall: {
    width: BOX_W,
    height: BOX_H,
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
  },

  activeBox: {
    backgroundColor: "rgba(0,255,255,0.06)",
    borderColor: "rgba(0,255,255,0.75)",
    shadowColor: "#00ffff",
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 25,
  },

  boxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
  },

  bigToken: {
    width: BOX_H * 0.75,
    height: BOX_H * 0.75,
    resizeMode: "contain",
  },

  diceSlotBorder: {
    width: BOX_H * 0.62,
    height: BOX_H * 0.62,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(0,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  diceSlot: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    backgroundColor: "transparent",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  shimmerLine: {
    position: "absolute",
    top: -BOX_H * 0.25,
    left: -BOX_W * 0.35,
    width: BOX_W * 0.18,
    height: BOX_H * 1.6,
    borderRadius: 60,
    zIndex: 10,
    backgroundColor: "rgba(14, 161, 169, 0.18)",
    shadowColor: "#00ffff",
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 20,
  },

  fireworkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 999999,
  },

  trophyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999999,
    elevation: 9999999,
  },
});
