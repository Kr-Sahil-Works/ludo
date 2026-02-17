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
  Pressable,
} from "react-native";

import {
  playBG,
  stopBG,
  stopAllSound,
  setFXEnabled,
  setMusicEnabled,
  setAllSoundEnabled,
} from "@/src/utils/sound";


import { router, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";

import DiceRoll from "@/app/gameLogic/DiceRoll";
import GameSkeleton from "@/src/components/Loaders/GameSkeleton";
import LudoBoard from "@/app/gameLogic/LudoBoard";

import LottieView from "lottie-react-native";
import FireworkAnim from "@/src/assets/animation/firework.json";

import GamePauseModal from "@/app/Components&Modals/2passNplay/GamePauseModal";
import { clearSavedGame, setGameConfig } from "@/src/redux/gameSlice";

import {
  selectDiceValue,
  selectCurrentPlayer,
  selectPlayers,
  selectWinner,
} from "../../src/redux/selectors";

import { useGameLogic } from "@/src/hooks/useP2PGameLogic";
import WinnerCardModal from "@/app/Components&Modals/2passNplay/WinnerCardModal";

const GameBG = require("@/src/assets/images/ludogmbg.png");
const MenuIcon = require("@/src/assets/images/menu.png");

const RedToken = require("@/src/assets/images/piles/red_1024.png");
const GreenToken = require("@/src/assets/images/piles/green_1024.png");
const YellowToken = require("@/src/assets/images/piles/yellow_1024.png");
const BlueToken = require("@/src/assets/images/piles/blue_1024.png");

const { width } = Dimensions.get("window");

const BOX_W = width * 0.34;
const BOX_H = width * 0.18;

export default function PassNPlayGame() {
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();

  // ✅ CHECK IF RESUME GAME
  const isGameSaved = useSelector((state: any) => state.game.isGameSaved);

  // ✅ GET SAVED CONFIG FROM REDUX
  const savedColors = useSelector((state: any) => state.game.selectedColors);
  const savedMode = useSelector((state: any) => state.game.gameMode);

  // ✅ IF RESUME -> USE SAVED CONFIG
  // ✅ IF NEW GAME -> USE PARAMS
  const colorsRaw = isGameSaved
    ? savedColors.join(",")
    : String(params.colors || "red,green");

  const selectedColors = colorsRaw.split(",");

  const modeParam = isGameSaved
    ? savedMode
    : String(params.mode || "classic");

  const gameMode = modeParam === "quick" ? "quick" : "classic";

  // ✅ SAVE CONFIG ONLY FOR NEW GAME
  useEffect(() => {
    if (!isGameSaved) {
      dispatch(
        setGameConfig({
          gameMode,
          selectedColors,
          playerCount: selectedColors.length,
        })
      );
    }
  }, []);

  const diceValue = useSelector(selectDiceValue);
  const currentPlayer = useSelector(selectCurrentPlayer);
  const players = useSelector(selectPlayers);
  const winner = useSelector(selectWinner);

  const boardSize = Math.min(width * 0.95, height * 0.55);

  const [showFirework, setShowFirework] = useState(false);
  const [showTrophy, setShowTrophy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showPause, setShowPause] = useState(false);

  const [fxOn, setFxOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [allSoundOn, setAllSoundOn] = useState(true);

  

  // ✅ ACTIVE PLAYER INDEXES GENERATED ALWAYS FROM selectedColors
  const activePlayerIndexes: number[] = [];
  if (selectedColors.includes("red")) activePlayerIndexes.push(0);
  if (selectedColors.includes("green")) activePlayerIndexes.push(1);
  if (selectedColors.includes("yellow")) activePlayerIndexes.push(2);
  if (selectedColors.includes("blue")) activePlayerIndexes.push(3);

  const showRed = activePlayerIndexes.includes(0);
  const showGreen = activePlayerIndexes.includes(1);
  const showYellow = activePlayerIndexes.includes(2);
  const showBlue = activePlayerIndexes.includes(3);

  const triggerFirework = () => {
    setShowFirework(true);
    setTimeout(() => setShowFirework(false), 2500);
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
    gameMode,
    activePlayerIndexes,
  });

  // ✅ MENU SLIDE ANIM (START HIDDEN)
  const menuSlideAnim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(menuSlideAnim, {
        toValue: 22,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // shimmer animation
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

  // glow animation
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <GameSkeleton />;

  return (
    <ImageBackground source={GameBG} style={styles.container} resizeMode="cover">
      {/* TOP PLAYERS */}
      <View style={styles.topRow}>
        {showRed && (
          <View style={styles.playerOuter}>
            <Animated.View
              style={[
                styles.playerBoxSmall,
                currentPlayer === 0 && styles.activeBox,
                currentPlayer === 0 && activeGlowStyle,
              ]}
            >
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
        )}

        {showGreen && (
          <View style={styles.playerOuter}>
            <Animated.View
              style={[
                styles.playerBoxSmall,
                currentPlayer === 1 && styles.activeBox,
                currentPlayer === 1 && activeGlowStyle,
              ]}
            >
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
        )}
      </View>

      {/* MENU */}
      <Animated.View
        style={[
          styles.menuPeekWrapper,
          {
            transform: [{ translateX: menuSlideAnim }],
          },
        ]}
      >
        <Pressable
          style={styles.menuPeekBtn}
          onPress={() => {
            setShowPause(true);

            Animated.timing(menuSlideAnim, {
              toValue: 0,
              duration: 320,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }).start();
          }}
        >
          <Image source={MenuIcon} style={styles.menuPeekImg} />
        </Pressable>
      </Animated.View>

      {/* BOARD */}
      <View style={styles.boardContainer}>
        <LudoBoard
          boardSize={boardSize}
          players={players.filter((_, idx) => activePlayerIndexes.includes(idx))}
          onTokenPress={onTokenPress}
          diceValue={diceValue}
          currentPlayer={currentPlayer}
          movableTokens={movableTokens}
          cuttingTokenKey={cuttingTokenKey}
          activePlayerIndexes={activePlayerIndexes}
        />
      </View>

      {/* BOTTOM PLAYERS */}
      <View style={styles.bottomRow}>
        {showBlue && (
          <View style={styles.playerOuter}>
            <Animated.View
              style={[
                styles.playerBoxSmall,
                currentPlayer === 3 && styles.activeBox,
                currentPlayer === 3 && activeGlowStyle,
              ]}
            >
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
        )}

        {showYellow && (
          <View style={styles.playerOuter}>
            <Animated.View
              style={[
                styles.playerBoxSmall,
                currentPlayer === 2 && styles.activeBox,
                currentPlayer === 2 && activeGlowStyle,
              ]}
            >
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
        )}
      </View>

      {/* FIREWORK */}
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

  

<WinnerCardModal
  visible={showTrophy}
  winnerIndex={currentPlayer} // ✅ winner token index (0-3)
  onHome={() => {
    router.replace("/");
  }}
  onPlayAgain={() => {
    setShowTrophy(false);

    router.replace({
      pathname: "/gameScreens/PassNPlayGame",
      params: {
        mode: gameMode,
        colors: selectedColors.join(","),
        players: selectedColors.length.toString(),
      },
    });
  }}
/>







      {/* PAUSE MODAL */}
     <GamePauseModal
  visible={showPause}
  onClose={() => {
    setShowPause(false);

    Animated.timing(menuSlideAnim, {
      toValue: 22,
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }}
  mode={gameMode}
  fxOn={fxOn}
  musicOn={musicOn}
  allSoundOn={allSoundOn}
  onToggleFX={() => {
    const newVal = !fxOn;
    setFxOn(newVal);
    setFXEnabled(newVal);
  }}
  onToggleMusic={() => {
    const newVal = !musicOn;
    setMusicOn(newVal);
    setMusicEnabled(newVal);

    // ✅ if turned ON, play theme
    if (newVal) {
      playBG("home");
    } else {
      stopBG();
    }
  }}
  onToggleAllSound={() => {
    const newVal = !allSoundOn;
    setAllSoundOn(newVal);
    setAllSoundEnabled(newVal);

    // ✅ if turning OFF, force both off
    if (!newVal) {
      setFxOn(false);
      setMusicOn(false);
      setFXEnabled(false);
      setMusicEnabled(false);
      stopAllSound();
    } else {
      // turning ON restores FX default ON, music stays OFF
      setFxOn(true);
      setFXEnabled(true);

      setMusicOn(false);
      setMusicEnabled(false);
    }
  }}
  onExitGame={() => {
    dispatch(clearSavedGame());
    router.replace("/");
  }}
/>

    </ImageBackground>
  );
}

export const styles = StyleSheet.create({
  menuPeekWrapper: {
    position: "absolute",
    top: 50,
    right: -16,
    zIndex: 99999,
    elevation: 99999,
  },

  menuPeekBtn: {
    width: 55,
    height: 45,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  menuPeekImg: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  },

  diceSlot: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
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
