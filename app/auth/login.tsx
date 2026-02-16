import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async () => {
  try {
    setLoading(true);

    const result = await startOAuthFlow({
      redirectUrl: "ludo://oauth-native-callback",
    });

    console.log("OAUTH RESULT:", result);

    const { createdSessionId, setActive } = result;

    console.log("createdSessionId:", createdSessionId);

    if (createdSessionId) {
      await setActive?.({ session: createdSessionId });

      console.log("SESSION ACTIVATED SUCCESS");

      router.replace("/(tabs)");
    } else {
      console.log("NO SESSION CREATED");
      alert("Login failed: No session created");
    }
  } catch (err) {
    console.log("Google login error FULL:", err);
    alert("Google login error. Check console.");
  } finally {
    setLoading(false);
  }
};


  return (
    <LinearGradient
      colors={["#070812", "#14092e", "#070812"]}
      style={styles.container}
    >
      {/* CLOSE BUTTON */}
      <Pressable style={styles.closeBtn} onPress={() => router.replace("/")}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.title}>Welcome to Ludo</Text>
        <Text style={styles.subtitle}>Login to unlock profile and rewards</Text>

        {/* GOOGLE LOGIN */}
        <Pressable
          style={styles.googleBtn}
          onPress={loginWithGoogle}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.googleText}>Continue with Google</Text>
          )}
        </Pressable>

        {/* DIVIDER */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* BACK BUTTON */}
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backText}>← Back to Home</Text>
        </Pressable>
      </View>

      {/* FOOTER */}
      <Text style={styles.footerText}>
        By continuing you agree to our Terms & Privacy Policy
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  closeBtn: {
    position: "absolute",
    top: 55,
    right: 22,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    marginTop: -2,
  },

  card: {
    width: "100%",
    borderRadius: 22,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },

  googleBtn: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },

  googleText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  orText: {
    marginHorizontal: 12,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },

  backBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  backText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "800",
  },

  footerText: {
    marginTop: 22,
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
