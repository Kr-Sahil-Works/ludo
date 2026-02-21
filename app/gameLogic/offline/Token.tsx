import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
  Vibration,
  Easing,
  View,
} from "react-native";

type Props = {
  isSpawnProtected?: boolean;
  x: number;
  y: number;
  size: number;
  image: ImageSourcePropType;
  onPress?: () => void;
  highlight?: boolean;
  glowColor?: string;
  isCutting?: boolean;
  zIndex?: number;

  homeX?: number;
  homeY?: number;

  kickDirection?: "left" | "right" | "up" | "down";
  onStepImpact?: (x: number, y: number, color?: string) => void;
  /** 🔥 TRUE only AFTER fireworks start */
isHomeFinal?: boolean;
};

export default function Token({
  isSpawnProtected = false,
  x,
  y,
  size,
  image,
  onPress,
  highlight = false,
  glowColor = "#00ffff",
  isCutting = false,
  zIndex = 999,
  homeX = 0,
  homeY = 0,
  kickDirection = "right",
onStepImpact,
isHomeFinal = false,
}: Props){
  const animX = useRef(new Animated.Value(x)).current;
  const animY = useRef(new Animated.Value(y)).current;

  // ✅ position tracking (no __getValue)
  const lastPos = useRef({ x, y });

  // 🔥 hyper chain helpers
  const lastMoveTime = useRef(0);
  const chainBoost = useRef(new Animated.Value(1)).current;
  const wasInHome = useRef(true);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // cutting effects
  const cutShake = useRef(new Animated.Value(0)).current;
  const cutScale = useRef(new Animated.Value(1)).current;
  const cutOpacity = useRef(new Animated.Value(1)).current;
  const cutFlash = useRef(new Animated.Value(0)).current;
  const trailOpacity = useRef(new Animated.Value(0)).current;
  const trailStretch = useRef(new Animated.Value(1)).current;

  // kick animation
  const kickX = useRef(new Animated.Value(0)).current;
  const kickY = useRef(new Animated.Value(0)).current;
  const kickArc = useRef(new Animated.Value(0)).current;
  const kickRotate = useRef(new Animated.Value(0)).current;

  // respawn pop
  const popScale = useRef(new Animated.Value(1)).current;

  // 🔥 MICRO SPAWN POP (FIXED)
  const spawnPop = useRef(new Animated.Value(1)).current;

  // 🚀 snap helpers
  const snapScale = useRef(new Animated.Value(1)).current;
  const snapArc = useRef(new Animated.Value(0)).current;

  // dust
  const dustScale = useRef(new Animated.Value(0.2)).current;
  const dustOpacity = useRef(new Animated.Value(0)).current;

  // 🛡️ shield
  const shieldScale = useRef(new Animated.Value(0)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;

  // =====================================================
// 💨 ULTRA PREMIUM VANISH (ADDED — SAFE)
// =====================================================
const vanishOpacity = useRef(new Animated.Value(1)).current;
const vanishScale = useRef(new Animated.Value(1)).current;
const vanishLift = useRef(new Animated.Value(0)).current;
const hasVanished = useRef(false);

  // =====================================================
  // 🚀 MOVEMENT (BUTTER + SNAP)
  // =====================================================
  useEffect(() => {
    if (isCutting) return;

    const now = Date.now();
    const gap = now - lastMoveTime.current;
    lastMoveTime.current = now;

    const isChainMove = gap < 220;
    chainBoost.setValue(isChainMove ? 1.08 : 1);

    const dx = Math.abs(lastPos.current.x - x);
    const dy = Math.abs(lastPos.current.y - y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    const isHomeExit = distance > size * 1.15;
    const triggerSnap = isHomeExit && wasInHome.current;

    if (dx > 1 || dy > 1) {
      onStepImpact?.(x, y, glowColor);
      lastPos.current = { x, y };
    }

    // 🚀 snap exit
    if (triggerSnap) {
      wasInHome.current = false;

      snapScale.setValue(0.82);
      snapArc.setValue(-size * 0.18);

      Animated.parallel([
        Animated.spring(animX, {
          toValue: x,
          speed: 48,
          bounciness: 4,
          useNativeDriver: true,
        }),
        Animated.spring(animY, {
          toValue: y,
          speed: 48,
          bounciness: 4,
          useNativeDriver: true,
        }),
        Animated.spring(snapScale, {
          toValue: 1,
          friction: 4,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(snapArc, {
            toValue: -size * 0.22,
            duration: 90,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(snapArc, {
            toValue: 0,
            duration: 110,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      return;
    }

    // 🧈 normal walk
    Animated.parallel([
      Animated.spring(animX, {
        toValue: x,
        speed: isChainMove ? 34 : 26,
        bounciness: isChainMove ? 6 : 8,
        useNativeDriver: true,
      }),
      Animated.spring(animY, {
        toValue: y,
        speed: isChainMove ? 34 : 26,
        bounciness: isChainMove ? 6 : 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [x, y, isCutting, size, glowColor]);

  // =====================================================
  // ✨ glow pulse
  // =====================================================
  useEffect(() => {
    if (!highlight) {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [highlight]);

  // =====================================================
  // 🛡️ MINIMAL SPAWN + MICRO POP (FINAL FIX)
  // =====================================================
  useEffect(() => {
    if (!isSpawnProtected) return;

    shieldScale.setValue(0.96);
    shieldOpacity.setValue(0.35);
    spawnPop.setValue(0.92);

    Animated.parallel([
      Animated.parallel([
        Animated.timing(shieldScale, {
          toValue: 1.08,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shieldOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(spawnPop, {
          toValue: 1.06,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(spawnPop, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isSpawnProtected]);

  // =====================================================
// 💨 VANISH AFTER FIREWORKS (ORDER FIX)
// =====================================================
useEffect(() => {
  if (!isHomeFinal) return;
  if (hasVanished.current) return;

  hasVanished.current = true;

  const t = setTimeout(() => {
    Animated.parallel([
      Animated.timing(vanishOpacity, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(vanishScale, {
        toValue: 0.55,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(vanishLift, {
        toValue: -size * 0.35,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, 900);

  return () => clearTimeout(t);
}, [isHomeFinal, size]);

  // =====================================================
  // 🎯 interpolations
  // =====================================================
  const shakeX = cutShake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-7, 7],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 1],
  });

  const glowOpacity2 = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.35],
  });

  const shineOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.25],
  });

  const flashOpacity = cutFlash.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.85],
  });

  const rotateDeg = kickRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  const handlePress = () => {
    Vibration.vibrate(20);

    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.85,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          opacity: Animated.multiply(
  isCutting ? cutOpacity : 1,
  vanishOpacity
),
          zIndex,
          elevation: zIndex,
          transform: [
            { translateX: animX },
            { translateY: Animated.add(Animated.add(animY, snapArc), vanishLift) },
            { translateX: kickX },
            { translateY: kickY },
            { translateY: kickArc },
            { translateX: shakeX },
            { rotate: rotateDeg },

            // ⭐ FINAL SCALE STACK
            {
              scale: Animated.multiply(
                Animated.multiply(highlight ? glowScale : 1, snapScale),
                chainBoost
              ),
            },
            { scale: cutScale },
            { scale: popScale },
            { scale: vanishScale },
            { scale: spawnPop }, // ✅ FINAL MICRO POP
          ],
        },
      ]}
    >
      {/* 🛡️ SPAWN SHIELD */}
      {isSpawnProtected && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.spawnShield,
            {
              width: size + 12,
              height: size + 12,
              borderRadius: 999,
              opacity: shieldOpacity,
              transform: [{ scale: shieldScale }],
            },
          ]}
        />
      )}

      {/* NORMAL GLOW */}
      {highlight && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.outerGlow,
            {
              width: size + 22,
              height: size + 22,
              borderRadius: 999,
              opacity: glowOpacity2,
              backgroundColor: glowColor,
              shadowColor: glowColor,
            },
          ]}
        />
      )}

      {highlight && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowRing,
            {
              width: size + 10,
              height: size + 10,
              borderRadius: 999,
              opacity: glowOpacity,
              borderColor: glowColor,
            },
          ]}
        />
      )}

      <Pressable onPress={handlePress} style={styles.pressable}>
        <Animated.Image
          source={image}
          style={{
            width: size,
            height: size,
            transform: [{ scale: bounceAnim }],
          }}
          resizeMode="contain"
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    zIndex: 999,
    elevation: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  pressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  glowRing: {
    position: "absolute",
    borderWidth: 2,
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 30,
  },

  outerGlow: {
    position: "absolute",
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 40,
  },

  spawnShield: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,216,77,0.45)",
    shadowColor: "#ffd84d",
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 10,
  },
});