import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
  Pressable,
  Animated,
  Vibration,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { playFX } from "@/src/utils/sound"; 
// or wherever this file is located



const { width, height } = Dimensions.get("window");

// 🌌 FULL SCREEN STAR BG
const BG = require("@/src/assets/images/hf2.png");

// STORE PANEL BG
const PanelBG = require("@/src/assets/store/panel_bg.png");

// TAB ICONS
const CoinTabIcon = require("@/src/assets/store/tab_coin.png");
const GemTabIcon = require("@/src/assets/store/tab_gem.png");
const SpinTabIcon = require("@/src/assets/store/tab_spin.png");

// CLOSE BUTTON
const CloseIcon = require("@/src/assets/store/close.png");

// HEADER ICONS
const HeaderCoinIcon = require("@/src/assets/images/header/money.png");
const HeaderGemIcon = require("@/src/assets/images/header/gem.png");

// SPIN ICON
const SpinPile = require("@/src/assets/store/spins.png");

// BUY BUTTON BG
const BuyBtnBG = require("@/src/assets/store/buy_btn.png");

type TabType = "coins" | "gems" | "spins";

const COIN_ITEMS = [
  { id: "c1", amount: "10 K", price: "₹49", img: HeaderCoinIcon },
  { id: "c2", amount: "40 K", price: "₹99", img: HeaderCoinIcon },
  { id: "c3", amount: "100 K", price: "₹149", img: HeaderCoinIcon },
  { id: "c4", amount: "250 K", price: "₹199", img: HeaderCoinIcon },
  { id: "c5", amount: "1 M", price: "₹299", img: HeaderCoinIcon },
  { id: "c6", amount: "5 M", price: "₹499", img: HeaderCoinIcon },
];

const GEM_ITEMS = [
  { id: "g1", amount: "50", price: "₹79", img: HeaderGemIcon },
  { id: "g2", amount: "120", price: "₹149", img: HeaderGemIcon },
  { id: "g3", amount: "250", price: "₹249", img: HeaderGemIcon },
  { id: "g4", amount: "500", price: "₹399", img: HeaderGemIcon },
];

const SPIN_ITEMS = [
  { id: "s1", amount: "5 Spins", price: "₹39", img: SpinPile },
  { id: "s2", amount: "15 Spins", price: "₹79", img: SpinPile },
  { id: "s3", amount: "30 Spins", price: "₹129", img: SpinPile },
  { id: "s4", amount: "100 Spins", price: "₹299", img: SpinPile },
];

/* ---------------- TAB BUTTON ---------------- */
function TabButton({
  active,
  title,
  icon,
  onPress,
}: {
  active: boolean;
  title: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Vibration.vibrate(10);
       playFX("ui");
        onPress();
      }}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
    >
      <Image source={icon} style={styles.tabIcon} />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {title}
      </Text>
    </Pressable>
  );
}

/* ---------------- BUY BUTTON ---------------- */
function BuyButton({ price, onPress }: { price: string; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={() => {
        Vibration.vibrate(15);
        playFX("ui");
        onPress();
      }}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <ImageBackground
          source={BuyBtnBG}
          resizeMode="stretch"
          style={styles.buyBtn}
        >
          <Text style={styles.buyText}>{price}</Text>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

/* ---------------- SCREEN ---------------- */
export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("coins");

  // smooth close animation
  const closeScale = useRef(new Animated.Value(1)).current;

  // fade out page before routing
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const storeData = useMemo(() => {
    if (activeTab === "coins") return COIN_ITEMS;
    if (activeTab === "gems") return GEM_ITEMS;
    return SPIN_ITEMS;
  }, [activeTab]);

  const handleClose = () => {
    Vibration.vibrate(15);
   playFX("ui");

    Animated.sequence([
      Animated.spring(closeScale, {
        toValue: 0.8,
        useNativeDriver: true,
        speed: 25,
        bounciness: 8,
      }),
      Animated.spring(closeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 25,
        bounciness: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace("/(tabs)");
    });
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.rowCard}>
        <View style={styles.leftRow}>
          <View style={styles.iconCircle}>
            <Image source={item.img} style={styles.pileImg} resizeMode="contain" />
          </View>

          <Text style={styles.amountText}>{item.amount}</Text>
        </View>

        <BuyButton
          price={item.price}
          onPress={() => console.log("BUY:", activeTab, item.amount)}
        />
      </View>
    );
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground source={BG} resizeMode="cover" style={styles.container}>
        {/* FULLSCREEN DARK SPACE */}
        <View style={styles.blueOverlay} />

        {/* PANEL */}
        <View
          style={[
            styles.panelOuter,
            {
              marginTop: insets.top + 10,
              height: height * 0.86,
            },
          ]}
        >
          <ImageBackground
            source={PanelBG}
            style={styles.panel}
            resizeMode="stretch"
          >
            {/* HEADER ROW */}
            <View style={styles.panelHeader}>
              <View style={{ flex: 1 }} />

              {/* CLOSE */}
              <Pressable onPress={handleClose} style={styles.closeBtn}>
                <Animated.View style={{ transform: [{ scale: closeScale }] }}>
                  <Image source={CloseIcon} style={styles.closeIcon} />
                </Animated.View>
              </Pressable>
            </View>

           <View style={styles.innerContent}>
  {/* TABS */}
  <View style={styles.tabsRow}>
    <TabButton
      active={activeTab === "coins"}
      title="MONEY"
      icon={CoinTabIcon}
      onPress={() => setActiveTab("coins")}
    />

    <TabButton
      active={activeTab === "gems"}
      title="GEMS"
      icon={GemTabIcon}
      onPress={() => setActiveTab("gems")}
    />

    <TabButton
      active={activeTab === "spins"}
      title="SPINS"
      icon={SpinTabIcon}
      onPress={() => setActiveTab("spins")}
    />
  </View>

  {/* LIST */}
  <FlatList
    data={storeData}
    keyExtractor={(item) => item.id}
    renderItem={renderItem}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.listContent}
  />
</View>

          </ImageBackground>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ImageBackground>
    </Animated.View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  blueOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 23, 0.92)",
  },

  panelOuter: {
    width: "95%",
    alignSelf: "center",
    borderRadius: 30,
    overflow: "hidden",
    elevation: 25,
  },

  panel: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },

  panelHeader: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 6,
  },

  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  closeIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  // ✅ tabs fit inside inner border
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  tabBtn: {
    flex: 1,
    height: width < 380 ? 50 : 54,
    borderRadius: 14,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,

    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  tabBtnActive: {
    backgroundColor: "rgba(0, 240, 255, 0.20)",
    borderColor: "rgba(0, 238, 255, 0.83)",
  },

  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#d5ddff",
    letterSpacing: 1,
  },

  tabTextActive: {
    color: "#ffffff",
  },

  // ✅ smaller compact row cards
  rowCard: {
    height: width < 380 ? 64 : 68,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 10,

    backgroundColor: "#ce0045", // 🔥 your requested color
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.20)",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconCircle: {
    width: width < 380 ? 42 : 46,
    height: width < 380 ? 42 : 46,
    borderRadius: 14,

    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",
  },

  pileImg: {
    width: 30,
    height: 30,
  },

  amountText: {
    fontSize: width < 380 ? 16 : 18,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1,

    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },

  // ✅ buy button smaller + fits perfectly
  buyBtn: {
    width: width < 380 ? 74 : 82,
    height: width < 380 ? 30 : 32,
    justifyContent: "center",
    alignItems: "center",
  },

  buyText: {
    fontSize: 11,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1,

    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },

  innerContent: {
  flex: 1,
  marginTop: 6,
  paddingHorizontal: 24,
  paddingBottom: 14,

  borderRadius: 22,
  overflow: "hidden",
},

listContent: {
  paddingTop: 6,
  paddingBottom: 20,
},

});
