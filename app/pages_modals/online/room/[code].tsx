import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  Share,
  Alert,
  useWindowDimensions,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";

const InstagramIcon = require("@/src/assets/images/header/instagram.png");
const BackIcon = require("@/src/assets/images/back.png");
const ShareIcon = require("@/src/assets/images/header/share.png");
const WhatsappIcon = require("@/src/assets/images/header/whatsapp.png");

export default function RoomLobby() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();

  const [showCopied, setShowCopied] = useState(false);
  const [joinToast, setJoinToast] = useState("");
  const prevCountRef = useRef(0);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const userId = "user123"; // later Clerk user.id

  const s = (val: number) => {
    const base = 390;
    const scale = width / base;
    return Math.round(val * Math.min(Math.max(scale, 0.85), 1.45));
  };

  const styles = useMemo(() => {
    const cardWidth = Math.min(width * 0.9, isTablet ? 560 : 430);

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      },

      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(120,0,0,0.75)",
      },

      toastBox: {
        position: "absolute",
        bottom: s(110),
        paddingHorizontal: s(22),
        paddingVertical: s(12),
        borderRadius: s(18),
        backgroundColor: "#000",
        borderWidth: s(3),
        borderColor: "#ffd24a",
        shadowColor: "#ffd24a",
        shadowOpacity: 0.9,
        shadowRadius: s(15),
        elevation: 20,
        zIndex: 999,
      },

      toastText: {
        fontSize: s(14),
        fontWeight: "900",
        color: "#ffd24a",
        textTransform: "uppercase",
        textAlign: "center",
      },

      loadingText: {
        marginTop: s(12),
        fontSize: s(16),
        fontWeight: "800",
        color: "#fff",
      },

      pageTitle: {
        fontSize: s(24),
        fontWeight: "900",
        color: "#ffd24a",
        textTransform: "uppercase",
        marginBottom: s(18),
        textShadowColor: "#000",
        textShadowRadius: s(10),
      },

      roomCard: {
        width: cardWidth,
        borderRadius: s(16),
        borderWidth: s(3),
        borderColor: "#fff",
        backgroundColor: "rgba(0,0,0,0.3)",
        padding: s(14),
        alignItems: "center",
      },

      roomRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: s(6),
      },

      roomLabel: {
        color: "#fff",
        fontSize: s(16),
        fontWeight: "900",
        marginRight: s(6),
      },

      codeBox: {
        backgroundColor: "#083a66",
        paddingHorizontal: s(14),
        paddingVertical: s(6),
        borderRadius: s(10),
        borderWidth: s(2),
        borderColor: "#ffd24a",
      },

      roomCode: {
        fontSize: s(20),
        fontWeight: "900",
        color: "#ffd24a",
        letterSpacing: 2,
      },

      copyBtn: {
        marginLeft: s(10),
        width: s(42),
        height: s(42),
        borderRadius: s(12),
        backgroundColor: "#ffd24a",
        justifyContent: "center",
        alignItems: "center",
      },

      copyText: {
        fontSize: s(20),
        fontWeight: "900",
        color: "#000",
      },

      subText: {
        marginTop: s(10),
        textAlign: "center",
        color: "#fff",
        fontWeight: "700",
        fontSize: s(13),
        lineHeight: s(16),
      },

      shareRow: {
        flexDirection: "row",
        marginTop: s(12),
        gap: s(14),
        flexWrap: "wrap",
        justifyContent: "center",
      },

      shareBtn: {
        width: s(52),
        height: s(52),
        borderRadius: s(14),
        backgroundColor: "#0a7a2d",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: s(2),
        borderColor: "#fff",
      },

      shareIcon: {
        width: s(30),
        height: s(30),
        resizeMode: "contain",
      },

      entryInfo: {
        marginTop: s(18),
        fontSize: s(16),
        fontWeight: "900",
        color: "#00ff66",
        textTransform: "uppercase",
        textAlign: "center",
        paddingHorizontal: s(10),
      },

      hostBox: {
        marginTop: s(18),
        alignItems: "center",
      },

      hostAvatar: {
        width: s(110),
        height: s(110),
        borderRadius: s(18),
        backgroundColor: "#1d1d1d",
        borderWidth: s(3),
        borderColor: "#ffd24a",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      },

      hostImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
      },

      hostName: {
        marginTop: s(8),
        fontSize: s(18),
        fontWeight: "900",
        color: "#fff",
        textTransform: "uppercase",
      },

      vsText: {
        marginTop: s(18),
        fontSize: s(36),
        fontWeight: "900",
        color: "#ffd24a",
        textShadowColor: "#fff",
        textShadowRadius: s(10),
      },

      slotRow: {
        flexDirection: "row",
        gap: s(14),
        marginTop: s(14),
        flexWrap: "wrap",
        justifyContent: "center",
        paddingHorizontal: s(12),
      },

      slotBox: {
        width: s(92),
        height: s(110),
        borderWidth: s(3),
        borderColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.25)",
        borderRadius: s(14),
        overflow: "hidden",
        paddingBottom: s(8),
      },

      slotAvatar: {
        width: s(65),
        height: s(65),
        borderRadius: s(14),
        borderWidth: s(2),
        borderColor: "#ffd24a",
        overflow: "hidden",
        backgroundColor: "#111",
      },

      slotImg: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
      },

      plusText: {
        fontSize: s(40),
        fontWeight: "900",
        color: "#ffffff",
      },

      slotText: {
        marginTop: s(6),
        fontSize: s(12),
        fontWeight: "900",
        color: "#ffd24a",
        textAlign: "center",
        paddingHorizontal: s(4),
        textTransform: "uppercase",
      },

      startBtn: {
        marginTop: s(25),
        width: Math.min(width * 0.75, isTablet ? 420 : 340),
        paddingVertical: s(14),
        borderRadius: s(18),
        backgroundColor: "#00aaff",
        borderWidth: s(3),
        borderColor: "#ffd24a",
        alignItems: "center",
      },

      startBtnDisabled: {
        opacity: 0.4,
      },

      startText: {
        fontSize: s(18),
        fontWeight: "900",
        color: "#fff",
        textTransform: "uppercase",
      },

      startedText: {
        marginTop: s(20),
        fontSize: s(18),
        fontWeight: "900",
        color: "#00ff66",
      },

      backBtn: {
        position: "absolute",
        left: s(18),
        top: s(35),
        width: s(60),
        height: s(60),
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      },

      backIcon: {
        width: s(55),
        height: s(55),
        resizeMode: "contain",
      },

      title: {
        fontSize: s(22),
        fontWeight: "900",
        color: "#ffd24a",
      },
    });
  }, [width]);

  const roomCode = String(code || "").toUpperCase();

  const data = useQuery(
    api.rooms.getRoom,
    roomCode ? { code: roomCode } : "skip"
  );

  const startGame = useMutation(api.rooms.startGame);

  useEffect(() => {
    if (!data?.players) return;

    const currentCount = data.players.length;

    if (prevCountRef.current !== 0 && currentCount > prevCountRef.current) {
      const lastPlayer = data.players[currentCount - 1];

      if (lastPlayer?.userId !== userId) {
        setJoinToast(`${lastPlayer.name} JOINED!`);

        setTimeout(() => {
          setJoinToast("");
        }, 3000);
      }
    }

    prevCountRef.current = currentCount;
  }, [data?.players]);

  if (data === undefined) {
    return (
      <View style={styles.container}>
        <View style={styles.overlay} />
        <ActivityIndicator size="large" color="#ffd24a" />
        <Text style={styles.loadingText}>Loading Room...</Text>

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Image source={BackIcon} style={styles.backIcon} />
        </Pressable>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.overlay} />
        <Text style={styles.title}>Room Not Found</Text>

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Image source={BackIcon} style={styles.backIcon} />
        </Pressable>
      </View>
    );
  }

  const { room, players, hostUser, playerUsers } = data;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(room.code);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1200);
  };

  const shareText = `Join my Ludo Room!\nRoom Code: ${room.code}\nMode: ${
    room.mode === "classic" ? "Classic" : "Quick"
  }\nPlayers: ${room.playersCount || room.maxPlayers}P\nEntry: ${
    room.entryCoins || 100
  }`;

  const handleShare = async () => {
    try {
      await Share.share({ message: shareText });
    } catch (err: any) {
      console.log("SHARE ERROR:", err?.message);
    }
  };

  const handleWhatsApp = async () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert("WhatsApp not installed");
      return;
    }

    Linking.openURL(url);
  };

  const handleInstagram = async () => {
    await Clipboard.setStringAsync(shareText);

    Alert.alert(
      "Instagram",
      "Text copied! Now paste it in Instagram DM or Story caption."
    );

    Linking.openURL("https://www.instagram.com/");
  };

  const handleStart = async () => {
    try {
      await startGame({ code: roomCode, userId });
    } catch (err: any) {
      console.log("START GAME ERROR:", err?.message);
    }
  };

  const isHost = room.hostId === userId;
  const totalJoined = players.length;

  const canStart = totalJoined >= 2; // ✅ minimum 2 players required

  const slots = [0, 1, 2].map((i) => players[i + 1]);

  const findUser = (uid: string) => {
    return playerUsers?.find((u: any) => u.userId === uid);
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Image source={BackIcon} style={styles.backIcon} />
      </Pressable>

      <Text style={styles.pageTitle}>ONLINE MULTIPLAYER</Text>

      <View style={styles.roomCard}>
        <View style={styles.roomRow}>
          <Text style={styles.roomLabel}>Room Code :</Text>

          <View style={styles.codeBox}>
            <Text style={styles.roomCode}>{room.code}</Text>
          </View>

          <Pressable style={styles.copyBtn} onPress={handleCopy}>
            <Text style={styles.copyText}>⧉</Text>
          </Pressable>
        </View>

        <Text style={styles.subText}>
          Share this room code with friends{"\n"}and ask them to join
        </Text>

        <View style={styles.shareRow}>
          <Pressable style={styles.shareBtn} onPress={handleShare}>
            <Image source={ShareIcon} style={styles.shareIcon} />
          </Pressable>

          <Pressable style={styles.shareBtn} onPress={handleWhatsApp}>
            <Image source={WhatsappIcon} style={styles.shareIcon} />
          </Pressable>

          <Pressable style={styles.shareBtn} onPress={handleInstagram}>
            <Image source={InstagramIcon} style={styles.shareIcon} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.entryInfo}>
        {room.mode === "classic" ? "Classic" : "Quick"} &gt; Entry Amount :{" "}
        {room.entryCoins || 100}
      </Text>

      {/* HOST PROFILE */}
      <View style={styles.hostBox}>
        <View style={styles.hostAvatar}>
          <Image
            source={{
              uri:
                hostUser?.imageUrl ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.hostImage}
          />
        </View>

        <Text style={styles.hostName}>
          {hostUser?.name ||
            players.find((p: any) => p.userId === room.hostId)?.name ||
            "HOST"}
        </Text>
      </View>

      <Text style={styles.vsText}>VS</Text>

      {/* PLAYER SLOTS */}
      <View style={styles.slotRow}>
        {slots.map((p: any, i: number) => {
          if (!p) {
            return (
              <View key={i} style={styles.slotBox}>
                <Text style={styles.plusText}>+</Text>
              </View>
            );
          }

          const u = findUser(p.userId);

          return (
            <View key={i} style={styles.slotBox}>
              <View style={styles.slotAvatar}>
                <Image
                  source={{
                    uri:
                      u?.imageUrl ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.slotImg}
                />
              </View>

              <Text style={styles.slotText}>{u?.name || p.name}</Text>
            </View>
          );
        })}
      </View>

      {/* START BUTTON */}
      {isHost && room.status === "waiting" && (
        <Pressable
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={styles.startText}>
            {canStart ? "START GAME" : "WAITING FOR PLAYERS"}
          </Text>
        </Pressable>
      )}

      {room.status === "playing" && (
        <Text style={styles.startedText}>Game Started 🚀</Text>
      )}

      {/* COPY TOAST */}
      {showCopied && (
        <View style={styles.toastBox}>
          <Text style={styles.toastText}>Copied to Clipboard!</Text>
        </View>
      )}

      {/* JOIN TOAST */}
      {joinToast ? (
        <View style={styles.toastBox}>
          <Text style={styles.toastText}>{joinToast}</Text>
        </View>
      ) : null}
    </View>
  );
}
