import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
  Dimensions,
  Vibration,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type Props = {
  title: string;
  subtitle?: string;
  icon: any;
  color?: string;
  onPress: () => void;
};

export default function ModeCard({
  title,
  subtitle,
  icon,
  color = "#00eaff",
  onPress,
}: Props) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  // dots animation
  const dotAnim = useRef(new Animated.Value(0)).current;

  const CARD_W =
  width >= 500 ? width * 0.34 : width >= 400 ? width * 0.40 : width * 0.42;

const CARD_H = CARD_W * 0.82;


  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: false,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, []);

useEffect(() => {
  const dotLoop = Animated.loop(
    Animated.sequence([
      Animated.timing(dotAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
      Animated.delay(850),

      Animated.timing(dotAnim, { toValue: 1, duration: 0, useNativeDriver: false }),
      Animated.delay(850),

      Animated.timing(dotAnim, { toValue: 2, duration: 0, useNativeDriver: false }),
      Animated.delay(850),

      Animated.timing(dotAnim, { toValue: 3, duration: 0, useNativeDriver: false }),
      Animated.delay(850),
    ])
  );

  dotLoop.start();
  return () => dotLoop.stop();
}, []);



  const getDotColor = (dotIndex: number) => {
  return dotAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      // STATE 0: C W W W
      dotIndex === 1 ? color : "rgba(255,255,255,0.55)",

      // STATE 1: C C W W
      dotIndex === 1 || dotIndex === 2 ? color : "rgba(255,255,255,0.55)",

      // STATE 2: C W C W
      dotIndex === 1 || dotIndex === 3 ? color : "rgba(255,255,255,0.55)",

      // STATE 3: W C W C
      dotIndex === 2 || dotIndex === 4 ? color : "rgba(255,255,255,0.55)",
    ],
  });
};


  return (
   <Pressable
  onPress={() => {
    Vibration.vibrate(18);
    onPress();
  }}
  style={{
    width: CARD_W,
    zIndex: 9999,
    elevation: 9999,
  }}
>

      <View style={[styles.card, { height: CARD_H }]}>
        {/* Glow Border */}
        <Animated.View
          style={[
            styles.glowBorder,
            {
              borderColor: color,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.25, 0.75],
              }),
            },
          ]}
        />

        {/* Glass Blur */}
        <BlurView intensity={32} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Glass Overlay */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.10)",
            "rgba(255,255,255,0.03)",
            "rgba(0,0,0,0.25)",
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* ICON AREA */}
        <View style={styles.iconArea}>
          <View style={[styles.iconCircle, { borderColor: color + "aa" }]}>
            <Image source={icon} style={styles.iconImg} />
          </View>
        </View>

        {/* TEXT AREA */}
        <View style={styles.bottomArea}>
          <Text style={styles.title}>{title}</Text>

          {/* Dots */}
          <View style={styles.dotRow}>
            <Animated.View
              style={[styles.dot, { backgroundColor: getDotColor(1) }]}
            />
            <Animated.View
              style={[styles.dot, { backgroundColor: getDotColor(2) }]}
            />
            <Animated.View
              style={[styles.dot, { backgroundColor: getDotColor(3) }]}
            />
            <Animated.View
              style={[styles.dot, { backgroundColor: getDotColor(4) }]}
            />
          </View>

          {/* Subtitle */}
          {subtitle ? (
            <Text style={[styles.subtitle, { color: color }]}>
              ● {subtitle}
            </Text>
          ) : null}

          {/* Line */}
          <View style={[styles.line, { backgroundColor: color }]} />
        </View>

        {/* Bottom Glow */}
        <View
          style={[
            styles.bottomGlow,
            { backgroundColor: color + "33", shadowColor: color },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
  borderRadius: 22,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  elevation: 25,
  zIndex: 9999,
  marginHorizontal: 2,
},


  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 2,
  },

  iconArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 0,
  },

  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.20)",
    borderWidth: 1.5,
  },

  iconImg: {
    width: 50,
    height: 50,
    borderRadius:20,
    resizeMode: "contain",
  },

  bottomArea: {
    height: 78,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.20)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 6,
    paddingTop: 0,
  },

  title: {
    fontSize: 13,
    fontWeight: "900",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },

  dotRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
    marginBottom: 5,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 10,
    opacity: 0.95,
  },

  subtitle: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    textAlign: "center",
  },

  line: {
    marginTop: 4,
    height: 3,
    width: "65%",
    borderRadius: 10,
    opacity: 0.75,
  },

  bottomGlow: {
    position: "absolute",
    bottom: -22,
    left: 20,
    right: 20,
    height: 55,
    borderRadius: 50,
    opacity: 0.65,
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },
});
