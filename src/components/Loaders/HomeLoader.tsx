import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Dimensions, Easing } from "react-native";

const { width } = Dimensions.get("window");

const SIZE = width * 0.14;

type DotPos =
  | "topLeft"
  | "topRight"
  | "midLeft"
  | "midRight"
  | "bottomLeft"
  | "bottomRight"
  | "center";

export default function HomeLoader() {
  const upAnim = useRef(new Animated.Value(0)).current;
  const downAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const [diceValues, setDiceValues] = useState<number[]>(
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 6) + 1)
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(upAnim, {
          toValue: -90,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(upAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(downAnim, {
          toValue: 90,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(downAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    const interval = setInterval(() => {
      setDiceValues(
        Array.from({ length: 7 }, () => Math.floor(Math.random() * 6) + 1)
      );
    }, 350);

    return () => clearInterval(interval);
  }, [upAnim, downAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const renderDots = (value: number) => {
    const dot = (pos: DotPos) => (
      <View key={pos} style={[styles.dot, styles[pos]]} />
    );

    const map: Record<number, DotPos[]> = {
      1: ["center"],
      2: ["topLeft", "bottomRight"],
      3: ["topLeft", "center", "bottomRight"],
      4: ["topLeft", "topRight", "bottomLeft", "bottomRight"],
      5: ["topLeft", "topRight", "center", "bottomLeft", "bottomRight"],
      6: [
        "topLeft",
        "topRight",
        "midLeft",
        "midRight",
        "bottomLeft",
        "bottomRight",
      ],
    };

    return (map[value] ?? map[1]).map(dot);
  };

  return (
    <View style={styles.fullScreen}>
      <View style={styles.loader}>
        {/* 🎲 Column 1 */}
        <Animated.View
          style={[styles.container, { transform: [{ translateY: downAnim }] }]}
        >
          <View style={styles.carousel}>
            {(diceValues ?? []).map((v, i) => (
              <View key={i} style={styles.diceWrap}>
                <View style={styles.glassLayer} />
                <View style={styles.dice}>{renderDots(v)}</View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* 🎲 Column 2 */}
        <Animated.View
          style={[styles.container, { transform: [{ translateY: upAnim }] }]}
        >
          <View style={styles.carousel}>
            {(diceValues ?? []).map((v, i) => (
              <Animated.View
                key={i}
                style={[styles.diceWrap, { transform: [{ rotate }] }]}
              >
                <View style={styles.glassLayer} />
                <View style={styles.dice}>{renderDots(v)}</View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* 🎲 Column 3 */}
        <Animated.View
          style={[styles.container, { transform: [{ translateY: downAnim }] }]}
        >
          <View style={styles.carousel}>
            {(diceValues ?? []).map((v, i) => (
              <View key={i} style={styles.diceWrap}>
                <View style={styles.glassLayer} />
                <View style={styles.dice}>{renderDots(v)}</View>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#050516",
    justifyContent: "center",
    alignItems: "center",
  },

  loader: {
    flexDirection: "row",
    height: 120,
    width: width * 0.85,
    overflow: "hidden",
    gap: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: SIZE * 1.8,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
  },

  carousel: {
    width: "100%",
    alignItems: "center",
    gap: 22,
  },

  diceWrap: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },

  // ✅ Fake Blur Glass Effect (NO expo-blur)
  glassLayer: {
    position: "absolute",
    width: "135%",
    height: "135%",
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  dice: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    backgroundColor: "#ff0000",
    position: "relative",
  },

  dot: {
    width: SIZE * 0.16,
    height: SIZE * 0.16,
    borderRadius: 999,
    backgroundColor: "white",
    position: "absolute",
  },

  topLeft: { top: "18%", left: "18%" },
  topRight: { top: "18%", right: "18%" },
  midLeft: { top: "42%", left: "18%" },
  midRight: { top: "42%", right: "18%" },
  bottomLeft: { bottom: "18%", left: "18%" },
  bottomRight: { bottom: "18%", right: "18%" },
  center: { top: "42%", left: "42%" },
});
