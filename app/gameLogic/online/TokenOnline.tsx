import React, { useEffect, useRef } from "react";
import {
Animated,
Pressable,
StyleSheet,
ImageSourcePropType,
Vibration,
Easing,
Platform,
} from "react-native";
import { isLowEndAndroid } from "@/src/utils/devicePerformance";

type Props = {
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
isHomeFinal?: boolean;
isSpawnProtected?: boolean;
};

export default function TokenOnline({
x,
y,
size,
image,
onPress,
highlight = false,
glowColor = "#00ffff",
isCutting = false,
zIndex = 999,
onStepImpact,
isHomeFinal = false,
isSpawnProtected = false,
}: Props) {
const animX = useRef(new Animated.Value(x)).current;
const animY = useRef(new Animated.Value(y)).current;

const lastServerPos = useRef({ x, y });
const lastUpdateTime = useRef(Date.now());

const chainBoost = useRef(new Animated.Value(1)).current;
const arcAnim = useRef(new Animated.Value(0)).current;

const glowAnim = useRef(new Animated.Value(0)).current;
const bounceAnim = useRef(new Animated.Value(1)).current;

const blurOpacity = useRef(new Animated.Value(0)).current;
const blurStretch = useRef(new Animated.Value(1)).current;
const spawnPop = useRef(new Animated.Value(1)).current;

// 💨 vanish
const vanishOpacity = useRef(new Animated.Value(1)).current;
const vanishScale = useRef(new Animated.Value(1)).current;
const vanishLift = useRef(new Animated.Value(0)).current;
const hasVanished = useRef(false);
const lastHomeState = useRef(false);

const LOW = isLowEndAndroid;

// =====================================================
// 🚀 NETWORK SMOOTHING (optimized)
// =====================================================
useEffect(() => {
if (isCutting) return;


const now = Date.now();
const timeGap = now - lastUpdateTime.current;
lastUpdateTime.current = now;

const dx = Math.abs(lastServerPos.current.x - x);
const dy = Math.abs(lastServerPos.current.y - y);
const distance = Math.sqrt(dx * dx + dy * dy);

// ✅ micro noise guard (IMPORTANT)
if (distance < 0.4) return;

lastServerPos.current = { x, y };

const isFastChain = timeGap < 220;
chainBoost.setValue(isFastChain ? 1.06 : 1);

if (distance > size * 0.25) {
  onStepImpact?.(x, y, glowColor);
}

// 🚨 teleport snap
if (distance > size * 2.2) {
  animX.setValue(x);
  animY.setValue(y);
  return;
}

const speed = LOW ? 32 : Math.min(48, Math.max(26, distance * 0.9));
const bounce = LOW ? 5 : distance > size ? 6 : 8;

Animated.parallel([
  Animated.spring(animX, {
    toValue: x,
    speed,
    bounciness: bounce,
    useNativeDriver: true,
  }),
  Animated.spring(animY, {
    toValue: y,
    speed,
    bounciness: bounce,
    useNativeDriver: true,
  }),

  // ✨ arc only on good devices
  !LOW &&
    Animated.sequence([
      Animated.timing(arcAnim, {
        toValue: -Math.min(14, size * 0.22),
        duration: 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(arcAnim, {
        toValue: 0,
        duration: 110,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]),
].filter(Boolean) as any).start();


}, [x, y, isCutting, size, glowColor]);

// =====================================================
// ✨ glow pulse
// =====================================================
useEffect(() => {
if (!highlight || LOW) {
glowAnim.setValue(0);
return;
}


const loop = Animated.loop(
  Animated.sequence([
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }),
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 520,
      useNativeDriver: true,
    }),
  ])
);

loop.start();
return () => loop.stop();


}, [highlight, LOW]);

// =====================================================
// 🛡️ spawn pop
// =====================================================
useEffect(() => {
if (!isSpawnProtected) return;


spawnPop.setValue(0.92);

Animated.sequence([
  Animated.timing(spawnPop, {
    toValue: 1.06,
    duration: LOW ? 70 : 90,
    useNativeDriver: true,
  }),
  Animated.spring(spawnPop, {
    toValue: 1,
    friction: 6,
    tension: 140,
    useNativeDriver: true,
  }),
]).start();


}, [isSpawnProtected, LOW]);

// =====================================================
// 💨 vanish (FIXED)
// =====================================================
useEffect(() => {
if (!isHomeFinal) {
lastHomeState.current = false;
return;
}


if (lastHomeState.current) return;
lastHomeState.current = true;

if (hasVanished.current) return;
hasVanished.current = true;

const t = setTimeout(() => {
  Animated.parallel([
    Animated.timing(vanishOpacity, {
      toValue: 0,
      duration: LOW ? 320 : 420,
      useNativeDriver: true,
    }),
    Animated.timing(vanishScale, {
      toValue: 0.55,
      duration: LOW ? 320 : 420,
      useNativeDriver: true,
    }),
    Animated.timing(vanishLift, {
      toValue: -size * 0.35,
      duration: LOW ? 320 : 420,
      useNativeDriver: true,
    }),
  ]).start();
}, LOW ? 650 : 900);

return () => clearTimeout(t);


}, [isHomeFinal, size, LOW]);

const glowScale = glowAnim.interpolate({
inputRange: [0, 1],
outputRange: [1, 1.14],
});

const handlePress = () => {
Vibration.vibrate(20);


Animated.sequence([
  Animated.timing(bounceAnim, {
    toValue: 0.88,
    duration: 80,
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
opacity: vanishOpacity,
zIndex,
elevation: zIndex,
transform: [
{ translateX: animX },
{ translateY: Animated.add(animY, Animated.add(arcAnim, vanishLift)) },
{
scale: Animated.multiply(
highlight && !LOW ? glowScale : 1,
chainBoost
),
},
{ scale: spawnPop },
{ scale: vanishScale },
],
},
]}
>
{!LOW && (
<Animated.View
pointerEvents="none"
style={[
styles.blurTrail,
{
width: size * 0.9,
height: size * 0.9,
borderRadius: size,
backgroundColor: glowColor,
opacity: blurOpacity,
transform: [{ scaleX: blurStretch }],
},
]}
/>
)}


  {highlight && !LOW && (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.glowRing,
        {
          width: size + 10,
          height: size + 10,
          borderRadius: 999,
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
alignItems: "center",
justifyContent: "center",
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
},
blurTrail: {
position: "absolute",
zIndex: -1,
},
});
