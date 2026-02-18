import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const BackIcon = require("@/src/assets/images/back.png");

// tokens
const RedToken = require("@/src/assets/images/piles/red_1024_transparent.png");
const GreenToken = require("@/src/assets/images/piles/green_1024_transparent.png");
const YellowToken = require("@/src/assets/images/piles/yellow_1024_transparent.png");
const BlueToken = require("@/src/assets/images/piles/blue_1024_transparent.png");


const TOKEN_LIST = [
  { id: "red", img: RedToken },
  { id: "green", img: GreenToken },
  { id: "yellow", img: YellowToken },
  { id: "blue", img: BlueToken },
];

export default function SelectMode() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { entryCoins } = useLocalSearchParams<{ entryCoins?: string }>();
  const entry = Number(entryCoins || 100);

  const createRoom = useMutation(api.rooms.createRoom);

  const userId = "user123"; // later Clerk user.id
  const userName = "Player";

  const [mode, setMode] = useState<"classic" | "quick">("classic");
  const [playersCount, setPlayersCount] = useState<2 | 3 | 4>(4);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
const showToast = (msg: string) => {
  setToastMsg(msg);

  setTimeout(() => {
    setToastMsg("");
  }, 4000);
};


  // token selection state
  const [selectedTokens, setSelectedTokens] = useState<string[]>([
    "red",
    "green",
    "yellow",
    "blue",
  ]);

  // glow animation
  const glowAnim = useRef(new Animated.Value(0)).current;

  // scale helper
  const s = (val: number) => {
    const base = 390;
    const scale = width / base;
    return Math.round(val * Math.min(Math.max(scale, 0.85), 1.4));
  };

  // auto defaults when players change
  useEffect(() => {
    if (playersCount === 2) {
      setSelectedTokens(["red", "yellow"]); // default pair
    }

    if (playersCount === 3) {
      setSelectedTokens(["red", "green", "yellow"]); // default 3
    }

    if (playersCount === 4) {
      setSelectedTokens(["red", "green", "yellow", "blue"]);
    }

    // glow effect trigger
    glowAnim.setValue(0);
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [playersCount]);

  const styles = useMemo(() => {
    const cardWidth = Math.min(width * 0.9, isTablet ? 540 : 440);

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      },

      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.65)",
      },

      backBtn: {
        position: "absolute",
        left: s(14),
        bottom: s(18),
        zIndex: 999,
        width: s(75),
        height: s(75),
        justifyContent: "center",
        alignItems: "center",
      },

      backIcon: {
        width: s(62),
        height: s(62),
        resizeMode: "contain",
      },

      panel: {
        width: cardWidth,
        backgroundColor: "#7b0c0c",
        borderRadius: s(18),
        borderWidth: s(4),
        borderColor: "#e8ae02",
        paddingBottom: s(22),
        shadowColor: "#f4c400",
        shadowRadius: s(20),
        elevation: 20,
      },

      title: {
        marginTop: s(22),
        fontSize: s(24),
        fontWeight: "900",
        color: "#ffd24a",
        textAlign: "center",
        textTransform: "uppercase",
        textShadowColor: "#000",
        textShadowRadius: 8,
      },

      subtitle: {
        marginTop: s(16),
        fontSize: s(16),
        fontWeight: "900",
        color: "#ffffff",
        textAlign: "center",
        textTransform: "uppercase",
      },

      modeRow: {
        marginTop: s(14),
        flexDirection: "row",
        justifyContent: "center",
        gap: s(12),
      },

      modeBtnWrap: {
        width: s(150),
        height: s(58),
        borderRadius: s(16),
        overflow: "hidden",
        borderWidth: s(3),
        borderColor: "#ffd24a",
      },

      modeBtnInner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },

      modeText: {
        fontSize: s(16),
        fontWeight: "900",
        color: "#fff",
        textTransform: "uppercase",
        textShadowColor: "#000",
        textShadowRadius: 6,
      },

      playersRow: {
        marginTop: s(14),
        flexDirection: "row",
        justifyContent: "center",
        gap: s(12),
      },

      playerBtn: {
        width: s(80),
        height: s(56),
        borderRadius: s(16),
        borderWidth: s(3),
        borderColor: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "center",
        alignItems: "center",
      },

      playerBtnActive: {
        backgroundColor: "#ffd24a",
        borderColor: "#e8ae02",
      },

      playerText: {
        fontSize: s(18),
        fontWeight: "900",
        color: "#fff",
      },

      playerTextActive: {
        color: "#000",
      },

      tokenPreviewWrap: {
        marginTop: s(14),
        alignSelf: "center",
        flexDirection: "row",
        gap: s(12),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.25)",
        borderWidth: s(2),
        borderColor: "rgba(255,255,255,0.25)",
        borderRadius: s(18),
        paddingVertical: s(12),
        paddingHorizontal: s(16),
      },

  tokenBox: {
  width: s(70),
  height: s(70),
  borderRadius: s(18),
  justifyContent: "center",
  alignItems: "center",
  borderWidth: s(2),
  borderColor: "rgba(255,255,255,0.2)",

  backgroundColor: "transparent", // ✅ IMPORTANT FIX
  overflow: "visible", // ✅ IMPORTANT FIX (glow needs visible)
},


tokenBoxActive: {
  borderColor: "#00ffff",
  backgroundColor: "rgba(0,255,255,0.12)",

  // ❌ REMOVE shadow (causes square)
  shadowColor: undefined,
  shadowOpacity: 0,
  shadowRadius: 0,

  // ❌ REMOVE elevation (main reason)
  elevation: 0,

  transform: [{ scale: 1.06 }],
},




tokenBoxInactive: {
  borderColor: "rgba(255,255,255,0.18)",
  backgroundColor: "transparent", // ✅ IMPORTANT
  opacity: 0.45,
},



tokenImg: {
  width: "85%",
  height: "85%",
  resizeMode: "contain",
  backgroundColor: "transparent", // ✅ IMPORTANT
},

glowRing: {
  position: "absolute",
  width: "100%",
  height: "100%",
  borderRadius: 18,
  borderWidth: 0,
  borderColor: "#00ffff",
  backgroundColor: "rgba(0,255,255,0.15)",
},


      note: {
        marginTop: s(10),
        textAlign: "center",
        fontSize: s(13),
        fontWeight: "800",
        color: "#ffffff",
        opacity: 0.85,
      },

      entryInfo: {
        marginTop: s(18),
        fontSize: s(16),
        fontWeight: "900",
        color: "#00ff66",
        textAlign: "center",
        textTransform: "uppercase",
        paddingHorizontal: s(10),
      },

      mainBtn: {
        marginTop: s(22),
        width: "85%",
        alignSelf: "center",
        borderRadius: s(18),
        overflow: "hidden",
        borderWidth: s(4),
        borderColor: "#e8ae02",
      },

      btnGradient: {
        paddingVertical: s(14),
        alignItems: "center",
      },

      mainBtnText: {
        fontSize: s(20),
        fontWeight: "900",
        color: "#ffffff",
        textTransform: "uppercase",
        textShadowColor: "#000",
        textShadowRadius: 6,
      },
      
      toastBox: {
  position: "absolute",
  bottom: s(110),
  paddingHorizontal: s(18),
  paddingVertical: s(10),
  borderRadius: s(16),
  backgroundColor: "#000",
  borderWidth: s(2),
  borderColor: "#ffd24a",
  shadowColor: "#ffd24a",
  shadowOpacity: 0.9,
  shadowRadius: s(10),
  elevation: 20,
},

toastText: {
  fontSize: s(13),
  fontWeight: "900",
  color: "#ffd24a",
  textAlign: "center",
  textTransform: "uppercase",
},

    });
  }, [width]);

  // token click logic
  const handleTokenPress = (id: string) => {
    // 4P fixed
    if (playersCount === 4) return;

    // 2P only 2 pairs allowed
    if (playersCount === 2) {
      if (id === "red" || id === "yellow") {
        setSelectedTokens(["red", "yellow"]);
      } else {
        setSelectedTokens(["green", "blue"]);
      }
      return;
    }

    // 3P choose any 3
    if (playersCount === 3) {
      setSelectedTokens((prev) => {
        if (prev.includes(id)) {
          // cannot remove if it makes < 3
          if (prev.length === 3) return prev.filter((x) => x !== id);
          return prev;
        }

        // max 3 tokens
        if (prev.length >= 3) {
  showToast("Deselect a token first to select this token");
  return prev;
}


        return [...prev, id];
      });
    }
  };

  const canCreate =
    playersCount === 4
      ? true
      : playersCount === 2
      ? selectedTokens.length === 2
      : selectedTokens.length === 3;

  const handleCreate = async () => {
    try {
      if (!canCreate) return;

      setLoading(true);

      const res = await createRoom({
        hostId: userId,
        hostName: userName,
        maxPlayers: playersCount,
        playersCount: playersCount,
        mode: mode,
        entryCoins: entry,

        // IMPORTANT: you must add this field in schema if not added
        tokenColors: selectedTokens,
      });

      router.push({
        pathname: "/pages_modals/online/room/[code]",
        params: { code: res.code },
      });
    } catch (err: any) {
      console.log("CREATE ROOM ERROR:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  const noteText =
    playersCount === 2
      ? "Select any one pair"
      : playersCount === 3
      ? "Select any 3 token colors"
      : "All tokens selected";

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />

      <View style={styles.panel}>
        <Text style={styles.title}>SELECT MODE</Text>

        {/* MODE */}
        <Text style={styles.subtitle}>GAME MODE</Text>

        <View style={styles.modeRow}>
          <Pressable onPress={() => setMode("classic")} style={styles.modeBtnWrap}>
            <LinearGradient
              colors={
                mode === "classic"
                  ? ["#ffd24a", "#ffb300"]
                  : ["#2a2a2a", "#0d0d0d"]
              }
              style={styles.modeBtnInner}
            >
              <Text style={styles.modeText}>CLASSIC</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => setMode("quick")} style={styles.modeBtnWrap}>
            <LinearGradient
              colors={
                mode === "quick"
                  ? ["#ffd24a", "#ffb300"]
                  : ["#2a2a2a", "#0d0d0d"]
              }
              style={styles.modeBtnInner}
            >
              <Text style={styles.modeText}>QUICK</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* PLAYERS */}
        <Text style={styles.subtitle}>PLAYERS</Text>

        <View style={styles.playersRow}>
          {[2, 3, 4].map((p) => {
            const active = playersCount === p;

            return (
              <Pressable
                key={p}
                style={[styles.playerBtn, active && styles.playerBtnActive]}
                onPress={() => setPlayersCount(p as 2 | 3 | 4)}
              >
                <Text style={[styles.playerText, active && styles.playerTextActive]}>
                  {p}P
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* TOKENS */}
        <Text style={styles.subtitle}>TOKENS</Text>

        <Animated.View
          style={[
            styles.tokenPreviewWrap,
            {
              borderColor: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["rgba(255,255,255,0.25)", "#00ffff"],
              }),
            },
          ]}
        >
          {TOKEN_LIST.map((t) => {
            const selected = selectedTokens.includes(t.id);

            return (
           <Pressable
  key={t.id}
  onPress={() => handleTokenPress(t.id)}
  style={[
    styles.tokenBox,
    selected ? styles.tokenBoxActive : styles.tokenBoxInactive,
  ]}
>
  {selected && <View style={styles.glowRing} />}

  <Image source={t.img} style={styles.tokenImg} />
</Pressable>


            );
          })}
        </Animated.View>

        <Text style={styles.note}>{noteText}</Text>

        {/* ENTRY */}
        <Text style={styles.entryInfo}>
          {mode === "classic" ? "Classic" : "Quick"} &gt; Entry Amount : {entry}
        </Text>

        {/* CREATE BUTTON */}
        <Pressable
          style={[
            styles.mainBtn,
            (loading || !canCreate) && { opacity: 0.6 },
          ]}
          onPress={handleCreate}
          disabled={loading || !canCreate}
        >
          <LinearGradient
            colors={["#1efbe3", "#00c3b2", "#009e91"]}
            style={styles.btnGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainBtnText}>CREATE ROOM</Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>

{toastMsg !== "" && (
  <View style={styles.toastBox}>
    <Text style={styles.toastText}>{toastMsg}</Text>
  </View>
)}

      {/* BACK */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Image source={BackIcon} style={styles.backIcon} />
      </Pressable>
    </View>
  );
}
