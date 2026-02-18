import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function SettingsScreen() {
  const [music, setMusic] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}
      <LinearGradient
        colors={["#050010", "#12002a", "#050010"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* STARS EFFECT */}
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
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
          <Text style={styles.subtitle}>
            Customize your Ludo experience like a pro.
          </Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarOuter}>
              <LinearGradient
                colors={["#ffe168", "#ffb300", "#ff7a00"]}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.username}>CodeWavey</Text>
              <Text style={styles.userInfo}>Level 45 • VIP Player</Text>
            </View>

            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>🏆 Gold</Text>
            </View>
          </View>

          <View style={styles.walletRow}>
            <WalletMini
              icon={require("@/src/assets/images/header/money.png")}
              value="2.4K"
              label="Coins"
            />
            <WalletMini
              icon={require("@/src/assets/images/header/gem.png")}
              value="150"
              label="Gems"
            />
          </View>
        </View>

        {/* AUDIO SETTINGS */}
        <SectionTitle title="Audio & Effects" />
        <GlassSettingRow
          icon="🎵"
          title="Music"
          desc="Background theme music"
          value={music}
          onChange={setMusic}
        />
        <GlassSettingRow
          icon="🔊"
          title="Sound Effects"
          desc="Dice roll & win sounds"
          value={sound}
          onChange={setSound}
        />
        <GlassSettingRow
          icon="📳"
          title="Vibration"
          desc="Haptic feedback on tap"
          value={vibration}
          onChange={setVibration}
        />

        {/* GAMEPLAY */}
        <SectionTitle title="Gameplay" />
        <GlassButtonRow icon="🎲" title="Dice Animation" value="Smooth" />
        <GlassButtonRow icon="⏱️" title="Turn Timer" value="30 sec" />
        <GlassButtonRow icon="🎯" title="Difficulty" value="Medium" />

        {/* ACCOUNT */}
        <SectionTitle title="Account & Security" />
        <GlassButtonRow icon="👤" title="Edit Profile" value="Change name" />
        <GlassButtonRow icon="🔒" title="Privacy" value="Protected" />
        <GlassSettingRow
          icon="🔔"
          title="Notifications"
          desc="Game invites & rewards"
          value={notifications}
          onChange={setNotifications}
        />

        {/* SUPPORT */}
        <SectionTitle title="Support" />
        <GlassButtonRow icon="📩" title="Contact Support" value="Help Center" />
        <GlassButtonRow icon="⭐" title="Rate Us" value="Play Store" />
        <GlassButtonRow icon="📜" title="Terms & Policy" value="Read" />

        {/* LOGOUT */}
        <Pressable style={styles.logoutBtn}>
          <LinearGradient
            colors={["#ff3b3b", "#ff004c", "#ff3b3b"]}
            style={styles.logoutGradient}
          >
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </LinearGradient>
        </Pressable>

        {/* FOOTER */}
        <Text style={styles.footerText}>Ludo Galaxy • Version 1.0.0</Text>
      </ScrollView>
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

function GlassButtonRow({ icon, title, value }: any) {
  return (
    <Pressable style={styles.settingRow}>
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
  container: {
    flex: 1,
    backgroundColor: "#050010",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 50,
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
    fontSize: width * 0.035,
    color: "rgba(255,255,255,0.7)",
  },

  /* PROFILE CARD */
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

  /* SECTION TITLE */
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: width * 0.045,
    fontWeight: "900",
    color: "#ffd86b",
  },

  /* SETTING ROW */
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

  /* LOGOUT */
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
