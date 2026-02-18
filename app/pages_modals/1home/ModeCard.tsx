import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Vibration,
  ImageBackground,
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
  const dotAnim = useRef(new Animated.Value(0)).current;

  const CARD_W =
    width >= 500 ? width * 0.34 : width >= 400 ? width * 0.4 : width * 0.42;

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
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.delay(850),

        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.delay(850),

        Animated.timing(dotAnim, {
          toValue: 2,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.delay(850),

        Animated.timing(dotAnim, {
          toValue: 3,
          duration: 0,
          useNativeDriver: false,
        }),
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
        dotIndex === 1 ? color : "rgba(255,255,255,0.55)",
        dotIndex === 1 || dotIndex === 2
          ? color
          : "rgba(255,255,255,0.55)",
        dotIndex === 1 || dotIndex === 3
          ? color
          : "rgba(255,255,255,0.55)",
        dotIndex === 2 || dotIndex === 4
          ? color
          : "rgba(255,255,255,0.55)",
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

          {/* Glow Border (TOP MOST) */}
        <Animated.View
          style={[
            styles.glowBorder,
            {
              zIndex: 10,
              borderColor: color,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.25, 0.75],
              }),
            },
          ]}
        />

        {/* Blur (ABOVE ICON) */}
        <BlurView
          intensity={18} // 🔥 reduce blur so icon visible
          tint="dark"
          style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        />

        {/* Glass Overlay (LIGHT) */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.06)",
            "rgba(255,255,255,0.02)",
            "rgba(0,0,0,0.12)", // 🔥 less dark
          ]}
          style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

       {/* ICON TOP AREA (60%) */}
<View style={[styles.iconBgArea, { zIndex: 3 }]}>

  {/* ✅ GLOW FIRST (BEHIND ICON) */}
  <View
    style={[
      styles.iconGlow,
      { backgroundColor: color + "55", shadowColor: color },
    ]}
  />

  {/* ✅ ICON PNG ON TOP */}
  <ImageBackground
    source={icon}
    style={styles.iconBg}
    imageStyle={styles.iconBgImg}
    resizeMode="contain"
  />
</View>


        {/* TEXT AREA */}
        <View style={[styles.bottomArea, { zIndex: 5 }]}>
          <View style={styles.bottomDarkOverlay} />

          <Text style={styles.title}>{title}</Text>

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

          {subtitle ? (
            <Text style={[styles.subtitle, { color: color }]}>
              ● {subtitle}
            </Text>
          ) : null}

          <View style={[styles.line, { backgroundColor: color }]} />
        </View>

      

        {/* Bottom Glow */}
        <View
          style={[
            styles.bottomGlow,
            { backgroundColor: color + "33", shadowColor: color, zIndex: 20 },
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
    zIndex: 0,
    elevation: 0,
  },

  // FULL BACKGROUND ICON
  fullIconBg: {
    width: "100%",
    height: "100%",
    opacity: 0.25,
  },

  // ✅ ICON TOP AREA (60%)
  iconBgArea: {
    flex: 0.6,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

 iconBg: {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
},

iconBgImg: {
  width: "100%",
  height: "100%",
  opacity: 1,
  transform: [{ scale: 1.2 }], // 🔥 make icon bigger
},

  iconGlow: {
    position: "absolute",
    width: 95,
    height: 95,
    borderRadius: 999,
    opacity: 0.7,
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },

  bottomArea: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 6,
  },

  bottomDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
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
