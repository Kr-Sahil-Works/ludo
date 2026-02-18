import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

type ComingSoonModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
};

export default function ComingSoonModal({
  visible,
  onClose,
  title = "Coming Soon 🚀",
}: ComingSoonModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(60)).current;

  // Smooth shimmer
  const shineAnim = useRef(new Animated.Value(-400)).current;

  useEffect(() => {
    let shineLoop: Animated.CompositeAnimation | undefined;

    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),

        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();

      // ✅ Smooth shimmer loop
      shineAnim.setValue(-400);
      shineLoop = Animated.loop(
        Animated.timing(shineAnim, {
          toValue: 400,
          duration: 2200,
          useNativeDriver: true,
        })
      );

      shineLoop.start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.6);
      translateYAnim.setValue(60);
      shineAnim.setValue(-400);
    }

    return () => {
      shineLoop?.stop();
    };
  }, [visible, opacityAnim, scaleAnim, translateYAnim, shineAnim]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.blackOverlay} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            },
          ]}
        >
          {/* ✅ STATIC NEON BORDER */}
          <View pointerEvents="none" style={styles.neonBorder} />

          {/* ✅ STATIC NEON GLOW LIGHT */}
          <View pointerEvents="none" style={styles.neonGlowLight} />

          {/* ✅ SHIMMER STRIP */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shineWrapper,
              {
                transform: [{ translateX: shineAnim }, { rotate: "25deg" }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0.55)",
                "rgba(255,255,255,0)",
              ]}
              style={styles.shineGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.desc}>
            This feature is under coding | Stay tuned ✨
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.btn}
            onPress={onClose}
          >
            <Text style={styles.btnText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.78)",
  },

  card: {
    width: "85%",
    borderRadius: 28,
    padding: 26,
    overflow: "hidden",

    backgroundColor: "rgba(25,25,25,0.90)",

    borderWidth: 1.5,
    borderColor: "rgba(0,255,255,0.35)",

    shadowColor: "rgba(0,255,255,1)",
    shadowOpacity: 0.9,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },

    elevation: 35,
    alignItems: "center",
  },

  neonBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(0,255,255,0.85)",
  },

  neonGlowLight: {
    position: "absolute",
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,

    borderRadius: 40,
    backgroundColor: "rgba(0,255,255,0.12)",
  },

  shineWrapper: {
    position: "absolute",
    top: -120,
    left: -220,
    width: 220,
    height: 650,
    opacity: 0.6,
  },

  shineGradient: {
    width: "100%",
    height: "100%",
  },

  title: {
    fontSize: 20,
    color: "white",
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  desc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
  },

  btn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(0,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.45)",
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
