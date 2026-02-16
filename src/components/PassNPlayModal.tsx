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

type Props = {
  visible: boolean;
  coins: number;
  onClose: () => void;
  onClassic: () => void;
  on2v2: () => void;
};

export default function PassPlaySelectModal({
  visible,
  coins,
  onClose,
  onClassic,
  on2v2,
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
        {/* BACKGROUND TOUCH CLOSE */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* GOLD BORDER */}
          <LinearGradient
            colors={["#ffe168", "#ffb300", "#ff8800"]}
            style={styles.goldBorder}
          >
            <View style={styles.innerCard}>
              {/* TOP COINS */}
              <View style={styles.topRow}>
                <View style={styles.coinRow}>
                  <Image source={CoinIcon} style={styles.coinIcon} />
                  <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
                </View>
              </View>

              {/* TITLE */}
              <Text style={styles.title}>SELECT GAME</Text>

              {/* BUTTONS */}
              <Pressable style={styles.btnWrap} onPress={onClassic}>
                <LinearGradient
                  colors={["#0ef0d1", "#00b7a7", "#009c8e"]}
                  style={styles.greenBtn}
                >
                  <Text style={styles.btnText}>CLASSIC</Text>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.btnWrap} onPress={on2v2}>
                <LinearGradient
                  colors={["#0ef0d1", "#00b7a7", "#009c8e"]}
                  style={styles.greenBtn}
                >
                  <Text style={styles.btnText}>2 VS 2</Text>
                </LinearGradient>
              </Pressable>

              {/* BACK ICON BOTTOM LEFT */}
              <Pressable style={styles.backBtn} onPress={onClose}>
                <Image source={BackIcon} style={styles.backImg} />
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
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
    paddingBottom: 60,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
  },

  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  coinIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  coinText: {
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
    bottom: 10,
    left: 10,
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },

  backImg: {
    width: 58,
    height: 58,
    resizeMode: "contain",
  },
});
