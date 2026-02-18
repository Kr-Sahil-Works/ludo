import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  ImageBackground,
} from "react-native";

import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { Easing } from "react-native";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/src/redux/store";
import { resetGame } from "@/src/redux/gameSlice";

import ComingSoonModal from "@/app/pages_modals/1home/ComingSoonModal";
import HomeLoader from "@/src/components/Loaders/HomeLoader";

import { playBG, playFX, stopBG } from "@/src/utils/sound";
import GameHeader from "@/app/pages_modals/1home/GameHeader";

import { setHomeLoading } from "@/src/redux/uiSlice";
import SpinWheelModal from "@/app/pages_modals/1home/SpinWheelModal";
import SelectPersonTokenModal from "@/app/pages_modals/2passNplay/SelectPersonTokenModal";


import ModeCard from "@/app/pages_modals/1home/ModeCard";

import { useUser } from "@clerk/clerk-expo";
import PassNPlayModal from "@/app/pages_modals/2passNplay/PassNPlayModal";

const Logo: any = require("@/src/assets/images/brightlogo.png");
const HomeBG: any = require("@/src/assets/images/hf2.png");
const Witch: any = require("@/src/assets/animation/witch.json");

const SpinBtn = require("@/src/assets/images/spin.png");

// PNG icons
const Earth = require("@/src/assets/icons/earth.png");
const Friends = require("@/src/assets/icons/friends.png");
const Vs = require("@/src/assets/icons/vs.png");
const Pass = require("@/src/assets/icons/pass.png");
const Snake = require("@/src/assets/icons/snake.png");

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [showSpin, setShowSpin] = useState(false);
  const [showPassPlaySelect, setShowPassPlaySelect] = useState(false);

const [showSelectModal, setShowSelectModal] = useState(false);
const [selectedMode, setSelectedMode] = useState<"classic" | "quick">("classic");


  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { isSignedIn } = useUser(); // ✅ LOGIN CHECK

  useEffect(() => {
    dispatch(setHomeLoading(true));

    const timer = setTimeout(() => {
      setLoading(false);
      dispatch(setHomeLoading(false));
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const players = useSelector((state: RootState) => state.game.players);

  const hasGameStarted = players.some((p) =>
    p.tokens.some((pos) => pos !== 0)
  );

  const [showComingSoon, setShowComingSoon] = useState(false);

  const witchAnim = useRef(new Animated.Value(-500)).current;
  const scaleXAnim = useRef(new Animated.Value(-1)).current;

  const glowAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const isFocused = useIsFocused();

  const spinBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(spinBounce, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(spinBounce, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, []);

  // BACKGROUND ZOOM LOOP
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 12000,
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, []);

  // LOGO GLOW LOOP
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4600,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 4600,
          useNativeDriver: false,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, []);

  // WITCH MOVE LOOP
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(witchAnim, {
            toValue: 20,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleXAnim, {
            toValue: -1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(3000),

        Animated.parallel([
          Animated.timing(witchAnim, {
            toValue: 900,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleXAnim, {
            toValue: -1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(witchAnim, {
            toValue: 20,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleXAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(3000),

        Animated.parallel([
          Animated.timing(witchAnim, {
            toValue: -900,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleXAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, []);

  // HOME MUSIC
  useEffect(() => {
    if (!loading && isFocused) {
      playBG("home");
    } else {
      stopBG();
    }
  }, [isFocused, loading]);

  const startGame = async (isNew = false) => {
    stopBG();

    if (isNew) {
      dispatch(resetGame());
    }

    playFX("game_start");
    router.push("/gameScreens/PassNPlayGame");
  };

  const handleNewGamePress = useCallback(() => {
    startGame(true);
  }, []);

  const handleResumePress = useCallback(() => {
    startGame(false);
  }, []);

  // 🔒 Login required only for Online + Snake Ladder
  const openLockedMode = () => {
    if (!isSignedIn) {
      router.push("/auth/login");
      return;
    }

    setShowComingSoon(true);
  };

  return loading ? (
    <HomeLoader />
  ) : (
    <View style={{ flex: 1 }}>
      <GameHeader
        coins={1970}
        gems={150}
        level={1}
        onPressProfile={() => console.log("Profile")}
        onPressCoins={() => console.log("Buy Coins")}
        onPressGems={() => console.log("Buy Gems")}
        onPressStore={() => console.log("Store")}
        onPressSettings={() => console.log("Settings")}
      />

      {/* WHOLE SCREEN */}
      <View style={{ flex: 1 }}>
        {/* BACKGROUND ONLY SCALES */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              transform: [
                {
                  scale: bgAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.04],
                  }),
                },
              ],
            },
          ]}
        >
          <ImageBackground
            source={HomeBG}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* UI DOES NOT SCALE */}
        <View style={{ flex: 1 }}>
          {/* SPIN BUTTON LEFT */}
{isSignedIn && (
  <Pressable
    style={styles.spinBtn}
    onPress={() => {
      playFX("ui");
      setShowSpin(true);
    }}
  >
    <Animated.Image
      source={SpinBtn}
      style={[
        styles.spinImg,
        {
          transform: [{ scale: spinBounce }],
        },
      ]}
    />
  </Pressable>
)}


          {/* LOGO */}
          <View style={styles.imgContainer}>
            <Animated.View
              style={[
                styles.logoGlowLayer,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.15, 0.65],
                  }),
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.12],
                      }),
                    },
                  ],
                },
              ]}
            />

            <Animated.Image
              source={Logo}
              style={[
                styles.img,
                {
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1.06, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* BUTTON GRID */}
          <View style={styles.modeGrid}>
         {/* ✅ RESUME OR PASS N PLAY (ONLY ONE) */}
  {hasGameStarted ? (
    <ModeCard
      title="Resume"
      subtitle="Continue game"
      icon={Earth}
      color="#00eaff"
      onPress={handleResumePress}
    />
  ) : (
    <ModeCard
      title="Pass N Play"
      subtitle="Local match"
      icon={Pass}
      color="#ff3b30"
      onPress={() => {
        setShowPassPlaySelect(true);
      }}
    />
  )}


            {/* ✅ WORKS WITHOUT LOGIN */}
            <ModeCard
              title="Computer"
              subtitle="Coming soon"
              icon={Vs}
              color="#ffd700"
              onPress={() => setShowComingSoon(true)}
            />

            {/* 🔒 LOGIN REQUIRED */}
          <ModeCard
  title="Online"
  subtitle="Play with friends"
  icon={Friends}
  color="#89dd0a"
  onPress={() => {
    if (!isSignedIn) {
      router.push("/auth/login");
      return;
    }
    router.push("/pages_modals/online/OnlineRoomScreen");
  }}
/>


            {/* 🔒 LOGIN REQUIRED */}
            <ModeCard
              title="Snake Ladder"
              subtitle="Coming soon"
              icon={Snake}
              color="#ff7b00"
              onPress={openLockedMode}
            />
          </View>

          {/* WITCH */}
          <Animated.View
            style={[
              styles.witchContainer,
              {
                transform: [{ translateX: witchAnim }, { scaleX: scaleXAnim }],
              },
            ]}
          >
            <Pressable
              onPress={() => {
                const random = Math.floor(Math.random() * 3) + 1;
                playFX(`girl${random}`);
              }}
            >
              <LottieView
                source={Witch}
                autoPlay
                loop
                speed={1}
                style={styles.witch}
              />
            </Pressable>
          </Animated.View>

          <ComingSoonModal
            visible={showComingSoon}
            onClose={() => setShowComingSoon(false)}
          />

         {isSignedIn && (
  <SpinWheelModal
    visible={showSpin}
    onClose={() => setShowSpin(false)}
    onReward={(coins) => {
      console.log("SPIN REWARD:", coins);
      setShowSpin(false);
    }}
  />
)}
<PassNPlayModal
  visible={showPassPlaySelect}
  onClose={() => setShowPassPlaySelect(false)}
  onClassic={() => {
  setSelectedMode("classic");
  setShowPassPlaySelect(false);
  setShowSelectModal(true);
}}

  onQuick={() => {
  setSelectedMode("quick");
  setShowPassPlaySelect(false);
  setShowSelectModal(true);
}}

/>

<SelectPersonTokenModal
  visible={showSelectModal}
  mode={selectedMode}
  onClose={() => setShowSelectModal(false)}
  onPlay={(players, colors) => {
    setShowSelectModal(false);

    router.push({
      pathname: "/gameScreens/PassNPlayGame",
      params: {
        players: String(players),
        colors: colors.join(","),
      },
    });
  }}
/>


        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imgContainer: {
    width: "70%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 60,
    marginBottom: 18,
  },

  logoGlowLayer: {
    marginTop: 40,
    position: "absolute",
    width: "75%",
    height: "75%",
    borderRadius: 999,
    backgroundColor: "#020d462b",
    shadowColor: "#020116",
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 35,
  },

  img: {
    width: "110%",
    height: "110%",
    resizeMode: "contain",
    zIndex: 5,
  },

  modeGrid: {
    marginTop: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    rowGap: 8,
    columnGap: 10,
  },

  witchContainer: {
    position: "absolute",
    bottom: 35,
    left: 40,
    zIndex: 1,
    elevation: 1,
    opacity: 0.95,
  },

  witch: {
    height: 210,
    width: 210,
    transform: [{ rotate: "25deg" }],
  },

  spinBtn: {
    position: "absolute",
    left: 12,
    top: 110,
    width: 90,
    height: 90,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: "center",
    alignItems: "center",
  },

  spinImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
