import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Vibration,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type Props = {
  title: string;
  subtitle?: string;
  tokenColor?: string;
  onPress: () => void;
};

export default function SquareModeButton({
  title,
  subtitle,
  tokenColor = "#00eaff",
  onPress,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const [pressed, setPressed] = useState(false);

  const CARD_W = width * 0.44; // responsive
  const CARD_H = CARD_W * 0.82;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: false,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, []);

  const pressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();
  };

  const pressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={() => {
        Vibration.vibrate(20);
        onPress();
      }}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={{ width: CARD_W }}
    >
      <Animated.View
        style={[
          styles.cardOuter,
          {
            height: CARD_H,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* glow border */}
        <Animated.View
          style={[
            styles.glowBorder,
            {
              borderColor: tokenColor,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.65],
              }),
            },
          ]}
        />

        {/* glass background */}
        <BlurView intensity={35} tint="dark" style={styles.blur} />

        {/* glass gradient overlay */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.14)",
            "rgba(255,255,255,0.05)",
            "rgba(0,0,0,0.18)",
          ]}
          style={styles.glassGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* top panel (icon placeholder area) */}
        <View style={styles.topPanel}>
          <View
            style={[
              styles.circleDot,
              {
                backgroundColor: pressed ? tokenColor : "rgba(255,255,255,0.3)",
              },
            ]}
          />
          <View style={styles.circleDotSmall} />
          <View style={styles.circleDotSmall} />
        </View>

        {/* bottom panel */}
        <View style={styles.bottomPanel}>
          <Text style={styles.title}>{title}</Text>

          {subtitle ? (
            <Text style={[styles.subtitle, { color: tokenColor }]}>
              ● {subtitle}
            </Text>
          ) : null}
        </View>

        {/* pressed glow */}
        {pressed && (
          <View
            style={[
              styles.pressedGlow,
              { backgroundColor: tokenColor + "55", shadowColor: tokenColor },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "space-between",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",

    elevation: 25,
  },

  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 2,
  },

  blur: {
    ...StyleSheet.absoluteFillObject,
  },

  glassGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  topPanel: {
    flex: 1,
    paddingTop: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomPanel: {
    height: 70,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  title: {
    fontSize: 15,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1.2,
    textAlign: "center",
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
  },

  circleDot: {
    width: 46,
    height: 46,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    marginBottom: 10,
  },

  circleDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginTop: 6,
  },

  pressedGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 200,
    top: -40,
    left: -40,
    opacity: 0.55,

    shadowOpacity: 1,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
});
