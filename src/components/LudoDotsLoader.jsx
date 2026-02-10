import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const LudoDotsLoader = () => {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;
  const d4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),

          Animated.timing(dot, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),

          Animated.timing(dot, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const a1 = animateDot(d1, 0);
    const a2 = animateDot(d2, 120);
    const a3 = animateDot(d3, 240);
    const a4 = animateDot(d4, 360);

    a1.start();
    a2.start();
    a3.start();
    a4.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      a4.stop();
    };
  }, []);

  const dotStyle = (dot) => {
    const translateY = dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -12],
    });

    const scale = dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1.3],
    });

    const opacity = dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    });

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, styles.red, dotStyle(d1)]} />
      <Animated.View style={[styles.dot, styles.green, dotStyle(d2)]} />
      <Animated.View style={[styles.dot, styles.yellow, dotStyle(d3)]} />
      <Animated.View style={[styles.dot, styles.blue, dotStyle(d4)]} />
    </View>
  );
};

export default LudoDotsLoader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },

  red: { backgroundColor: "#ff3b30" },
  green: { backgroundColor: "#34c759" },
  yellow: { backgroundColor: "#ffcc00" },
  blue: { backgroundColor: "#007aff" },
});
