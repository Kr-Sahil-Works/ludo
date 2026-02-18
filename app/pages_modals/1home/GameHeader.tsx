import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Animated,
  Vibration,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useUser } from "@clerk/clerk-expo";

import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";

const { width } = Dimensions.get("window");

const HEADER_HEIGHT = width < 380 ? width * 0.145 : width * 0.16;
const isSmallDevice = width < 380;

type Props = {
  coins?: number;
  gems?: number;
  level?: number;
  onPressProfile?: () => void;
  onPressCoins?: () => void;
  onPressGems?: () => void;
  onPressStore?: () => void;
  onPressSettings?: () => void;
};

const formatNumber = (num: number) => {
  if (num >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(".0", "") + "K";
  return num.toString();
};

export default function GameHeader(props: Props){
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
  const onlineReady = useSelector((state: RootState) => state.app.onlineReady);

  // ✅ Redux user data (synced from Convex)
  const { username, coins, gems, level, imageUrl, isLoaded: reduxLoaded } =
    useSelector((state: RootState) => state.user);

  const displayCoins = coins ?? 0;
  const displayGems = gems ?? 0;
  const displayLevel = level ?? 1;

  // ✅ HANDLERS
  const handleCoinsPress = () => {
    if (!clerkLoaded) return;

    if (!isSignedIn) {
      router.push("/auth/login");
      return;
    }

    router.push("/(tabs)/inventory");
  };

  const handleGemsPress = () => {
    if (!clerkLoaded) return;

    if (!isSignedIn) {
      router.push("/auth/login");
      return;
    }

    router.push("/(tabs)/inventory");
  };

  const handleStorePress = () => {
    if (!clerkLoaded) return;

    // store should work even if redux not loaded
    router.push("/(tabs)/inventory");
  };

  const handleSettingsPress = () => {
    if (!clerkLoaded) return;

    router.push("/(tabs)/settings");
  };

  const handleProfilePress = () => {
    if (!clerkLoaded) return;

    if (!isSignedIn) {
      router.push("/auth/login");
      return;
    }

    router.push("/auth/profile");
  };

  return (
    <SafeAreaView
      style={[
        styles.wrapper,
        {
          paddingTop: insets.top - 20,
        },
      ]}
      edges={["top"]}
    >
      <LinearGradient
        colors={[
          "rgba(15,8,30,0.88)",
          "rgba(60,20,110,0.55)",
          "rgba(15,8,30,0.88)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <View style={styles.glowBorder} />

        {/* PROFILE */}
        <Pressable style={styles.profileBox} onPress={handleProfilePress}>
          <View style={styles.avatarOuter}>
            <LinearGradient
              colors={["#ffe168", "#ff9f00", "#ffe168"]}
              style={styles.avatarFrame}
            >
              <LinearGradient
                colors={["#3b5bff", "#1cc8ff"]}
                style={styles.avatarInner}
              >
                {onlineReady && reduxLoaded && imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>👤</Text>
                )}
              </LinearGradient>
            </LinearGradient>

            {/* LEVEL BADGE */}
            <LinearGradient
              colors={["#ffe168", "#ffb300"]}
              style={styles.levelBadge}
            >
              <Text style={styles.levelText}>
                {isSignedIn && reduxLoaded ? displayLevel : 1}
              </Text>
            </LinearGradient>

            {onlineReady && <View style={styles.onlineDot} />}
          </View>
        </Pressable>

        {/* WALLET */}
        <View style={styles.walletBox}>
          {isSmallDevice ? (
            <DoubleWalletPill
              coins={formatNumber(isSignedIn && reduxLoaded ? displayCoins : 0)}
              gems={formatNumber(isSignedIn && reduxLoaded ? displayGems : 0)}
              onPressCoins={handleCoinsPress}
              onPressGems={handleGemsPress}
            />
          ) : (
            <>
              <GlassPill
                icon={require("@/src/assets/images/header/money.png")}
                value={formatNumber(
                  isSignedIn && reduxLoaded ? displayCoins : 0
                )}
                onPressPlus={handleCoinsPress}
              />

              <GlassPill
                icon={require("@/src/assets/images/header/gem.png")}
                value={formatNumber(isSignedIn && reduxLoaded ? displayGems : 0)}
                onPressPlus={handleGemsPress}
              />
            </>
          )}
        </View>

        {/* RIGHT ICONS */}
        <View style={styles.rightBox}>
          <Pressable style={styles.iconBtn} onPress={handleStorePress}>
            <Image
              source={require("@/src/assets/images/header/carts.png")}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable style={styles.iconBtn} onPress={handleSettingsPress}>
            <Image
              source={require("@/src/assets/images/header/settings.png")}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

/* ---------------- GLASS PILL ---------------- */
function GlassPill({ icon, value, onPressPlus }: any) {
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(0)).current;
  const star3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(star1, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(star1, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(star2, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(star2, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(star3, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(star3, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pill}>
      <View style={styles.pillBorder} />

      <View style={styles.iconWrapper}>
        <Image source={icon} style={styles.pillIcon} resizeMode="contain" />

        <Animated.Text style={[styles.star, styles.star1, { opacity: star1 }]}>
          ✨
        </Animated.Text>

        <Animated.Text style={[styles.star, styles.star2, { opacity: star2 }]}>
          ✦
        </Animated.Text>

        <Animated.Text style={[styles.star, styles.star3, { opacity: star3 }]}>
          ✨
        </Animated.Text>
      </View>

      <Text style={styles.pillValue} numberOfLines={1}>
        {value}
      </Text>

      <Pressable
        style={styles.plusBtn}
        onPress={() => {
          Vibration.vibrate(10);
          onPressPlus?.();
        }}
      >
        <LinearGradient
          colors={["#ffe168", "#ffb300", "#ff8800"]}
          style={styles.plusGradient}
        >
          <Text style={styles.plusText}>+</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

/* ---------------- DOUBLE WALLET ---------------- */
function DoubleWalletPill({ coins, gems, onPressCoins, onPressGems }: any) {
  return (
    <View style={styles.doublePill}>
      <View style={styles.pillBorder} />

      <View style={styles.doubleItem}>
        <Image
          source={require("@/src/assets/images/header/money.png")}
          style={styles.smallIcon}
          resizeMode="contain"
        />
        <Text style={styles.doubleText}>{coins}</Text>

        <Pressable style={styles.smallPlusBtn} onPress={onPressCoins}>
          <Text style={styles.smallPlusText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.doubleItem}>
        <Image
          source={require("@/src/assets/images/header/gem.png")}
          style={styles.smallIcon}
          resizeMode="contain"
        />
        <Text style={styles.doubleText}>{gems}</Text>

        <Pressable style={styles.smallPlusBtn} onPress={onPressGems}>
          <Text style={styles.smallPlusText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 9999,
    elevation: 9999,
    paddingHorizontal: 8,
  },

  headerBar: {
    width: "100%",
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 12,
  },

  glowBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1.6,
    borderColor: "rgba(140, 120, 255, 0.55)",
  },

  profileBox: {
    width: width < 380 ? width * 0.17 : width * 0.18,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarOuter: {
    width: HEADER_HEIGHT * 0.58,
    height: HEADER_HEIGHT * 0.58,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarFrame: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },

  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatarText: {
    fontSize: width * 0.035,
    color: "white",
    fontWeight: "900",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },

  levelBadge: {
    position: "absolute",
    left: -6,
    top: -6,
    width: HEADER_HEIGHT * 0.25,
    height: HEADER_HEIGHT * 0.25,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.75)",
    elevation: 8,
  },

  levelText: {
    fontWeight: "900",
    fontSize: width * 0.028,
    color: "#000",
  },

  onlineDot: {
    position: "absolute",
    right: -2,
    top: 1,
    width: HEADER_HEIGHT * 0.12,
    height: HEADER_HEIGHT * 0.12,
    borderRadius: 999,
    backgroundColor: "#00ff66",
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  walletBox: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width < 380 ? 4 : 8,
    paddingHorizontal: width < 380 ? 0 : 4,
  },

  pill: {
    width: width < 380 ? width * 0.25 : width * 0.27,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: width < 380 ? 6 : 8,
    paddingVertical: 7,
    backgroundColor: "rgba(0,0,0,0.22)",
    overflow: "hidden",
    gap: width < 380 ? 4 : 6,
  },

  pillBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(90, 220, 255, 0.45)",
  },

  iconWrapper: {
    width: width * 0.055,
    height: width * 0.055,
    justifyContent: "center",
    alignItems: "center",
  },

  pillIcon: {
    width: "100%",
    height: "100%",
  },

  pillValue: {
    flex: 1,
    minWidth: width * 0.07,
    fontSize: width * 0.03,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
  },

  star: {
    position: "absolute",
    color: "white",
  },

  star1: { top: -6, right: -6, fontSize: width * 0.03 },
  star2: { bottom: -3, left: -1, fontSize: width * 0.028 },
  star3: { top: 10, left: -5, fontSize: width * 0.022 },

  plusBtn: {
    width: width * 0.055,
    height: width * 0.055,
    borderRadius: 999,
    overflow: "hidden",
    elevation: 8,
  },

  plusGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.7)",
  },

  plusText: {
    fontSize: width * 0.042,
    fontWeight: "900",
    color: "#000",
    marginTop: -2,
  },

  rightBox: {
    width: width < 380 ? width * 0.2 : width * 0.22,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },

  iconBtn: {
    width: width < 380 ? width * 0.075 : width * 0.082,
    height: width < 380 ? width * 0.075 : width * 0.082,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  iconImg: {
    width: "140%",
    height: "140%",
  },

  doublePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(0,0,0,0.22)",
    overflow: "hidden",
    flex: 1,
    justifyContent: "space-between",
  },

  divider: {
    width: 1,
    height: "70%",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 8,
  },

  doubleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },

  smallIcon: {
    width: 18,
    height: 18,
  },

  doubleText: {
    fontSize: 14,
    fontWeight: "900",
    color: "white",
  },

  smallPlusBtn: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#ffb300",
    justifyContent: "center",
    alignItems: "center",
  },

  smallPlusText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000",
    marginTop: -2,
  },
});
