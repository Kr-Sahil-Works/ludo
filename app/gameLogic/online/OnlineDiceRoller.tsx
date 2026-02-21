import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { playFX } from "@/src/utils/sound";
import { isLowEndAndroid } from "@/src/utils/devicePerformance";

const LOW = isLowEndAndroid;

const diceImages: Record<number, any> = {
1: require("@/src/assets/images/dice/dice1.png"),
2: require("@/src/assets/images/dice/dice2.png"),
3: require("@/src/assets/images/dice/dice3.png"),
4: require("@/src/assets/images/dice/dice4.png"),
5: require("@/src/assets/images/dice/dice5.png"),
6: require("@/src/assets/images/dice/dice6.png"),
};

type Props = {
value: number;
rolling: boolean;
size?: number;
};

export default function DiceRoller({
value,
rolling,
size = 96,
}: Props) {
const lottieRef = useRef<LottieView>(null);

const fadeAnim = useRef(new Animated.Value(1)).current;
const bounceScale = useRef(new Animated.Value(1)).current;
const glowAnim = useRef(new Animated.Value(0)).current;
const impactScale = useRef(new Animated.Value(0.6)).current;
const impactOpacity = useRef(new Animated.Value(0)).current;

const hasPreloaded = useRef(false);
const lastRolling = useRef(false);

// 🔥 warm audio once
useEffect(() => {
if (hasPreloaded.current) return;
try {
playFX("dice_roll");
} catch {}
hasPreloaded.current = true;
}, []);

// =====================================================
// 🎲 ROLL ENGINE (FIXED)
// =====================================================
useEffect(() => {
// prevent duplicate triggers
if (rolling === lastRolling.current) return;
lastRolling.current = rolling;


// ---------------- ROLL START ----------------
if (rolling) {
  fadeAnim.setValue(0);
  bounceScale.setValue(1);

  if (!LOW) {
    lottieRef.current?.play();
  }

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  playFX("dice_roll");
  return;
}

// ---------------- ROLL END ----------------
lottieRef.current?.reset();

Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);

impactScale.setValue(0.6);
impactOpacity.setValue(LOW ? 0.25 : 0.45);

Animated.parallel([
  Animated.spring(bounceScale, {
    toValue: 1,
    friction: LOW ? 6 : 4,
    tension: LOW ? 140 : 180,
    useNativeDriver: true,
  }),

  // 💥 impact (lighter on weak phones)
  Animated.timing(impactScale, {
    toValue: LOW ? 1.4 : 1.8,
    duration: LOW ? 260 : 420,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }),

  Animated.timing(impactOpacity, {
    toValue: 0,
    duration: LOW ? 260 : 420,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }),

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: LOW ? 120 : 160,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }),
]).start();

// ✨ glow only on good devices + only on 6
if (!LOW && value === 6) {
  Animated.sequence([
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }),
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 520,
      useNativeDriver: true,
    }),
  ]).start();
}


}, [rolling, value, LOW]);

const glowOpacity = glowAnim.interpolate({
inputRange: [0, 1],
outputRange: [0, 0.55],
});

return (
<View style={[styles.container, { width: size, height: size }]}>
{/* 💥 impact ring */}
<Animated.View
pointerEvents="none"
style={[
styles.impactRing,
{
width: size * (LOW ? 1.3 : 1.5),
height: size * (LOW ? 1.3 : 1.5),
borderRadius: size,
opacity: impactOpacity,
transform: [{ scale: impactScale }],
},
]}
/>


  {/* ✨ glow */}
  {!LOW && (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.glow,
        {
          width: size * 1.4,
          height: size * 1.4,
          borderRadius: size,
          opacity: glowOpacity,
        },
      ]}
    />
  )}

  {/* 🎬 rolling animation (disabled on weak phones) */}
  {rolling && !LOW && (
    <LottieView
      ref={lottieRef}
      source={require("@/src/assets/animation/diceroll.json")}
      autoPlay
      loop
      style={styles.lottie}
      renderMode="HARDWARE"
    />
  )}

  {/* 🎯 final face */}
  {!rolling && (
    <Animated.Image
      source={diceImages[value] ?? diceImages[1]}
      style={{
        width: size,
        height: size,
        opacity: fadeAnim,
        transform: [{ scale: bounceScale }],
      }}
      resizeMode="contain"
    />
  )}
</View>


);
}

const styles = StyleSheet.create({
container: {
alignItems: "center",
justifyContent: "center",
},
lottie: {
width: "100%",
height: "100%",
},
glow: {
position: "absolute",
backgroundColor: "rgba(255,215,90,0.45)",
},
impactRing: {
position: "absolute",
borderWidth: 2,
borderColor: "rgba(255,215,90,0.9)",
},
});
