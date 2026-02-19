import React, { useRef, useEffect } from "react";
import { Tabs } from "expo-router";
import {
  Image,
  StyleSheet,
  View,
  Pressable,
  Animated,
  ActivityIndicator,
  Vibration,
  Platform,
    Easing,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/redux/store";
import { useUser } from "@clerk/clerk-expo";

// ICONS
const HomeIcon = require("@/src/assets/icons/home.png");
const InventoryIcon = require("@/src/assets/icons/inventory.png");
const SocialIcon = require("@/src/assets/icons/social.png");
const SettingsIcon = require("@/src/assets/icons/settings.png");

/* ---------------- TAB BUTTON ---------------- */
function TabButton({ children, onPress, accessibilityState }: any) {
  const focused = accessibilityState?.selected;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(liftAnim, {
      toValue: focused ? -8 : 0,
      duration: 140,
      easing: Easing.out(Easing.cubic), // ✅ Apple smooth
      useNativeDriver: true,
    }),

    Animated.timing(glowAnim, {
      toValue: focused ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.quad), // ✅ smooth fade
      useNativeDriver: true,
    }),
  ]).start();
}, [focused]);



const handlePressIn = () => {
  Animated.timing(scaleAnim, {
    toValue: 0.94,
    duration: 90,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  Animated.timing(scaleAnim, {
    toValue: 1,
    duration: 110,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};


  const handlePress = () => {
    Vibration.vibrate(3);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabPressable}
    >
      <Animated.View
        style={{
          alignItems: "center",
          transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
        }}
      >
        {children}

        {/* ✅ Glow Underline Effect */}
        <Animated.View
          style={[
            styles.selectedGlow,
            {
              opacity: glowAnim,
              transform: [
                {
                  scaleX: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

/* ---------------- MAIN TAB LAYOUT ---------------- */
export default function TabLayout() {
  const homeLoading = useSelector((state: RootState) => state.ui.homeLoading);
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: true,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(190,200,255,0.65)",

        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.itemStyle,

        tabBarStyle: homeLoading ? { display: "none" } : styles.tabBar,

        tabBarBackground: () =>
          homeLoading ? null : (
            <View style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={[
                  "rgba(15,8,30,0.88)",
                  "rgba(50,20,100,0.55)",
                  "rgba(15,8,30,0.88)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.glassBg}
              />

              <View style={styles.glowBorder} />
            </View>
          ),
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Image source={HomeIcon} style={styles.iconImg} />
            </View>
          ),
        }}
      />

      {/* INVENTORY */}
      <Tabs.Screen
        name="inventory"
        options={{
          title: "INVENTORY",
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Image source={InventoryIcon} style={styles.iconImg} />
            </View>
          ),
        }}
      />

      {/* SOCIAL */}
      <Tabs.Screen
        name="social"
        options={{
          title: "SOCIAL",
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Image source={SocialIcon} style={styles.iconImg} />
            </View>
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "SETTINGS",
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Image source={SettingsIcon} style={styles.iconImg} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#070812",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ✅ RESPONSIVE TAB BAR */
  tabBar: {
  position: "absolute",

  left: 28,
  right: 28,
  bottom: Platform.OS === "ios" ? 22 : 14,

  height: 72,
  borderRadius: 22,

  backgroundColor: "transparent",
  borderTopWidth: 0,

  overflow: "hidden",
  elevation: 30,

  // ✅ extra protection for curved edge screens
  paddingHorizontal: 6,
},


  glassBg: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },

  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: "rgba(140, 120, 255, 0.55)",
  },

  tabPressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  itemStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 8,
    minWidth: 65,
  },

  label: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 4,
    textAlign: "center",
  },

  iconWrap: {
    width: 42,
    height: 38,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  activeIconWrap: {
    width: 44,
    height: 40,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1.2,
    borderColor: "rgba(0,220,255,0.6)",
    backgroundColor: "rgba(0,0,0,0.15)",

    shadowColor: "#00eaff",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 25,
  },

  iconImg: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },

  /* ✅ Glow under selected tab */
  selectedGlow: {
    marginTop: 6,
    width: 28,
    height: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0,220,255,0.85)",

    shadowColor: "#00eaff",
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 25,
  },
});
