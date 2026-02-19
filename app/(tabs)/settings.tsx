import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Image,
  Dimensions,
  Linking,
  Alert,
  Animated,
  Vibration,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { playBG, stopBG } from "@/src/utils/sound";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { BlurView } from "expo-blur";

import {
  loadMusicSetting,
  loadSfxSetting,
  loadVibrationSetting,
  saveMusicSetting,
  saveSfxSetting,
  saveVibrationSetting,
  isMusicEnabled,
  isSfxEnabled,
  isVibrationEnabled,
} from "@/src/utils/appSettings";

import ComingSoonModal from "@/app/pages_modals/1home/ComingSoonModal";

const { width } = Dimensions.get("window");

export default function SettingsScreen() {
  const [showLogout, setShowLogout] = useState(false);

const dialogFade = useRef(new Animated.Value(0)).current;
const dialogScale = useRef(new Animated.Value(0.85)).current;

  const router = useRouter();
  const { signOut } = useAuth();
  const { user: clerkUser, isSignedIn } = useUser();

  // ✅ FIX: Hooks MUST be inside component
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("Coming Soon 🚀");

  // ✅ Local toggle states
  const [music, setMusic] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // ✅ Convex user
  const user = useQuery(
    api.users.getUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const displayName = isSignedIn
    ? user?.username || user?.name || "Player"
    : "Guest";

  const displayCoins = isSignedIn ? user?.coins ?? 0 : 0;
  const displayGems = isSignedIn ? user?.gems ?? 0 : 0;
  const displayLevel = isSignedIn ? user?.level ?? 1 : 1;

  const displayVip = isSignedIn
    ? (user?.vipLevel ?? 0) > 0
      ? `VIP ${user?.vipLevel}`
      : "Player"
    : "Offline Guest";

  // ✅ Load saved settings on mount
  useEffect(() => {
    async function loadSettings() {
      await loadMusicSetting();
      await loadSfxSetting();
      await loadVibrationSetting();

      const m = isMusicEnabled();
      const s = isSfxEnabled();
      const v = isVibrationEnabled();

      setMusic(m);
      setSound(s);
      setVibration(v);

    }

    loadSettings();
  }, []);

  // ✅ Toggle Music
  const toggleMusic = async (val: boolean) => {
    setMusic(val);
    await saveMusicSetting(val);

    if (val) {
      playBG("home", true); // fade in
    } else {
      stopBG(true); // fade out
    }
  };

  // ✅ Toggle SFX
  const toggleSoundFx = async (val: boolean) => {
    setSound(val);
    await saveSfxSetting(val);
  };

  // ✅ Toggle vibration
  const toggleVibration = async (val: boolean) => {
    setVibration(val);
    await saveVibrationSetting(val);
  };

  // ✅ Logout
  const handleLogout = () => {
  Alert.alert(
    "Confirm Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/auth/login");
          } catch (err) {
            console.log("Logout error:", err);
          }
        },
      },
    ],
    { cancelable: true }
  );
};


  const openWhatsAppSupport = async () => {
    const phone = "91960854059";
    const message = "Hello, I need support for Ludo Galaxy.";

    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(
      message
    )}`;

    const installed = await Linking.canOpenURL(url);

    if (!installed) {
      Alert.alert(
        "WhatsApp Not Installed",
        "Please install WhatsApp to contact support."
      );
      return;
    }

    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#050010", "#12002a", "#050010"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.starsLayer}>
        <Text style={[styles.star, { top: 40, left: 20 }]}>✦</Text>
        <Text style={[styles.star, { top: 110, right: 40 }]}>✧</Text>
        <Text style={[styles.star, { top: 200, left: 70 }]}>✦</Text>
        <Text style={[styles.star, { top: 260, right: 60 }]}>✧</Text>
        <Text style={[styles.star, { top: 420, left: 40 }]}>✦</Text>
        <Text style={[styles.star, { top: 520, right: 30 }]}>✧</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🤖 Settings</Text>
          <Text style={styles.subtitle}>
            Customize your Ludo experience like a pro.
          </Text>
        </View>

       <Pressable
  style={styles.profileCard}
  onPress={() => router.push("/auth/profile")}
>

          <View style={styles.profileRow}>
            <View style={styles.avatarOuter}>
              <LinearGradient
                colors={["#ffe168", "#ffb300", "#ff7a00"]}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                 <View style={styles.avatarInner}>
  {clerkUser?.imageUrl ? (
    <Image
      source={{ uri: clerkUser.imageUrl }}
      style={styles.avatarImg}
    />
  ) : (
    <Text style={styles.avatarText}>👤</Text>
  )}
</View>

                </View>
              </LinearGradient>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.username}>{displayName}</Text>
              <Text style={styles.userInfo}>
                Level {displayLevel} • {displayVip}
              </Text>
            </View>

            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>
                🏆 {user?.rankPoints ?? 0} RP
              </Text>
            </View>
          </View>

          <View style={styles.walletRow}>
            <WalletMini
              icon={require("@/src/assets/images/header/money.png")}
              value={String(displayCoins)}
              label="Coins"
            />
            <WalletMini
              icon={require("@/src/assets/images/header/gem.png")}
              value={String(displayGems)}
              label="Gems"
            />
          </View>
        </Pressable>


        <SectionTitle title="Audio & Effects" />
        <GlassSettingRow
          icon="🎵"
          title="Music"
          desc="Background theme music"
          value={music}
          onChange={toggleMusic}
        />
        <GlassSettingRow
          icon="🔊"
          title="Sound Effects"
          desc="Dice roll & win sounds"
          value={sound}
          onChange={toggleSoundFx}
        />
        <GlassSettingRow
          icon="📳"
          title="Vibration"
          desc="Haptic feedback on tap"
          value={vibration}
          onChange={toggleVibration}
        />

        <SectionTitle title="Gameplay" />

        <GlassButtonRow
          icon="🎲"
          title="Dice Animation"
          value="Smooth"
          onPress={() => {
            setComingSoonTitle("Dice Animation 🎲");
            setShowComingSoon(true);
          }}
        />

        <GlassButtonRow
          icon="⏱️"
          title="Turn Timer"
          value="30 sec"
          onPress={() => {
            setComingSoonTitle("Turn Timer ⏱️");
            setShowComingSoon(true);
          }}
        />

        <GlassButtonRow
          icon="🎯"
          title="Difficulty"
          value="Medium"
          onPress={() => {
            setComingSoonTitle("Difficulty 🎯");
            setShowComingSoon(true);
          }}
        />

        <SectionTitle title="Account & Security" />

        <GlassButtonRow
          icon="👤"
          title="Edit Profile"
          value="Change name"
          onPress={() => {
            setComingSoonTitle("Edit Profile 👤");
            setShowComingSoon(true);
          }}
        />

        <GlassButtonRow
          icon="🔒"
          title="Privacy"
          value="Protected"
          onPress={() => {
            setComingSoonTitle("Privacy 🔒");
            setShowComingSoon(true);
          }}
        />

        <GlassSettingRow
          icon="🔔"
          title="Notifications"
          desc="Game invites & rewards"
          value={notifications}
          onChange={setNotifications}
        />

        <SectionTitle title="Support" />

        <GlassButtonRow
          icon="📩"
          title="Contact Support"
          value="WhatsApp"
          onPress={openWhatsAppSupport}
        />

        <GlassButtonRow
          icon="⭐"
          title="Rate Us"
          value="Play Store"
          onPress={() => {
            setComingSoonTitle("Rate Us ⭐");
            setShowComingSoon(true);
          }}
        />

        <GlassButtonRow
          icon="📜"
          title="Terms & Policy"
          value="Read"
          onPress={() => {
            setComingSoonTitle("Terms & Policy 📜");
            setShowComingSoon(true);
          }}
        />

        {isSignedIn ? (
          <Pressable style={styles.logoutBtn} onPress={() => {
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
            <LinearGradient
              colors={["#ff3b3b", "#ff004c", "#ff3b3b"]}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            style={styles.logoutBtn}
            onPress={() => router.push("/auth/login")}
          >
            <LinearGradient
              colors={["#3b82ff", "#5b21b6", "#3b82ff"]}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutText}>🔑 Connect Online</Text>
            </LinearGradient>
          </Pressable>
        )}

        <Text style={styles.footerText}>Ludo Galaxy • Version 1.0.0</Text>
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
          style={styles.logoutPopupBtn}
          onPress={async () => {
            Vibration.vibrate(60);
            setShowLogout(false);

            await signOut();
            router.replace("/auth/login");
          }}
        >
          <LinearGradient
            colors={["#ff4d4d", "#ff0000", "#b80000"]}
            style={styles.logoutPopupGradient}
          >
            <Text style={styles.logoutPopupText}>LOGOUT</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Animated.View>
  </View>
)}


      <ComingSoonModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title={comingSoonTitle}
      />
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SectionTitle({ title }: any) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function WalletMini({ icon, value, label }: any) {
  return (
    <View style={styles.walletMini}>
      <View style={styles.walletMiniBorder} />
      <Image source={icon} style={styles.walletIcon} resizeMode="contain" />
      <View>
        <Text style={styles.walletValue}>{value}</Text>
        <Text style={styles.walletLabel}>{label}</Text>
      </View>
    </View>
  );
}

function GlassSettingRow({ icon, title, desc, value, onChange }: any) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingBorder} />

      <View style={styles.leftIcon}>
        <Text style={styles.settingIcon}>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? "#ffcc00" : "#777"}
        trackColor={{ false: "#222", true: "#8b5cff" }}
      />
    </View>
  );
}

function GlassButtonRow({ icon, title, value, onPress }: any) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingBorder} />

      <View style={styles.leftIcon}>
        <Text style={styles.settingIcon}>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{value}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
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

dimBg: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.58)",
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

logoutPopupBtn: {
  flex: 1,
  borderRadius: 16,
  overflow: "hidden",
},

logoutPopupGradient: {
  paddingVertical: 14,
  alignItems: "center",
},

logoutPopupText: {
  color: "white",
  fontWeight: "900",
  fontSize: 13,
  letterSpacing: 1,
},

  container: {
    flex: 1,
    backgroundColor: "#050010",
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 45,
    paddingBottom: 100,
  },
  starsLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  star: {
    position: "absolute",
    fontSize: width * 0.06,
    color: "white",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: width * 0.075,
    fontWeight: "900",
    color: "white",
  },
  subtitle: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: width * 0.035,
    color: "rgba(255,255,255,0.7)",
  },
  profileCard: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 22,
    padding: 14,
    overflow: "hidden",
    marginBottom: 18,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarOuter: {
    width: width * 0.16,
    height: width * 0.16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarRing: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
  },
  avatarImg: {
  width: "100%",
  height: "100%",
  borderRadius: 999,
},

  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: width * 0.07,
  },
  username: {
    fontSize: width * 0.05,
    fontWeight: "900",
    color: "white",
  },
  userInfo: {
    marginTop: 2,
    fontSize: width * 0.033,
    color: "rgba(255,255,255,0.75)",
  },
  rankBadge: {
    backgroundColor: "rgba(255, 190, 0, 0.18)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,190,0,0.4)",
  },
  rankText: {
    color: "#ffd86b",
    fontWeight: "900",
    fontSize: width * 0.033,
  },
  walletRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  walletMini: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  walletMiniBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(90, 220, 255, 0.35)",
  },
  walletIcon: {
    width: width * 0.08,
    height: width * 0.08,
  },
  walletValue: {
    fontSize: width * 0.042,
    fontWeight: "900",
    color: "white",
  },
  walletLabel: {
    fontSize: width * 0.03,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: width * 0.045,
    fontWeight: "900",
    color: "#ffd86b",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  settingBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(140, 120, 255, 0.35)",
  },
  leftIcon: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  settingIcon: {
    fontSize: width * 0.055,
  },
  settingTitle: {
    fontSize: width * 0.04,
    fontWeight: "900",
    color: "white",
  },
  settingDesc: {
    marginTop: 2,
    fontSize: width * 0.032,
    color: "rgba(255,255,255,0.7)",
  },
  arrow: {
    fontSize: width * 0.08,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    marginTop: -4,
  },
  logoutBtn: {
    marginTop: 18,
    borderRadius: 22,
    overflow: "hidden",
  },
  logoutGradient: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    fontSize: width * 0.045,
    fontWeight: "900",
    color: "white",
  },
  footerText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: width * 0.032,
    color: "rgba(255,255,255,0.55)",
  },
});
