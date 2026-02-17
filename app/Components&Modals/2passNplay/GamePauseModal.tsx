import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
   Image,
  Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
const BackIcon = require("@/src/assets/images/back.png");

type Props = {
  visible: boolean;
  onClose: () => void;

  mode: "quick" | "classic";

  fxOn: boolean;
  musicOn: boolean;
  allSoundOn: boolean;

  onToggleFX: () => void;
  onToggleMusic: () => void;
  onToggleAllSound: () => void;

  onExitGame: () => void;
};

export default function GamePauseModal({
  visible,
  onClose,
  mode,
  fxOn,
  musicOn,
  allSoundOn,
  onToggleFX,
  onToggleMusic,
  onToggleAllSound,
  onExitGame,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const confirmScaleAnim = useRef(new Animated.Value(0.7)).current;
  const confirmOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowConfirm(false);

      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (showConfirm) {
      confirmScaleAnim.setValue(0.7);
      confirmOpacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(confirmOpacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(confirmScaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showConfirm]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowConfirm(false);
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* BLUR */}
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.dimLayer} />

        {/* MAIN CARD */}
        <Animated.View
          style={[
            styles.box,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* TOP BAR */}
          <View style={styles.topBar}>
            <Pressable
  onPress={() => {
    if (showConfirm) setShowConfirm(false);
    else handleClose();
  }}
>
  <Image source={BackIcon} style={styles.backImg} />
</Pressable>


            <Text style={styles.title}>GAME PAUSED</Text>

            <View style={{ width: 44 }} />
          </View>

          {/* MODE */}
          <Text style={styles.modeTitle}>
            {mode === "quick" ? "QUICK MODE" : "CLASSIC MODE"}
          </Text>

          <Text style={styles.subTitle}>
            {mode === "quick"
              ? "Pass Any 2 Tokens To Win"
              : "Pass All 4 Tokens To Win"}
          </Text>

          {/* SOUND BUTTONS */}
          <View style={styles.soundRow}>
            <Pressable
              style={[styles.soundBtn, fxOn ? styles.activeBtn : styles.offBtn]}
              onPress={onToggleFX}
            >
              <Ionicons
                name={fxOn ? "volume-high" : "volume-mute"}
                size={20}
                color="white"
              />
              <Text style={styles.soundText}>{fxOn ? "FX ON" : "FX OFF"}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.soundBtn,
                musicOn ? styles.activeBtn : styles.offBtn,
              ]}
              onPress={onToggleMusic}
            >
              <Ionicons
                name={musicOn ? "musical-notes" : "musical-note"}
                size={20}
                color="white"
              />
              <Text style={styles.soundText}>
                {musicOn ? "MUSIC ON" : "MUSIC OFF"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.soundRow}>
            <Pressable
              style={[
                styles.soundBtn,
                allSoundOn ? styles.activeBtnBlue : styles.offBtn,
              ]}
              onPress={onToggleAllSound}
            >
              <MaterialCommunityIcons
                name={allSoundOn ? "speaker" : "speaker-off"}
                size={20}
                color="white"
              />
              <Text style={styles.soundText}>
                {allSoundOn ? "ALL SOUND" : "MUTE ALL"}
              </Text>
            </Pressable>
          </View>

          {/* EXIT GAME */}
          <Pressable style={styles.exitBtn} onPress={() => setShowConfirm(true)}>
            <MaterialCommunityIcons name="door-open" size={20} color="white" />
            <Text style={styles.exitText}>EXIT GAME</Text>
          </Pressable>

          {/* CONFIRM BOX */}
          {showConfirm && (
            <Animated.View
              style={[
                styles.confirmBox,
                {
                  opacity: confirmOpacityAnim,
                  transform: [{ scale: confirmScaleAnim }],
                },
              ]}
            >
              <Text style={styles.confirmTitle}>Exit Game?</Text>
              <Text style={styles.confirmSub}>
                Your match will be ended.
              </Text>

              <View style={styles.confirmRow}>
                {/* PLAY = CLOSE MODAL */}
                <Pressable
                  style={styles.playBtn}
                  onPress={() => {
                    setShowConfirm(false);
                    handleClose(); // ✅ CLOSE FULL MODAL
                  }}
                >
                  <Ionicons name="play" size={18} color="white" />
                  <Text style={styles.playText}>PLAY</Text>
                </Pressable>

                {/* EXIT */}
                <Pressable
                  style={styles.exitConfirmBtn}
                  onPress={() => {
                    setShowConfirm(false);
                    handleClose();
                    setTimeout(() => onExitGame(), 220);
                  }}
                >
                  <MaterialCommunityIcons
                    name="exit-run"
                    size={18}
                    color="white"
                  />
                  <Text style={styles.exitConfirmText}>EXIT</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
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

  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  box: {
    width: 330,
    borderRadius: 26,
    padding: 18,
    backgroundColor: "rgba(0, 6, 30, 0.92)",
    borderWidth: 1.5,
    borderColor: "rgba(0,255,255,0.55)",
    elevation: 25,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  title: {
    color: "white",
    fontSize: 17,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: 2,
  },

  modeTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    letterSpacing: 1.6,
  },

  subTitle: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },

  soundRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  soundBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: 6,
  },

  activeBtn: {
    backgroundColor: "rgba(0, 255, 34, 0.35)",
    borderColor: "rgba(0,255,140,0.55)",
  },

  activeBtnBlue: {
    backgroundColor: "rgba(0, 255, 225, 0.28)",
    borderColor: "rgba(0,200,255,0.55)",
  },

  offBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
  },

  soundText: {
    color: "white",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // ✅ EXIT GAME NO GLOW
  exitBtn: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(214, 0, 0, 0.85)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  exitText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  confirmBox: {
    marginTop: 18,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  confirmTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
  },

  confirmSub: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  confirmRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  playBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,200,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(0,200,255,0.55)",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  playText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  exitConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(206, 6, 6, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,50,50,0.55)",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  exitConfirmText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  backImg: {
  width: 60,
  height: 60,
  resizeMode: "contain",
},

});
