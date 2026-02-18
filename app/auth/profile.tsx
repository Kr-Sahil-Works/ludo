import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Vibration,
  ScrollView,
} from "react-native";

import { useUser, useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Keyboard } from "react-native";


import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();

  const upsertUser = useMutation(api.users.upsertUser);

  const convexUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // cosmetics
  const [avatarId, setAvatarId] = useState("1");
  const [frameId, setFrameId] = useState("default");
  const [emotePackId, setEmotePackId] = useState("basic");
  const [diceSkinId, setDiceSkinId] = useState("default");
  const [boardSkinId, setBoardSkinId] = useState("default");
const [accountCreatedAt, setAccountCreatedAt] = useState<number | null>(null);
  // username
  const [username, setUsername] = useState("");
  const [savedUsername, setSavedUsername] = useState("");

  


  // economy
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [level, setLevel] = useState(1);

  // stats
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [matchesWon, setMatchesWon] = useState(0);
  const [matchesLost, setMatchesLost] = useState(0);

  const [winStreak, setWinStreak] = useState(0);
  const [highestWinStreak, setHighestWinStreak] = useState(0);

  const [tokensCut, setTokensCut] = useState(0);
  const [timesCut, setTimesCut] = useState(0);
  const [sixCount, setSixCount] = useState(0);

  const [rankPoints, setRankPoints] = useState(0);
  const [likes, setLikes] = useState(0);
  const [vipLevel, setVipLevel] = useState(0);

  const [showSavedDialog, setShowSavedDialog] = useState(false);

const savedFade = useRef(new Animated.Value(0)).current;
const savedScale = useRef(new Animated.Value(0.85)).current;

  // ui
  const [saving, setSaving] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // shimmer animation
  const shimmer = useRef(new Animated.Value(-220)).current;

  // VIP glow pulse
  const glowPulse = useRef(new Animated.Value(0)).current;

  const dialogFade = useRef(new Animated.Value(0)).current;
  const dialogScale = useRef(new Animated.Value(0.85)).current;

  // shimmer slow loop
  useEffect(() => {
    shimmer.setValue(-250);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: width + 250,
          duration: 5200,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  // VIP glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 🚀 Auto create user in Convex if missing (IMPORTANT FIX)
  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (!user) return;

      if (convexUser === undefined) return;

      if (!convexUser) {
        await upsertUser({
          clerkId: user.id,

          // ✅ IMPORTANT: username MUST BE EMPTY
          username: "",

          name: user.fullName || "Player",
          email: user.primaryEmailAddress?.emailAddress || "",
          imageUrl: user.imageUrl || "",

          coins: 12000,
          gems: 199,
          level: 1,

          avatarId: "1",
          frameId: "default",
          emotePackId: "basic",
          diceSkinId: "default",
          boardSkinId: "default",

          accountCreatedAt: Date.now(),
        });
      }
    };

    createUserIfNeeded();
  }, [user, convexUser]);

  // ✅ Load Convex values into UI
  useEffect(() => {
    if (!convexUser) return;

    setSavedUsername(convexUser.username || "");
    setUsername(convexUser.username || "");

    setCoins(convexUser.coins ?? 12000);
    setGems(convexUser.gems ?? 199);
    setLevel(convexUser.level ?? 1);

    setAvatarId(convexUser.avatarId ?? "1");
    setFrameId(convexUser.frameId ?? "default");
    setEmotePackId(convexUser.emotePackId ?? "basic");
    setDiceSkinId(convexUser.diceSkinId ?? "default");
    setBoardSkinId(convexUser.boardSkinId ?? "default");
    setAccountCreatedAt(convexUser.accountCreatedAt ?? null);


    setMatchesPlayed(convexUser.matchesPlayed ?? 0);
    setMatchesWon(convexUser.matchesWon ?? 0);
    setMatchesLost(convexUser.matchesLost ?? 0);

    setWinStreak(convexUser.winStreak ?? 0);
    setHighestWinStreak(convexUser.highestWinStreak ?? 0);

    setTokensCut(convexUser.tokensCut ?? 0);
    setTimesCut(convexUser.timesCut ?? 0);
    setSixCount(convexUser.sixCount ?? 0);

    setRankPoints(convexUser.rankPoints ?? 0);
    setLikes(convexUser.likes ?? 0);
    setVipLevel(convexUser.vipLevel ?? 0);
  }, [convexUser]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/auth/login" />;
  }

  if (convexUser === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Fetching profile data...</Text>
      </View>
    );
  }

  const saveUsernameOnce = async () => {
    try {
      setSaving(true);

      const cleanUsername = username.trim().toLowerCase();

      if (!cleanUsername) {
        Alert.alert("Error", "Username cannot be empty");
        return;
      }

      if (cleanUsername.length < 3) {
        Alert.alert("Error", "Username must be at least 3 characters");
        return;
      }

      if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
        Alert.alert("Error", "Only letters, numbers, underscore allowed");
        return;
      }

      if (savedUsername) {
        Alert.alert("Username Locked", "You cannot change username again.");
        return;
      }

      await upsertUser({
        clerkId: user!.id,
        username: cleanUsername,

        name: user?.fullName || "Player",
        email: user?.primaryEmailAddress?.emailAddress || "",
        imageUrl: user?.imageUrl || "",

        coins,
        gems,
        level,

        avatarId,
        frameId,
        emotePackId,
        diceSkinId,
        boardSkinId,
      });

      setSavedUsername(cleanUsername);
      setShowSavedDialog(true);

savedFade.setValue(0);
savedScale.setValue(0.85);

Animated.parallel([
  Animated.timing(savedFade, {
    toValue: 1,
    duration: 260,
    useNativeDriver: true,
  }),
  Animated.spring(savedScale, {
    toValue: 1,
    friction: 6,
    tension: 60,
    useNativeDriver: true,
  }),
]).start();

    } catch (e) {
      console.log("SAVE ERROR:", e);
      Alert.alert("Error", "Failed to save username");
    } finally {
      setSaving(false);
    }
  };

  const isUsernameLocked = savedUsername.length > 0;

  return (
    <LinearGradient
      colors={["#070812", "#14092e", "#070812"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* TOP HEADER */}
        <View style={styles.topRow}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.backText}>← Home</Text>
          </Pressable>

          <Text style={styles.title}>Profile</Text>

          <Pressable
            style={styles.logoutMiniBtn}
            onPress={() => {
              Vibration.vibrate(20);
              setShowLogout(true);

              dialogFade.setValue(0);
              dialogScale.setValue(0.85);

              Animated.parallel([
                Animated.timing(dialogFade, {
                  toValue: 1,
                  duration: 260,
                  useNativeDriver: true,
                }),
                Animated.spring(dialogScale, {
                  toValue: 1,
                  friction: 6,
                  tension: 60,
                  useNativeDriver: true,
                }),
              ]).start();
            }}
          >
            <Text style={styles.logoutMiniText}>Logout</Text>
          </Pressable>
        </View>

        {/* USER INFO */}
        <View style={styles.profileRow}>
          <View style={styles.avatarFrame}>
            <LinearGradient
              colors={["#ffe168", "#ffb300", "#ff8800"]}
              style={styles.avatarBorder}
            >
              <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
            </LinearGradient>

            <LinearGradient
              colors={["#ffe168", "#ffb300", "#ff8800"]}
              style={styles.crownBadge}
            >
              <Text style={styles.crownIcon}>👑</Text>
              <Text style={styles.crownLevel}>{level}</Text>
            </LinearGradient>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.fullName || "Player"}</Text>
            <Text style={styles.email}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        {/* COINS / GEMS CARD */}
        <View style={styles.walletCard}>
          <View style={styles.walletItem}>
            <Image
              source={require("@/src/assets/images/header/money.png")}
              style={styles.walletIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.walletLabel}>Coins</Text>
              <Text style={styles.walletValue}>{coins}</Text>
            </View>
          </View>

          <View style={styles.walletDivider} />

          <View style={styles.walletItem}>
            <Image
              source={require("@/src/assets/images/header/gem.png")}
              style={styles.walletIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.walletLabel}>Gems</Text>
              <Text style={styles.walletValue}>{gems}</Text>
            </View>
          </View>
        </View>

        {/* PREMIUM USERNAME CARD */}
        <View style={styles.premiumCard}>
          <Animated.View
            style={[
              styles.vipGlow,
              {
                opacity: glowPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.25, 0.8],
                }),
              },
            ]}
          />

          <LinearGradient
            colors={[
              "rgba(255,255,255,0.12)",
              "rgba(255,255,255,0.04)",
              "rgba(255,255,255,0.12)",
            ]}
            style={styles.premiumBorder}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmerWrap,
              {
                transform: [{ translateX: shimmer }, { rotate: "20deg" }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0.18)",
                "rgba(255,255,255,0.45)",
                "rgba(255,255,255,0.18)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>

          <View style={styles.premiumHeader}>
            <Text style={styles.premiumTitle}>PREMIUM PLAYER</Text>
            <Text style={styles.premiumBadge}>★ VERIFIED</Text>
          </View>

          <Text style={styles.usernameTitle}>USERNAME</Text>

          {isUsernameLocked ? (
            <>
              <Text style={styles.usernameValue}>{savedUsername}</Text>
              <Text style={styles.lockNote}>🔒 Username Locked</Text>
            </>
          ) : (
            <>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="choose_username"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.usernameInput}
                autoCapitalize="none"
                blurOnSubmit={true}
              />

             <Pressable
  style={styles.saveBtn}
  disabled={saving}
  onPress={() => {
    Keyboard.dismiss();      // ✅ closes keyboard
    Vibration.vibrate(120);  // ✅ strong vibration
    saveUsernameOnce();      // ✅ saving starts same click
  }}
>
  <LinearGradient
    colors={["#ffe168", "#ffb300", "#ff8800"]}
    style={styles.saveGradient}
  >
    {saving ? (
      <ActivityIndicator color="black" />
    ) : (
      <Text style={styles.saveBtnText}>SAVE USERNAME</Text>
    )}
  </LinearGradient>
</Pressable>


              <Text style={styles.warnText}>
                ⚠ You can set username only once.
              </Text>
            </>
          )}
          <Text style={styles.sinceText}>
  {accountCreatedAt
    ? `Since ${new Date(accountCreatedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`
    : ""}
</Text>

        </View>

        {/* STATS CARD */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>PLAYER STATS</Text>

          <View style={styles.statsGrid}>
            <StatBox label="Matches" value={matchesPlayed} />
            <StatBox label="Wins" value={matchesWon} />
            <StatBox label="Losses" value={matchesLost} />

            <StatBox label="Win Streak" value={winStreak} />
            <StatBox label="Best Streak" value={highestWinStreak} />
            <StatBox label="Rank Points" value={rankPoints} />

            <StatBox label="Tokens Cut" value={tokensCut} />
            <StatBox label="Times Cut" value={timesCut} />
            <StatBox label="Six Count" value={sixCount} />

            <StatBox label="Likes" value={likes} />
            <StatBox label="VIP Level" value={vipLevel} />
          </View>
        </View>

        

        {/* BACK BUTTON */}
        <Pressable
          style={styles.bigBtn}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.bigBtnText}>Back to Home</Text>
        </Pressable>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* LOGOUT DIALOG */}
      {showLogout && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dimBg} />
          <BlurView intensity={90} tint="dark" style={styles.blurBg} />

          <Animated.View
            style={[
              styles.dialogCard,
              {
                opacity: dialogFade,
                transform: [{ scale: dialogScale }],
              },
            ]}
          >
            <Text style={styles.dialogTitle}>Logout?</Text>
            <Text style={styles.dialogText}>
              Are you sure you want to logout from your account?
            </Text>

            <View style={styles.dialogBtns}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  Vibration.vibrate(20);
                  setShowLogout(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.logoutBtn}
                onPress={async () => {
                  Vibration.vibrate(60);
                  setShowLogout(false);

                  await signOut();
                  router.replace("/auth/login");
                }}
              >
                <LinearGradient
                  colors={["#ff4d4d", "#ff0000", "#b80000"]}
                  style={styles.logoutGradient}
                >
                  <Text style={styles.logoutText}>LOGOUT</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {/* USERNAME SAVED DIALOG */}
{showSavedDialog && (
  <View style={styles.dialogOverlay}>
    <View style={styles.dimBg} />
    <BlurView intensity={90} tint="dark" style={styles.blurBg} />

    <Animated.View
      style={[
        styles.savedDialogCard,
        {
          opacity: savedFade,
          transform: [{ scale: savedScale }],
        },
      ]}
    >
      <Text style={styles.savedTitle}>Username Saved 🎉</Text>

      <Text style={styles.savedText}>
        Your username has been successfully saved.
        {"\n"}Now it is permanently locked.
      </Text>

      <Pressable
        style={styles.savedBtn}
        onPress={() => setShowSavedDialog(false)}
      >
        <LinearGradient
          colors={["#ffe168", "#ffb300", "#ff8800"]}
          style={styles.savedBtnGradient}
        >
          <Text style={styles.savedBtnText}>OKAY</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  </View>
)}

    </LinearGradient>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */
function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  savedDialogCard: {
  width: "88%",
  borderRadius: 24,
  padding: 22,
  backgroundColor: "rgba(20,0,0,0.92)",
  borderWidth: 1.5,
  borderColor: "rgba(255,200,80,0.55)",
  elevation: 25,
},

savedTitle: {
  color: "#ffe168",
  fontSize: 20,
  fontWeight: "900",
  textAlign: "center",
  letterSpacing: 0.5,
},

savedText: {
  marginTop: 12,
  color: "rgba(255,255,255,0.75)",
  fontSize: 13,
  fontWeight: "700",
  textAlign: "center",
  lineHeight: 19,
},

savedBtn: {
  marginTop: 18,
  width: "100%",
  borderRadius: 18,
  overflow: "hidden",
},

savedBtnGradient: {
  paddingVertical: 14,
  alignItems: "center",
  borderRadius: 18,
  borderWidth: 1.2,
  borderColor: "rgba(255,255,255,0.7)",
},

savedBtnText: {
  fontSize: 14,
  fontWeight: "900",
  color: "#000",
  letterSpacing: 1,
},

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0b0b12",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 10,
    fontWeight: "800",
  },

  container: {
    flex: 1,
    padding: 18,
  },

  topRow: {
    marginTop: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  backText: {
    color: "white",
    fontWeight: "900",
    fontSize: 12,
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },

  logoutMiniBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,0,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.3)",
  },

  logoutMiniText: {
    color: "white",
    fontWeight: "900",
    fontSize: 12,
  },

  profileRow: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  avatarFrame: {
    width: 95,
    height: 95,
  },

  avatarBorder: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    padding: 3,
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },

  crownBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.7)",
  },

  crownIcon: {
    fontSize: 13,
  },

  crownLevel: {
    fontWeight: "900",
    fontSize: 12,
    color: "#000",
  },

  name: {
    fontSize: 18,
    fontWeight: "900",
    color: "white",
  },

  email: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
  },

  walletCard: {
    marginTop: 18,
    width: "100%",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  walletItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  walletIcon: {
    width: 34,
    height: 34,
  },

  walletLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(255,255,255,0.6)",
  },

  walletValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "white",
    marginTop: 2,
  },

  walletDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 12,
  },

  statsCard: {
    marginTop: 18,
    width: "100%",
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  statsTitle: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },

  statBox: {
    width: "31%",
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffe168",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },

  premiumCard: {
    marginTop: 20,
    width: "100%",
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },

  vipGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,225,104,0.9)",
  },

  premiumBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
  },

  shimmerWrap: {
    position: "absolute",
    top: -80,
    left: -200,
    width: 420,
    height: 420,
    borderRadius: 80,
    overflow: "hidden",
  },

  shimmerGradient: {
    width: "100%",
    height: "100%",
  },

  premiumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  premiumTitle: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },

  premiumBadge: {
    color: "#ffe168",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  usernameTitle: {
    marginTop: 16,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "900",
    fontSize: 12,
  },

  usernameValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "900",
    color: "white",
    letterSpacing: 0.6,
  },

  usernameInput: {
    marginTop: 10,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  saveBtn: {
    width: "100%",
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  saveGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },

  saveBtnText: {
    fontWeight: "900",
    fontSize: 14,
    color: "#000",
    letterSpacing: 1,
  },

  lockNote: {
    marginTop: 10,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "800",
    fontSize: 12,
  },

  warnText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "800",
    fontSize: 12,
  },
  sinceText: {
  position: "absolute",
  bottom: 10,
  right: 14,
  fontSize: 10,
  fontWeight: "900",
  color: "rgba(255,255,255,0.45)",
  letterSpacing: 0.6,
},


  bigBtn: {
    width: "100%",
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },

  bigBtnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 14,
  },

  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  blurBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  dialogCard: {
    width: "88%",
    borderRadius: 22,
    padding: 20,
    backgroundColor: "rgba(20,0,0,0.92)",
    borderWidth: 1.5,
    borderColor: "rgba(255,80,80,0.4)",
    elevation: 20,
  },

  dialogTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },

  dialogText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },

  dialogBtns: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },

  cancelText: {
    color: "white",
    fontWeight: "900",
    fontSize: 13,
  },

  logoutBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  logoutGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },

  dimBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
});
