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
} from "react-native";

import { useUser, useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();

  const upsertUser = useMutation(api.users.upsertUser);

  const [username, setUsername] = useState("");
  const [savedUsername, setSavedUsername] = useState("");

  const [coins, setCoins] = useState(12000);
  const [gems, setGems] = useState(199);
  const [level, setLevel] = useState(1);

  const [saving, setSaving] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // shimmer animation
  const shimmer = useRef(new Animated.Value(-220)).current;

  // VIP glow pulse
  const glowPulse = useRef(new Animated.Value(0)).current;

const dialogFade = useRef(new Animated.Value(0)).current;
const dialogScale = useRef(new Animated.Value(0.85)).current;
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


  

  // Load metadata from Clerk
  useEffect(() => {
    if (user) {
      const meta: any = user.unsafeMetadata || {};
      const existingUsername = meta.username || "";

      setSavedUsername(existingUsername);
      setUsername(existingUsername);

      setCoins(meta.coins ?? 12000);
      setGems(meta.gems ?? 199);
      setLevel(meta.level ?? 1);
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="../login" />;
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

      // 1) Save to Clerk metadata
      await user?.update({
        unsafeMetadata: {
          username: cleanUsername,
          coins,
          gems,
          level,
        },
      });

      // 2) Save to Convex DB
      await upsertUser({
  clerkId: user!.id,
  username: cleanUsername,
  name: user?.fullName || "Player",
  email: user?.primaryEmailAddress?.emailAddress || "",
  imageUrl: user?.imageUrl || "",
});


      setSavedUsername(cleanUsername);

      Alert.alert("Success", "Username saved successfully!");
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
      {/* TOP HEADER */}
      <View style={styles.topRow}>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
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

          {/* LEVEL CROWN */}
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

        {/* shimmer overlay */}
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
            />

            <Pressable
              style={styles.saveBtn}
              onPress={saveUsernameOnce}
              disabled={saving}
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

            <Text style={styles.warnText}>⚠ You can set username only once.</Text>
          </>
        )}
      </View>

      {/* BACK BUTTON */}
      <Pressable style={styles.bigBtn} onPress={() => router.replace("/")}>
        <Text style={styles.bigBtnText}>Back to Home</Text>
      </Pressable>

      {/* LOGOUT DIALOG */}
     {showLogout && (
  <View style={styles.dialogOverlay}>
    {/* DIM BACKGROUND */}
    <View style={styles.dimBg} />

    {/* BLUR BACKGROUND */}
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
                  router.replace("../login");
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  width: 420, // 🔥 BIG so it never becomes small
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

  /* LOGOUT DIALOG */
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
  backgroundColor: "rgba(0, 0, 0, 0.58)", // 🔥 dim effect
},

});
