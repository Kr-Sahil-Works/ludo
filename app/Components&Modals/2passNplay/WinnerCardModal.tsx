import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Image,
  Easing,
} from "react-native";

import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";

const TrophyAnim = require("@/src/assets/animation/trophy.json");
const SparkAnim = require("@/src/assets/animation/gold_spark.json");

const { width } = Dimensions.get("window");

const RedToken = require("@/src/assets/images/piles/red_1024.png");
const GreenToken = require("@/src/assets/images/piles/green_1024.png");
const YellowToken = require("@/src/assets/images/piles/yellow_1024.png");
const BlueToken = require("@/src/assets/images/piles/blue_1024.png");

const getWinnerTokenImage = (index: number) => {
  if (index === 0) return RedToken;
  if (index === 1) return GreenToken;
  if (index === 2) return YellowToken;
  return BlueToken;
};

type Props = {
  visible: boolean;
  winnerIndex: number;

  onHome: () => void;
  onPlayAgain: () => void;
};

export default function WinnerCardModal({
  visible,
  winnerIndex,
  onHome,
  onPlayAgain,
}: Props) {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ⭐ shimmer animation
  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  // ⏳ auto close timer
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;

    slideAnim.setValue(500);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();

    // ⭐ shimmer loop
    shimmerAnim.setValue(-300);
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 400,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    shimmerLoop.start();

    // ⏳ auto close after 20 sec
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);

    autoCloseTimer.current = setTimeout(() => {
      onHome();
    }, 400000);

    return () => {
      shimmerLoop.stop();

      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, [visible]);

  const stopAutoClose = () => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
  };

  const getWinnerText = () => {
    if (winnerIndex === 0) return "RED WINS";
    if (winnerIndex === 1) return "GREEN WINS";
    if (winnerIndex === 2) return "YELLOW WINS";
    return "BLUE WINS";
  };

  const getWinnerGlow = () => {
    if (winnerIndex === 0) return "rgba(255,50,50,0.95)";
    if (winnerIndex === 1) return "rgba(0,255,90,0.95)";
    if (winnerIndex === 2) return "rgba(255,220,0,0.95)";
    return "rgba(0,170,255,0.95)";
  };

  const getWinnerLine = () => {
    if (winnerIndex === 0) return "I am fast lol 🔥";
    if (winnerIndex === 1) return "I am unstoppable here 😈";
    if (winnerIndex === 2) return "I am best 👑";
    return "Blue is always cool 😎";
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.dimLayer} />

        {/* 🏆 TROPHY ABOVE CARD */}
        <View style={styles.trophyWrapper} pointerEvents="none">
          <LottieView
            source={TrophyAnim}
            autoPlay
            loop={true}
            style={styles.trophyAnim}
          />
        </View>

        {/* CARD */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.wonText, { color: getWinnerGlow() }]}>
            {getWinnerText()}
          </Text>

          {/* ⭐ WINNER BOX PREMIUM */}
          <View style={styles.winnerBoxWrap}>

            <View style={styles.winnerBox}>
              {/* ⭐ shimmer */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmerLine,
                  {
                    transform: [{ translateX: shimmerAnim }, { rotate: "25deg" }],
                  },
                ]}
              />

              {/* ✨ GOLD SPARK */}
              <LottieView
                source={SparkAnim}
                autoPlay
                loop
                style={styles.spark}
              />

              <View style={styles.tokenCircle}>
                <Image
                  source={getWinnerTokenImage(winnerIndex)}
                  style={styles.tokenImg}
                />
              </View>

              <View>
                <Text style={styles.winnerTitle}>{getWinnerLine()}</Text>
              </View>
            </View>
          </View>

          {/* BUTTONS */}
          <Pressable
            style={styles.playAgainBtn}
            onPress={() => {
              stopAutoClose();
              onPlayAgain();
            }}
          >
            <Text style={styles.playAgainText}>PLAY AGAIN</Text>
          </Pressable>

          <Pressable
            style={styles.homeBtn}
            onPress={() => {
              stopAutoClose();
              onHome();
            }}
          >
            <Text style={styles.homeText}>HOME</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  trophyWrapper: {
    position: "absolute",
    bottom: 35 + 350,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    elevation: 999999,
  },

  trophyAnim: {
    width: width * 0.85,
    height: width * 0.85,
  },

  card: {
    width: width * 0.92,
    borderRadius: 22,
  backgroundColor: "rgba(0,0,0,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 18,
    marginBottom: 35,
    zIndex: 99999,
    elevation: 99999,
  },

  wonText: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },

  winnerBoxWrap: {
    position: "relative",
    marginBottom: 22,
  },

  goldGlow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 22,
      backgroundColor: "rgba(255,200,0,0.15)",
  },

winnerBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.72)",
  borderRadius: 18,
  padding: 14,
  marginBottom: 22,
  borderWidth: 2,
  borderColor: "rgba(255,220,0,0.85)",
  overflow: "hidden",
},


 shimmerLine: {
  position: "absolute",
  top: -120,
  left: -250,
  width: 140,
  height: 500,
  borderRadius: 200,
  backgroundColor: "rgba(255,220,0,0.22)",
},


  spark: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    zIndex: 999999,
  },

  tokenCircle: {
    width: 62,
    height: 62,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,220,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  tokenImg: {
    width: 55,
    height: 55,
    resizeMode: "contain",
  },

  winnerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },

  playAgainBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,220,0,0.95)",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255,220,0,0.12)",
  },

  playAgainText: {
    color: "rgba(255,220,0,0.95)",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },

  homeBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,70,70,0.95)",
    alignItems: "center",
    backgroundColor: "rgba(255,70,70,0.12)",
  },

  homeText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
});
