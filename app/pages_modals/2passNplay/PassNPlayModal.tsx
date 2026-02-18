import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const BackIcon = require("@/src/assets/images/back.png");
const CoinIcon = require("@/src/assets/images/header/money.png");
const GemIcon = require("@/src/assets/images/header/gem.png");

type Props = {
  visible: boolean;
  onClose: () => void;
  onClassic: () => void;
  onQuick: () => void;
};

export default function PassNPlayModal({
  visible,
  onClose,
  onClassic,
  onQuick,
}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={["#ffe168", "#ffb300", "#ff8800"]}
            style={styles.goldBorder}
          >
            <View style={styles.innerCard}>

              <Text style={styles.title}>SELECT GAME</Text>

              <Pressable style={styles.btnWrap} onPress={onClassic}>
                <LinearGradient
                  colors={["#1efbe3", "#00c3b2", "#009e91"]}
                  style={styles.greenBtn}
                >
                  <Text style={styles.btnText}>CLASSIC</Text>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.btnWrap} onPress={onQuick}>
                <LinearGradient
                  colors={["#1efbe3", "#00c3b2", "#009e91"]}
                  style={styles.greenBtn}
                >
                  <Text style={styles.btnText}>QUICK MODE</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        <Pressable style={styles.backBtn} onPress={onClose}>
          <Image source={BackIcon} style={styles.backImg} />
        </Pressable>
      </View>
    </Modal>
  );
}

const CARD_W = width * 0.88;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: CARD_W,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 25,
  },

  goldBorder: {
    padding: 3,
    borderRadius: 22,
  },

  innerCard: {
    backgroundColor: "#7b0000",
    borderRadius: 20,
    padding: 18,
    paddingBottom: 24,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  icon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  amount: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },

  title: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    color: "#ffd700",
    letterSpacing: 1,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  btnWrap: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 14,
  },

  greenBtn: {
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },

  btnText: {
    fontSize: 22,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  backBtn: {
    position: "absolute",
    bottom: 30,
    left: 18,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  backImg: {
    width: 65,
    height: 65,
    resizeMode: "contain",
  },
});
