import React, { useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { isLowEndAndroid } from "@/src/utils/devicePerformance";
import DiceRoller from "@/app/gameLogic/online/OnlineDiceRoller";

type Props = {
  color: string;
  diceValue: number;
  isActive: boolean;
  isMyTurn: boolean;
  disabled: boolean;
  onRoll: () => void | Promise<void>;
  isRolling?: boolean;
  size?: number;
};

export default function OnlineTurnBox({
  color,
  diceValue,
  isActive,
  isMyTurn,
  disabled,
  onRoll,
  isRolling = false,
  size = 112,
}: Props) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(0)).current;

  // 🧠 prevents double tap during async roll
  const rollingLockRef = useRef(false);

  // =====================================================
  // 🌟 subtle active glow
  // =====================================================
  useEffect(() => {
    if (!isMyTurn) {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [isMyTurn, glowAnim]);

  // =====================================================
  // 🫁 breathing idle
  // =====================================================
  useEffect(() => {
    if (!isMyTurn || disabled) {
      breatheAnim.stopAnimation();
      breatheAnim.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [isMyTurn, disabled, breatheAnim]);

  // =====================================================
  // 🎯 derived values
  // =====================================================
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.32],
  });

  const breatheScale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const borderColor = useMemo(() => {
    if (!isMyTurn) return "rgba(255,255,255,0.18)";
    return color;
  }, [isMyTurn, color]);

  const diceSize = Math.min(size * 0.62, 72);

  // =====================================================
  // 👆 press handler (FIXED)
  // =====================================================
  const handlePress = async () => {
    if (disabled) return;
    if (isRolling) return; // 🔥 prevent spam during roll
    if (rollingLockRef.current) return;

    rollingLockRef.current = true;

    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 0.92,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 5,
        tension: 170,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onRoll?.();
    } finally {
      // small safety delay
      setTimeout(() => {
        rollingLockRef.current = false;
      }, 250);
    }
  };

  // =====================================================
  // 🎨 render
  // =====================================================
  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: breatheScale }],
        },
      ]}
    >
      {/* ✨ soft glow */}
      {isMyTurn && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.softGlow,
            {
              opacity: glowOpacity,
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
        />
      )}

      <Pressable
        onPress={handlePress}
        disabled={disabled || isRolling}
        style={({ pressed }) => [
          styles.pressWrap,
          {
            width: size,
            height: size,
            opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: pressScale }],
            width: "100%",
            height: "100%",
          }}
        >
          {/* 🧊 glass */}
{isLowEndAndroid ? (
  <View
    style={[
      styles.glass,
      {
        borderColor,
        backgroundColor: "rgba(20,20,20,0.65)",
      },
    ]}
  >
    {/* 🎲 dice */}
    <DiceRoller
      value={diceValue}
      rolling={isRolling}
      size={diceSize}
    />
  </View>
) : (
  <BlurView
    intensity={55}
    tint="dark"
    style={[
      styles.glass,
      {
        borderColor,
      },
    ]}
  >
    {/* 🎲 dice */}
    <DiceRoller
      value={diceValue}
      rolling={isRolling}
      size={diceSize}
    />
  </BlurView>
)}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  pressWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  glass: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  softGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 40,
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },
});