import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const HEADER_HEIGHT = width < 380 ? width * 0.145 : width * 0.16;

export default function OfflineHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          "rgba(120,0,0,0.92)",
          "rgba(200,40,0,0.55)",
          "rgba(120,0,0,0.92)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <View style={styles.glowBorder} />

        {/* LEFT OFFLINE ICON */}
        <View style={styles.leftBox}>
  <Image
    source={require("@/src/assets/images/header/wifi-slash.png")}
    style={{ width: 26, height: 26, resizeMode: "contain" }}
  />
</View>


        {/* CENTER TEXT */}
        <View style={styles.centerBox}>
          <Text style={styles.offlineText}>OFFLINE MODE</Text>
          <Text style={styles.subText}>Login to play Online</Text>
        </View>

        {/* RIGHT LOGIN BUTTON */}
        <Pressable
          style={styles.loginBtn}
          onPress={() => router.push("/auth/login")}
        >
          <LinearGradient
            colors={["#ffe168", "#ffb300", "#ff8800"]}
            style={styles.loginGradient}
          >
            <Text style={styles.loginText}>LOGIN</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: 12,
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
    borderColor: "rgba(255, 200, 70, 0.65)",
  },

  leftBox: {
    width: width < 380 ? width * 0.14 : width * 0.16,
    justifyContent: "center",
    alignItems: "center",
  },

  offlineIcon: {
    fontSize: width < 380 ? 18 : 22,
  },

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  offlineText: {
    fontSize: width < 380 ? 14 : 16,
    fontWeight: "900",
    color: "#ffd24a",
    textTransform: "uppercase",
  },

  subText: {
    marginTop: 2,
    fontSize: width < 380 ? 10 : 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.9)",
  },

  loginBtn: {
    width: width < 380 ? width * 0.22 : width * 0.24,
    height: width < 380 ? 34 : 38,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 8,
  },

  loginGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.7)",
  },

  loginText: {
    fontSize: width < 380 ? 12 : 13,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
  },
});



