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
};

export default function Token({
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
}: Props) {
  const animX = useRef(new Animated.Value(x)).current;
  const animY = useRef(new Animated.Value(y)).current;

  const glowAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // cutting effects
  const cutShake = useRef(new Animated.Value(0)).current;
  const cutScale = useRef(new Animated.Value(1)).current;
  const cutOpacity = useRef(new Animated.Value(1)).current;
  const cutFlash = useRef(new Animated.Value(0)).current;
  const trailOpacity = useRef(new Animated.Value(0)).current;
  const trailStretch = useRef(new Animated.Value(1)).current;

  // kick out animation values
  const kickX = useRef(new Animated.Value(0)).current;
  const kickY = useRef(new Animated.Value(0)).current;
  const kickArc = useRef(new Animated.Value(0)).current;
  const kickRotate = useRef(new Animated.Value(0)).current;

  // respawn pop
  const popScale = useRef(new Animated.Value(1)).current;

  // dust puff
  const dustScale = useRef(new Animated.Value(0.2)).current;
  const dustOpacity = useRef(new Animated.Value(0)).current;

  // movement animation (NORMAL)
  useEffect(() => {
    if (isCutting) return;

    Animated.parallel([
      Animated.spring(animX, {
        toValue: x,
        speed: 22,
        bounciness: 10,
        useNativeDriver: true,
      }),
      Animated.spring(animY, {
        toValue: y,
        speed: 22,
        bounciness: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [x, y, isCutting]);

  // glow pulse animation
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

  // ✅ LUDO KING CUT (Kick + Arc + Dust)
  useEffect(() => {
    if (!isCutting) return;

    cutShake.setValue(0);
    cutScale.setValue(1);
    cutOpacity.setValue(1);
    cutFlash.setValue(0);
    trailOpacity.setValue(0);
    trailStretch.setValue(1);

    kickX.setValue(0);
    kickY.setValue(0);
    kickArc.setValue(0);
    kickRotate.setValue(0);

    popScale.setValue(1);

    dustScale.setValue(0.2);
    dustOpacity.setValue(0);

    // base direction
    let dx = 0;
    let dy = 0;

    if (kickDirection === "right") dx = 150;
    if (kickDirection === "left") dx = -150;
    if (kickDirection === "up") dy = -150;
    if (kickDirection === "down") dy = 150;

    // diagonal randomness
    const diagonalBoost = 55 + Math.random() * 35;
    if (kickDirection === "right" || kickDirection === "left") {
      dy = (Math.random() > 0.5 ? 1 : -1) * diagonalBoost;
    } else {
      dx = (Math.random() > 0.5 ? 1 : -1) * diagonalBoost;
    }

    Animated.sequence([
      // 💥 impact (shake + flash + dust)
      Animated.parallel([
        Animated.sequence([
          Animated.timing(cutShake, {
            toValue: 1,
            duration: 45,
            useNativeDriver: true,
          }),
          Animated.timing(cutShake, {
            toValue: -1,
            duration: 45,
            useNativeDriver: true,
          }),
          Animated.timing(cutShake, {
            toValue: 1,
            duration: 45,
            useNativeDriver: true,
          }),
          Animated.timing(cutShake, {
            toValue: 0,
            duration: 45,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(cutFlash, {
            toValue: 1,
            duration: 70,
            useNativeDriver: true,
          }),
          Animated.timing(cutFlash, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(cutScale, {
            toValue: 0.72,
            duration: 110,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(cutScale, {
            toValue: 1,
            duration: 160,
            easing: Easing.out(Easing.elastic(1)),
            useNativeDriver: true,
          }),
        ]),

        // 🌫️ dust puff
        Animated.sequence([
          Animated.timing(dustOpacity, {
            toValue: 0.55,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(dustScale, {
            toValue: 1.6,
            duration: 420,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dustOpacity, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // 🥾 kick fly (diagonal + arc jump + spin + fade)
      Animated.parallel([
        Animated.timing(kickX, {
          toValue: dx,
          duration: 430,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(kickY, {
          toValue: dy,
          duration: 430,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        // arc jump: goes UP then falls
        Animated.sequence([
          Animated.timing(kickArc, {
            toValue: -85,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(kickArc, {
            toValue: 0,
            duration: 230,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),

        // spin
        Animated.timing(kickRotate, {
          toValue: 1,
          duration: 430,
          easing: Easing.out(Easing.linear),
          useNativeDriver: true,
        }),

        // vanish mid-air
        Animated.sequence([
          Animated.delay(110),
          Animated.timing(cutOpacity, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),

        // trail effect
        Animated.sequence([
          Animated.timing(trailOpacity, {
            toValue: 0.65,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(trailOpacity, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(trailStretch, {
            toValue: 1.5,
            duration: 130,
            useNativeDriver: true,
          }),
          Animated.timing(trailStretch, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // reset kick offsets FIRST
Animated.parallel([
  Animated.timing(kickX, {
    toValue: 0,
    duration: 1,
    useNativeDriver: true,
  }),
  Animated.timing(kickY, {
    toValue: 0,
    duration: 1,
    useNativeDriver: true,
  }),
  Animated.timing(kickArc, {
    toValue: 0,
    duration: 1,
    useNativeDriver: true,
  }),
  Animated.timing(kickRotate, {
    toValue: 0,
    duration: 1,
    useNativeDriver: true,
  }),
]),

// 🏠 teleport to home instantly (NOW IT WILL BE PERFECT)
Animated.parallel([
  Animated.timing(animX, {
    toValue: homeX,
    duration: 1,
    useNativeDriver: true,
  }),
  Animated.timing(animY, {
    toValue: homeY,
    duration: 1,
    useNativeDriver: true,
  }),
]),


      // 🌟 reappear pop bounce
      Animated.parallel([
        Animated.timing(cutOpacity, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),

        Animated.sequence([
          Animated.timing(popScale, {
            toValue: 1.55,
            duration: 140,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.spring(popScale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [isCutting]);

  // reset when cut ends
  useEffect(() => {
    if (isCutting) return;

    cutOpacity.setValue(1);
    trailOpacity.setValue(0);
    cutFlash.setValue(0);
    cutScale.setValue(1);
    cutShake.setValue(0);
    trailStretch.setValue(1);

    kickX.setValue(0);
    kickY.setValue(0);
    kickArc.setValue(0);
    kickRotate.setValue(0);

    popScale.setValue(1);

    dustOpacity.setValue(0);
    dustScale.setValue(0.2);
  }, [isCutting]);

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
        duration: 90,
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
          opacity: isCutting ? cutOpacity : 1,
          zIndex,
          elevation: zIndex,

          transform: [
            { translateX: animX },
            { translateY: animY },

            // 🥾 kick fly offset
            { translateX: kickX },
            { translateY: kickY },

            // arc jump
            { translateY: kickArc },

            // shake
            { translateX: shakeX },

            // spin
            { rotate: rotateDeg },

            // glow scale
            { scale: highlight ? glowScale : 1 },

            // squash hit
            { scale: cutScale },

            // pop respawn
            { scale: popScale },
          ],
        },
      ]}
    >
    {/* 🌫️ DUST CLOUD (2 PUFFS like Ludo King) */}
{isCutting && (
  <>
    {/* LEFT PUFF */}
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dust,
        {
          width: size * 0.55,
          height: size * 0.25,
          borderRadius: 999,
          bottom: size * 0.08,
          left: size * 0.05,
          opacity: dustOpacity,
          transform: [{ scale: dustScale }],
        },
      ]}
    />

    {/* RIGHT PUFF */}
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dust,
        {
          width: size * 0.55,
          height: size * 0.25,
          borderRadius: 999,
          bottom: size * 0.08,
          right: size * 0.05,
          opacity: dustOpacity,
          transform: [{ scale: dustScale }],
        },
      ]}
    />
  </>
)}


      {/* 🔥 TRAIL GHOST */}
      {isCutting && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Animated.Image
            source={image}
            resizeMode="contain"
            style={{
              position: "absolute",
              width: size,
              height: size,
              opacity: trailOpacity,
              transform: [{ scaleX: trailStretch }, { scaleY: 1.05 }],
            }}
          />
        </View>
      )}

      {/* ⚡ FLASH HIT OVERLAY */}
      {isCutting && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flashOverlay,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: flashOpacity,
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
              shadowColor: glowColor,
            },
          ]}
        />
      )}

      {highlight && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.diagonalShine,
            {
              width: size * 0.55,
              height: size * 1.2,
              opacity: shineOpacity,
              transform: [{ rotate: "25deg" }],
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

  diagonalShine: {
    position: "absolute",
    top: -10,
    left: 5,
    borderRadius: 50,
    backgroundColor: "white",
    zIndex: 9999,
  },

  flashOverlay: {
    position: "absolute",
    backgroundColor: "white",
    zIndex: 99999,
  },

  // 🌫️ dust puff style
 dust: {
  position: "absolute",
  backgroundColor: "rgba(255,255,255,0.65)",
  zIndex: 999999,
},

});
