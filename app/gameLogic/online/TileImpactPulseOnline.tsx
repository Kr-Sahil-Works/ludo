import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Easing } from "react-native";

type Props = {
  x: number;
  y: number;
  size: number;
  color: string;
  onDone: () => void;
};

export default function TileImpactPulseOnline({
  x,
  y,
  size,
  color,
  onDone,
}: Props) {
  // 🔥 richer animation stack
  const scaleAnim = useRef(new Animated.Value(0.12)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      // 🚀 main burst (snappy)
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          friction: 4,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.9,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 🌫️ fade tail
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      // ✨ outer ring bloom
      Animated.timing(ringScale, {
        toValue: 2.4,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDone();
    });
  }, [scaleAnim, opacityAnim, ringScale, onDone]);

  return (
    <>
      {/* 🌟 OUTER SOFT BLOOM */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.outerRing,
          {
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            opacity: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.35],
            }),
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      {/* 🔥 MAIN IMPACT */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulse,
          {
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            borderWidth: 2,
            borderColor: color,
            opacity: opacityAnim,
            shadowColor: color,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pulse: {
    position: "absolute",
    zIndex: 999999,
    elevation: 999999,
    shadowOpacity: 1,
    shadowRadius: 45,
    shadowOffset: { width: 0, height: 0 },
  },
  outerRing: {
    position: "absolute",
    zIndex: 999998,
    borderWidth: 2,
  },
});