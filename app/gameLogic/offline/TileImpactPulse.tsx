import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

type Props = {
  x: number;
  y: number;
  size: number;
  color: string;
  onDone: () => void;
};

export default function TileImpactPulse({ x, y, size, color, onDone }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.15)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.9,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDone();
    });
  }, []);

  return (
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

          // ✅ DARKER + DEEPER LOOK
          backgroundColor: color,

          // ✅ real glow color on top
          borderWidth: 2,
          borderColor: color,

          opacity: opacityAnim,

          shadowColor: color,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  pulse: {
    position: "absolute",
    zIndex: 999999,
    elevation: 999999,

    // ✅ VERY STRONG GLOW
    shadowOpacity: 1,
    shadowRadius: 45,
    shadowOffset: { width: 0, height: 0 },
  },
});
