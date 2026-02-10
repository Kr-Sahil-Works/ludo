import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, TouchableOpacity, Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { playSound } from "../utils/sound";

const GradientButton = ({ title, onPress, tokenColor = "#d5be3e" }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(-200)).current;

  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 300,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(shineAnim, {
          toValue: -200,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const onPressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const getIconName = () => {
    if (title === "RESUME") return "play-circle-outline";
    if (title === "NEW GAME") return "game-controller-outline";
    if (title === "VS COMPUTER") return "hardware-chip-outline";
    if (title === "PLAY ONLINE") return "wifi-outline";
    if (title === "HOME") return "home-outline";
    return "sparkles-outline";
  };

  return (
    <Animated.View style={[styles.mainContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          playSound("ui");
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.touchable}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Shine effect */}
          <Animated.View
            style={[
              styles.shine,
              {
                transform: [{ translateX: shineAnim }, { rotate: "20deg" }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0.35)",
                "rgba(255,255,255,0)",
              ]}
              style={styles.shineGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>

          {/* Glass Icon */}
          <View style={styles.glassIconWrapper}>
            <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
              <View style={styles.glassOverlay} />
            {/* Glow Behind Icon */}
            {pressed && (
              <View
                style={[
                  styles.tokenGlow,
                  { backgroundColor: tokenColor + "55", shadowColor: tokenColor },
                ]}
              />
            )}

            <Ionicons
              name={getIconName()}
              size={20}
              color={pressed ? tokenColor : "rgba(255,255,255,0.95)"}
              style={{
                textShadowColor: pressed ? tokenColor : "transparent",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: pressed ? 14 : 0,
              }}
            />
          </View>

          {/* Token Dot */}
          <View style={[styles.tokenDot, { backgroundColor: tokenColor }]} />

          <Text style={styles.buttonText}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GradientButton;

const styles = StyleSheet.create({
  glassOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(255,255,255,0.10)",
},

  mainContainer: {
    marginVertical: 12,
    borderRadius: 18,
    width: 260,
    alignSelf: "center",
  },

  touchable: {
    borderRadius: 18,
  },

  tokenGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 40,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",

    shadowColor: "#04044b",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },

    elevation: 10,
  },

  shine: {
    position: "absolute",
    top: -40,
    left: 0,
    width: 80,
    height: 200,
  },

  shineGradient: {
    width: "100%",
    height: "100%",
  },

  glassIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  tokenDot: {
    width: 14,
    height: 14,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.75)",
  },

  buttonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
