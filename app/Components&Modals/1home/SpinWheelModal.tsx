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
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  onReward: (coins: number) => void;
};

const WheelImg = require("@/src/assets/images/spin_wheel.png");
const PointerImg = require("@/src/assets/images/pointer.png");

const WHEEL_SIZE = width * 0.7;

// ⭐ SETTINGS
const MAX_SPINS_PER_HOUR = 99;
const COOLDOWN_MS = 60 * 60 * 1000;

// 🔥 IMPORTANT FIX
// this shifts reward index until it matches your PNG pointer
// change this value only if mismatch happens
const POINTER_INDEX_SHIFT = 1;

export default function SpinWheelModal({ visible, onClose, onReward }: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [spinning, setSpinning] = useState(false);

  const [spinsLeft, setSpinsLeft] = useState(MAX_SPINS_PER_HOUR);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const { isSignedIn, user } = useUser();
  const addCoins = useMutation(api.users.addCoins);

  // ✅ CLOCKWISE FROM TOP
  const rewards = useMemo(
    () => [
      1000, 300, 2000, 400,
      100, 500, 200, 100,
      1000, 300, 10000, 400,
      600, 800, 900, 200,
    ],
    []
  );

  const segmentCount = rewards.length;
  const segmentAngle = 360 / segmentCount;

  // ✅ reward finder with correct mapping
  const getRewardFromAngle = (angle: number) => {
    const fixed = ((angle % 360) + 360) % 360;

    // pointer is TOP, but wheel rotates clockwise visually
    const rawIndex = Math.floor(((360 - fixed) % 360) / segmentAngle);

    const finalIndex =
      (rawIndex + POINTER_INDEX_SHIFT + segmentCount) % segmentCount;

    return rewards[finalIndex];
  };

  useEffect(() => {
    if (!visible) return;

    const loadSpinData = async () => {
      const saved = await AsyncStorage.getItem("SPIN_DATA");

      if (!saved) {
        setSpinsLeft(MAX_SPINS_PER_HOUR);
        setCooldownLeft(0);
        return;
      }

      const parsed = JSON.parse(saved);
      const { spinsUsed, startTime } = parsed;

      const now = Date.now();
      const diff = now - startTime;

      if (diff >= COOLDOWN_MS) {
        setSpinsLeft(MAX_SPINS_PER_HOUR);
        setCooldownLeft(0);

        await AsyncStorage.setItem(
          "SPIN_DATA",
          JSON.stringify({ spinsUsed: 0, startTime: now })
        );
      } else {
        setSpinsLeft(MAX_SPINS_PER_HOUR - spinsUsed);
        setCooldownLeft(COOLDOWN_MS - diff);
      }
    };

    loadSpinData();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1000) return 0;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

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

  const formatTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const updateSpinStorage = async () => {
    const saved = await AsyncStorage.getItem("SPIN_DATA");
    const now = Date.now();

    if (!saved) {
      await AsyncStorage.setItem(
        "SPIN_DATA",
        JSON.stringify({ spinsUsed: 1, startTime: now })
      );
      setSpinsLeft(MAX_SPINS_PER_HOUR - 1);
      setCooldownLeft(COOLDOWN_MS);
      return;
    }

    const parsed = JSON.parse(saved);
    let { spinsUsed, startTime } = parsed;

    if (now - startTime >= COOLDOWN_MS) {
      spinsUsed = 0;
      startTime = now;
    }

    spinsUsed += 1;

    await AsyncStorage.setItem(
      "SPIN_DATA",
      JSON.stringify({ spinsUsed, startTime })
    );

    setSpinsLeft(MAX_SPINS_PER_HOUR - spinsUsed);
    setCooldownLeft(COOLDOWN_MS - (now - startTime));
  };

  const spinWheel = async () => {
    if (spinning) return;

    if (spinsLeft <= 0 && cooldownLeft > 0) {
      Vibration.vibrate(30);
      return;
    }

    setSpinning(true);
    Vibration.vibrate(25);

    const extraSpins = 8 + Math.floor(Math.random() * 3);
    const randomAngle = Math.random() * 360;
    const stopAngle = extraSpins * 360 + randomAngle;

    Animated.timing(rotateAnim, {
      toValue: stopAngle,
      duration: 4500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      setSpinning(false);

      const finalAngle = stopAngle % 360;
      rotateAnim.setValue(finalAngle);

      await updateSpinStorage();

      const rewardValue = getRewardFromAngle(finalAngle);

      if (isSignedIn && user?.id) {
        try {
          await addCoins({
            clerkId: user.id,
            amount: rewardValue,
          });
        } catch (err) {
          console.log("ADD COINS ERROR:", err);
        }
      }

      onReward(rewardValue);
    });
  };

  const wheelRotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const spinDisabled = spinning || (spinsLeft <= 0 && cooldownLeft > 0);

  const spinBtnText = spinning
    ? "SPINNING..."
    : spinsLeft > 0
    ? `SPIN (${spinsLeft}/${MAX_SPINS_PER_HOUR})`
    : `NEXT IN ${formatTime(cooldownLeft)}`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (!spinning) onClose();
          }}
        />

        <Animated.View style={[styles.popup, { transform: [{ scale: scaleAnim }] }]}>
          <BlurView intensity={25} tint="dark" style={styles.blurBox}>
            <Text style={styles.title}>WHEEL OF COINS</Text>

            <Pressable
              style={styles.wheelWrap}
              onPress={spinWheel}
              disabled={spinDisabled}
            >
              <Image source={PointerImg} style={styles.pointer} />

              <Animated.View
                style={[
                  styles.wheelHolder,
                  { transform: [{ rotate: wheelRotate }] },
                ]}
                renderToHardwareTextureAndroid
                shouldRasterizeIOS
              >
                <Image source={WheelImg} style={styles.wheel} />
              </Animated.View>
            </Pressable>

            <Pressable
              style={[styles.spinBtn, spinDisabled && { opacity: 0.45 }]}
              disabled={spinDisabled}
              onPress={spinWheel}
            >
              <Text style={styles.spinBtnText}>{spinBtnText}</Text>
            </Pressable>

            <Pressable
              style={[styles.closeBtn, spinning && { opacity: 0.35 }]}
              onPress={() => {
                if (!spinning) onClose();
              }}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

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
    top: -25,
    width: 80,
    height: 100,
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
