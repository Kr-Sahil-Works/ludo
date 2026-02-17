import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Dimensions, Easing } from "react-native";
import { BlurView } from "expo-blur";
import { Text } from "react-native";

const { width, height } = Dimensions.get("window");

const DICE_SIZE = width * 0.18;

const SPIN_TIME = 1700; // ✅ spin duration
const WAIT_TIME = 1000; // ✅ wait after stop

const getRandomDice = () => Math.floor(Math.random() * 6) + 1;

function DiceFace({ value }: { value: number }) {
  const dotsMap: Record<number, number[][]> = {
    1: [[1, 1]],
    2: [
      [0, 0],
      [2, 2],
    ],
    3: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    4: [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ],
    5: [
      [0, 0],
      [0, 2],
      [1, 1],
      [2, 0],
      [2, 2],
    ],
    6: [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 2],
      [1, 2],
      [2, 2],
    ],
  };

  return (
    <View style={styles.diceFace}>
      <View style={styles.dotGrid}>
        {dotsMap[value].map((pos, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                top: pos[0] * (DICE_SIZE / 4),
                left: pos[1] * (DICE_SIZE / 4),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function GameSkeleton() {
  const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reel1 = useRef(new Animated.Value(0)).current;
  const reel2 = useRef(new Animated.Value(0)).current;
  const reel3 = useRef(new Animated.Value(0)).current;

  const blurOpacity = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(-200)).current;

  const leverAnim = useRef(new Animated.Value(0)).current;

  const sparkleAnim1 = useRef(new Animated.Value(0)).current;
  const sparkleAnim2 = useRef(new Animated.Value(0)).current;
  const sparkleAnim3 = useRef(new Animated.Value(0)).current;

  const textScrollX = useRef(new Animated.Value(0)).current;
  const textScrollY = useRef(new Animated.Value(0)).current;

  const [v1, setV1] = useState(getRandomDice());
  const [v2, setV2] = useState(getRandomDice());
  const [v3, setV3] = useState(getRandomDice());

  useEffect(() => {
    let mounted = true;

    // ✨ shine strip loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: width * 1.2,
          duration: 1700,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: -200,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 🎰 lever loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(leverAnim, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leverAnim, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ])
    ).start();

    // ✨ sparkles loop
    const sparkleLoop = (sparkle: Animated.Value, delay: number) => {
      sparkle.setValue(0);

      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(sparkle, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(sparkle, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    sparkleLoop(sparkleAnim1, 0);
    sparkleLoop(sparkleAnim2, 300);
    sparkleLoop(sparkleAnim3, 600);

    // ✅ diagonal background text movement
    textScrollX.setValue(0);
    textScrollY.setValue(0);

    Animated.loop(
      Animated.parallel([
        Animated.timing(textScrollX, {
          toValue: -width * 1.5,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(textScrollY, {
          toValue: width * 0.7,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 🎲 spin loop
    const spinLoop = () => {
      if (!mounted) return;

      blurOpacity.setValue(1);

      setV1(getRandomDice());
      setV2(getRandomDice());
      setV3(getRandomDice());

      reel1.setValue(0);
      reel2.setValue(0);
      reel3.setValue(0);

      Animated.parallel([
        Animated.timing(reel1, {
          toValue: -DICE_SIZE * 5.09,
          duration: SPIN_TIME,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(reel2, {
          toValue: -DICE_SIZE * 5.09,
          duration: SPIN_TIME,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(reel3, {
          toValue: -DICE_SIZE * 5.09,
          duration: SPIN_TIME,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        loopTimer.current = setTimeout(() => {
          spinLoop();
        }, WAIT_TIME);
      });
    };

    spinLoop();

    return () => {
      mounted = false;

      if (loopTimer.current) {
        clearTimeout(loopTimer.current);
      }
    };
  }, []);

  const leverRotate = leverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "18deg"],
  });

  const sparkleOpacity1 = sparkleAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sparkleOpacity2 = sparkleAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sparkleOpacity3 = sparkleAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sparkleScale1 = sparkleAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.5],
  });
  const sparkleScale2 = sparkleAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.4],
  });
  const sparkleScale3 = sparkleAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.6],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.textBg,
          {
            transform: [
              { translateX: textScrollX },
              { translateY: textScrollY },
              { rotate: "-18deg" },
            ],
          },
        ]}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <Text key={i} style={styles.bgText}>
            BEST OF LUCK   BEST OF LUCK   BEST OF LUCK
          </Text>
        ))}
      </Animated.View>

      <View style={styles.slotBody}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shineStrip,
            { transform: [{ translateX: shineAnim }, { rotate: "18deg" }] },
          ]}
        />

        <Animated.View
          style={[
            styles.sparkle,
            {
              top: 22,
              left: 50,
              opacity: sparkleOpacity1,
              transform: [{ scale: sparkleScale1 }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.sparkle,
            {
              top: 45,
              right: 70,
              opacity: sparkleOpacity2,
              transform: [{ scale: sparkleScale2 }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.sparkle,
            {
              bottom: 35,
              left: width * 0.33,
              opacity: sparkleOpacity3,
              transform: [{ scale: sparkleScale3 }],
            },
          ]}
        />

        <View style={styles.reelsRow}>
          <View style={styles.reelBox}>
            <Animated.View style={{ transform: [{ translateY: reel1 }] }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <DiceFace key={i} value={getRandomDice()} />
              ))}
              <DiceFace value={v1} />
            </Animated.View>
          </View>

          <View style={styles.reelBox}>
            <Animated.View style={{ transform: [{ translateY: reel2 }] }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <DiceFace key={i} value={getRandomDice()} />
              ))}
              <DiceFace value={v2} />
            </Animated.View>
          </View>

          <View style={styles.reelBox}>
            <Animated.View style={{ transform: [{ translateY: reel3 }] }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <DiceFace key={i} value={getRandomDice()} />
              ))}
              <DiceFace value={v3} />
            </Animated.View>
          </View>
        </View>
      </View>

      <View style={styles.leverContainer}>
        <Animated.View
          style={[styles.leverStick, { transform: [{ rotate: leverRotate }] }]}
        >
          <View style={styles.leverBall} />
        </Animated.View>

        <View style={styles.leverBase} />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[styles.blurLayer, { opacity: blurOpacity }]}
      >
        <BlurView
          intensity={60}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B24",
    justifyContent: "center",
    alignItems: "center",
  },

  slotBody: {
    width: width * 0.88,
    height: height * 0.3,
    borderRadius: 34,
    backgroundColor: "rgba(8,12,28,0.92)",
    borderWidth: 3,
    borderColor: "rgba(255,215,0,0.85)",
    shadowColor: "#ffd700",
    shadowOpacity: 0.65,
    shadowRadius: 35,
    elevation: 30,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },

  shineStrip: {
    position: "absolute",
    width: 120,
    height: "170%",
    backgroundColor: "rgba(255,255,255,0.22)",
    top: -60,
    left: -150,
    borderRadius: 70,
  },

  reelsRow: {
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  reelBox: {
    width: DICE_SIZE * 1.12,
    height: DICE_SIZE * 1.15,
    borderRadius: 22,
    backgroundColor: "rgba(10,14,35,0.85)",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.35)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  diceFace: {
    width: DICE_SIZE,
    height: DICE_SIZE,
    borderRadius: 22,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#ff0000",
    shadowOpacity: 0.6,
    shadowRadius: 22,
    elevation: 22,
  },

  dotGrid: {
    width: DICE_SIZE,
    height: DICE_SIZE,
    position: "relative",
  },

  dot: {
    position: "absolute",
    width: DICE_SIZE * 0.14,
    height: DICE_SIZE * 0.14,
    borderRadius: 999,
    backgroundColor: "white",
    transform: [
      { translateX: DICE_SIZE * 0.18 },
      { translateY: DICE_SIZE * 0.18 },
    ],
  },

  sparkle: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,215,0,0.9)",
    shadowColor: "#ffd700",
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 25,
  },

  leverContainer: {
    position: "absolute",
    right: 8,
    top: height * 0.25,
    width: 70,
    height: 220,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 0,
    elevation: 0,
  },

  leverStick: {
    width: 12,
    height: 150,
    borderRadius: 10,
    backgroundColor: "rgba(255,215,0,0.95)",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  leverBall: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#ff0000",
    marginTop: -12,
    shadowColor: "#ff0000",
    shadowOpacity: 0.85,
    shadowRadius: 20,
    elevation: 30,
  },

  leverBase: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(255,215,0,0.9)",
    marginTop: -10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },

  blurLayer: {
    position: "absolute",
    width,
    height,
  },

  textBg: {
    position: "absolute",
    top: -height * 0.2,
    left: -width * 0.8,
    width: width * 4,
    height: height * 2,
    opacity: 0.14,
    justifyContent: "center",
  },

  bgText: {
    fontSize: 46,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 3,
    marginVertical: 22,
  },
});
