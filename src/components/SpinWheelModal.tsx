import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Image,
  Vibration,
} from "react-native";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  onReward: (coins: number) => void;
};

const WheelImg = require("@/src/assets/images/spin_wheel.png");
const PointerImg = require("@/src/assets/images/pointer.png");

export default function SpinWheelModal({ visible, onClose, onReward }: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [spinning, setSpinning] = useState(false);

  // MUST match your wheel design order (clockwise from pointer position)
  const rewards = useMemo(
    () => [50, 200, 150, 100, 50, 1000, 100, 50, 300, 50, 200, 150],
    []
  );

  const segmentCount = rewards.length;
  const segmentAngle = 360 / segmentCount;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 10,
      }).start();
    } else {
      scaleAnim.setValue(0.9);
      rotateAnim.setValue(0);
      setSpinning(false);
    }
  }, [visible]);

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    Vibration.vibrate(25);

    const rewardIndex = Math.floor(Math.random() * segmentCount);
    const rewardValue = rewards[rewardIndex];

    const randomExtraSpins = 7 + Math.floor(Math.random() * 3); // 7-9 spins

    // pointer at top => index 0 must stop at top
    const targetAngle = rewardIndex * segmentAngle;

    const stopAngle = randomExtraSpins * 360 + (360 - targetAngle);

    Animated.timing(rotateAnim, {
      toValue: stopAngle,
      duration: 5200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      onReward(rewardValue);
    });
  };

  const wheelRotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[styles.popup, { transform: [{ scale: scaleAnim }] }]}>
          <BlurView intensity={45} tint="dark" style={styles.blurBox}>
            <Text style={styles.title}>WHEEL OF COINS</Text>

            {/* Wheel + Pointer Wrapper */}
            <View style={styles.wheelWrap}>
              {/* POINTER (fixed) */}
              <Image source={PointerImg} style={styles.pointer} />

              {/* ROTATING WHEEL ONLY */}
              <Animated.View style={[styles.wheelHolder, { transform: [{ rotate: wheelRotate }] }]}>
                <Image source={WheelImg} style={styles.wheel} />
              </Animated.View>
            </View>

            {/* BUTTON */}
            <Pressable
              style={[styles.spinBtn, spinning && { opacity: 0.55 }]}
              disabled={spinning}
              onPress={spinWheel}
            >
              <Text style={styles.spinBtnText}>
                {spinning ? "SPINNING..." : "PREMIUM SPIN"}
              </Text>
            </Pressable>

            {/* CLOSE */}
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const WHEEL_SIZE = width * 0.70;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    alignItems: "center",
  },

  popup: {
    width: width * 0.9,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    elevation: 35,
  },

  blurBox: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#ffd700",
    letterSpacing: 2,
    textShadowColor: "#ffcc00",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 12,
  },

  wheelWrap: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE + 30,
    justifyContent: "center",
    alignItems: "center",
  },

  wheelHolder: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },

  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    resizeMode: "contain",
  },

  pointer: {
    position: "absolute",
    top: 4,
    width: 56,
    height: 56,
    resizeMode: "contain",
    zIndex: 99,
  },

  spinBtn: {
    marginTop: 16,
    width: "85%",
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffb400",
    borderWidth: 2,
    borderColor: "#fff1a8",
    elevation: 10,
  },

  spinBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#5b2200",
    letterSpacing: 1,
  },

  closeBtn: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  closeText: {
    fontSize: 18,
    fontWeight: "900",
    color: "white",
  },
});
