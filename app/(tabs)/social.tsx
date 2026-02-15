import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState("Chats");

  const tabs = ["Chats", "Friends", "Last Played"];

  return (
    <View style={styles.container}>
      {/* TOP TABS */}
      <View style={styles.tabsWrapper}>
        <BlurView intensity={35} tint="dark" style={styles.tabsBlur}>
          {tabs.map((tab) => {
            const active = activeTab === tab;

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabBtn, active && styles.activeTabBtn]}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>

      {/* CENTER TEXT */}
      <View style={styles.centerBox}>
        <Text style={styles.comingSoonTitle}>
          {activeTab.toUpperCase()}
        </Text>

        <Text style={styles.comingSoonText}>✨ Feature Coming Soon ✨</Text>

        <Text style={styles.subText}>
          This mode will be added in next update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02061c",
    paddingTop: 55,
    paddingHorizontal: 16,
  },

  /* TABS */
  tabsWrapper: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  tabsBlur: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(10, 20, 70, 0.35)",
  },

  tabBtn: {
    flex: 1,
    height: 42,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  activeTabBtn: {
    backgroundColor: "rgba(0,240,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,240,255,0.45)",
    shadowColor: "#00f0ff",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },

  tabText: {
    fontSize: 12,
    fontWeight: "900",
    color: "rgba(200,210,255,0.75)",
    letterSpacing: 1,
  },

  activeTabText: {
    color: "#ffffff",
  },

  /* CENTER */
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  comingSoonTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "white",
    letterSpacing: 2,
    marginBottom: 12,
    textShadowColor: "rgba(0,240,255,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  comingSoonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffd700",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  subText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(200,210,255,0.75)",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: width * 0.8,
  },
});
