import { Tabs } from "expo-router";
import React, { useRef } from "react";
import {
  Image,
  StyleSheet,
  View,
  Pressable,
  Animated,
  Vibration,
} from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/redux/store";

const HomeIcon = require("@/src/assets/icons/home.png");
const InventoryIcon = require("@/src/assets/icons/inventory.png");
const SocialIcon = require("@/src/assets/icons/social.png");
const SettingsIcon = require("@/src/assets/icons/settings.png");

const TabBarBG = require("@/src/assets/images/tabbar_bg.png");

function TabButton(props: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();
  };

  const handlePress = () => {
    Vibration.vibrate(15);
    props.onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabPressable}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {props.children}
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  const homeLoading = useSelector((state: RootState) => state.ui.homeLoading);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: true,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(190,200,255,0.7)",

        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.itemStyle,

        tabBarStyle: homeLoading ? { display: "none" } : styles.tabBar,

        tabBarBackground: () =>
          homeLoading ? null : (
            <View style={StyleSheet.absoluteFill}>
              {/* soft dark overlay behind png (makes it clean) */}
              <View style={styles.darkOverlay} />

              {/* PNG glass bar */}
              <Image source={TabBarBG} style={styles.pngBg} />
            </View>
          ),
      }}
    >
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
  tabBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,

    height: 86,
    borderRadius: 30,
    backgroundColor: "transparent",
    borderTopWidth: 0,

    overflow: "hidden",
    elevation: 30,
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  pngBg: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
    opacity: 1,
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

    paddingTop: 14,
    paddingBottom: 8,

    minWidth: 80, // ✅ forces equal spacing for all tabs
  },

  label: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginTop: 10,
    textAlign: "center",
  },

  iconWrap: {
    width: 52,
    height: 44,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop:10,
  },

  activeIconWrap: {
    width: 52,
    height: 44,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "rgba(0,220,255,0.6)",
    backgroundColor: "rgba(0,0,0,0.14)",

    shadowColor: "#00eaff",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 25,
  },

  iconImg: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
});
