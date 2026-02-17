import React, { useEffect, useRef, useState } from "react";
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

const RedToken = require("@/src/assets/images/piles/red_1024.png");
const GreenToken = require("@/src/assets/images/piles/green_1024.png");
const YellowToken = require("@/src/assets/images/piles/yellow_1024.png");
const BlueToken = require("@/src/assets/images/piles/blue_1024.png");

type Props = {
  visible: boolean;
  mode: "classic" | "quick";
  onClose: () => void;
  onPlay: (players: number, colors: string[]) => void;
};

const TOKEN_LIST = [
  { id: "red", img: RedToken },
  { id: "green", img: GreenToken },
  { id: "yellow", img: YellowToken },
  { id: "blue", img: BlueToken },
];

export default function SelectPersonTokenModal({
  visible,
  mode,
  onClose,
  onPlay,
}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [playerCount, setPlayerCount] = useState(2);

  // ✅ For 2P & 4P
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "red",
    "yellow",
  ]);

  // ✅ For 3P Grid (3 rows)
  const [selectedGrid, setSelectedGrid] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);

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
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // AUTO DEFAULTS
  useEffect(() => {
    if (playerCount === 2) {
      setSelectedColors(["red", "yellow"]);
    }

    if (playerCount === 3) {
      setSelectedGrid(["red", "green", "yellow"]); // default diagonal
    }

    if (playerCount === 4) {
      setSelectedColors(["red", "green", "yellow", "blue"]);
    }
  }, [playerCount]);

  // ✅ 2P token logic
  const handleTokenPress = (id: string) => {
    if (playerCount === 4) return;

    if (playerCount === 2) {
      if (id === "red" || id === "yellow") {
        setSelectedColors(["red", "yellow"]);
      } else {
        setSelectedColors(["green", "blue"]);
      }
      return;
    }
  };

  // ✅ 3P Grid logic (1 per row, 1 per column)
  const handleGridTokenPress = (rowIndex: number, colorId: string) => {
    setSelectedGrid((prev) => {
      const updated = [...prev];

      // if same row selected again => toggle off
      if (updated[rowIndex] === colorId) {
        updated[rowIndex] = null;
        return updated;
      }

      // if color already selected in another row => blocked (column lock)
      if (updated.includes(colorId)) return prev;

      updated[rowIndex] = colorId;
      return updated;
    });
  };

  // ✅ canPlay logic
  const canPlay =
    playerCount === 3
      ? selectedGrid.every((x) => x !== null)
      : selectedColors.length === playerCount;

  const handlePlay = () => {
    if (playerCount === 3) {
      onPlay(3, selectedGrid as string[]);
    } else {
      onPlay(playerCount, selectedColors);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#ffe168", "#ffb300", "#ff8800"]}
            style={styles.goldBorder}
          >
            <View style={styles.innerCard}>
              <Text style={styles.title}>
                {mode === "classic" ? "CLASSIC MODE" : "QUICK MODE"}
              </Text>

              <Text style={styles.subtitle}>SELECT PLAYERS</Text>

              <View style={styles.playerRow}>
                {[2, 3, 4].map((num) => (
                  <Pressable
                    key={num}
                    onPress={() => setPlayerCount(num)}
                    style={[
                      styles.playerBtn,
                      playerCount === num && styles.playerBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.playerText,
                        playerCount === num && styles.playerTextActive,
                      ]}
                    >
                      {num}P
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.subtitle}>SELECT TOKENS</Text>

              {/* ✅ 3P GRID UI */}
              {playerCount === 3 ? (
                <View style={styles.gridWrap}>
                  {[0, 1, 2].map((rowIndex) => (
                    <View key={rowIndex} style={styles.gridRow}>
                      {TOKEN_LIST.map((t) => {
                        const selected = selectedGrid[rowIndex] === t.id;
                        const disabled =
                          selectedGrid.includes(t.id) && !selected;

                        return (
                          <Pressable
                            key={t.id}
                            disabled={disabled}
                            onPress={() =>
                              handleGridTokenPress(rowIndex, t.id)
                            }
                            style={[
                              styles.gridTokenBox,
                              selected && styles.gridTokenActive,
                              disabled && styles.gridTokenDisabled,
                            ]}
                          >
                            <Image source={t.img} style={styles.gridTokenImg} />
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              ) : (
                /* ✅ NORMAL 2P / 4P UI */
                <View style={styles.tokenRow}>
                  {TOKEN_LIST.map((t) => {
                    const selected = selectedColors.includes(t.id);

                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => handleTokenPress(t.id)}
                        style={[
                          styles.tokenBox,
                          selected && styles.tokenBoxActive,
                          !selected && styles.tokenBoxInactive,
                        ]}
                      >
                        <Image source={t.img} style={styles.tokenImg} />
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {playerCount === 2 && (
                <Text style={styles.note}>
                  Select Any One Pair 
                </Text>
              )}

              {playerCount === 3 && (
                <Text style={styles.note}>
                  Select Any 3 Token Colors
                </Text>
              )}

              {playerCount === 4 && (
                <Text style={styles.note}>All tokens selected</Text>
              )}

              <Pressable
                disabled={!canPlay}
                style={[styles.playBtnWrap, !canPlay && { opacity: 0.4 }]}
                onPress={handlePlay}
              >
                <LinearGradient
                  colors={["#1efbe3", "#00c3b2", "#009e91"]}
                  style={styles.playBtn}
                >
                  <Text style={styles.playText}>PLAY</Text>
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

const CARD_W = width * 0.9;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: CARD_W,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 30,
  },

  goldBorder: {
    padding: 3,
    borderRadius: 22,
  },

  innerCard: {
    backgroundColor: "#004c8a",
    borderRadius: 20,
    padding: 18,
    paddingBottom: 26,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    color: "#ffd700",
    marginBottom: 14,
    textShadowColor: "#000",
    textShadowRadius: 6,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },

  playerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },

  playerBtn: {
    width: 70,
    height: 55,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },

  playerBtnActive: {
    backgroundColor: "#ffd700",
  },

  playerText: {
    fontSize: 18,
    fontWeight: "900",
    color: "white",
  },

  playerTextActive: {
    color: "#000",
  },

  tokenRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 10,
  },

  tokenBox: {
    width: 75,
    height: 75,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },

  tokenBoxActive: {
    borderColor: "#00ffff",
    backgroundColor: "rgba(0,255,255,0.12)",
    shadowColor: "#00ffff",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 20,
    transform: [{ scale: 1.06 }],
  },

  tokenBoxInactive: {
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(0,0,0,0.25)",
    opacity: 0.4,
  },

  tokenImg: {
    width: 62,
    height: 62,
    resizeMode: "contain",
  },

  // ✅ 3P GRID STYLES
  gridWrap: {
    marginTop: 10,
    gap: 12,
  },

  gridRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  gridTokenBox: {
    width: 55,
    height: 55,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  gridTokenImg: {
    width: 42,
    height: 42,
    resizeMode: "contain",
  },

  gridTokenActive: {
    borderColor: "#00ffff",
    backgroundColor: "rgba(0,255,255,0.15)",
    shadowColor: "#00ffff",
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 15,
    transform: [{ scale: 1.08 }],
  },

  gridTokenDisabled: {
    opacity: 0.25,
  },

  note: {
    marginTop: 12,
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    opacity: 0.85,
  },

  playBtnWrap: {
    width: "100%",
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden",
  },

  playBtn: {
    height: 62,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },

  playText: {
    fontSize: 22,
    fontWeight: "900",
    color: "white",
    textShadowColor: "#000",
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
