import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Animated,
  Pressable,
  ImageBackground,
} from "react-native";

import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import { useDispatch, useSelector } from "react-redux";
import { resetGame } from "../src/redux/gameSlice";
import { selectPositions } from "../src/redux/selectors";

import ComingSoonModal from "../src/components/ComingSoonModal";
import GradientButton from "../src/components/GradientButton";

import { playSound, stopSound } from "../src/utils/sound";


const Logo: any = require("../src/assets/images/brightlogo.png");
const HomeBG: any = require("../src/assets/images/hf2.png");
const Witch: any = require("../src/assets/animation/witch.json");


export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentPosition = useSelector(selectPositions);


  const [showComingSoon, setShowComingSoon] = useState(false);

  const witchAnim = useRef(new Animated.Value(-500)).current;
  const scaleXAnim = useRef(new Animated.Value(-1)).current;

  const isFocused = useIsFocused();

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

    return () => {
      animation.stop();
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      playSound("home", true);
    } else {
      stopSound();
    }
  }, [isFocused]);

  const startGame = async (isNew = false) => {
    stopSound();

    if (isNew) {
      dispatch(resetGame());
    }

    playSound("game_start");
    router.push("/game");
  };

  const handleNewGamePress = useCallback(() => {
    startGame(true);
  }, []);

  const handleResumePress = useCallback(() => {
    startGame(false);
  }, []);

  return (
    <ImageBackground source={HomeBG} style={styles.container} resizeMode="cover">
      <View style={styles.imgContainer}>
        <Image source={Logo} style={styles.img} />
      </View>

      <View style={styles.buttonsContainer}>
        {currentPosition.length !== 0 && (
          <GradientButton title="RESUME" onPress={handleResumePress} />
        )}

        <GradientButton
          title="NEW GAME"
          onPress={handleNewGamePress}
          tokenColor="#ff3b30"
        />

        <GradientButton
          title="VS COMPUTER"
          onPress={() => setShowComingSoon(true)}
          tokenColor="#d87300"
        />

        <GradientButton
          title="PLAY ONLINE"
          onPress={() => setShowComingSoon(true)}
          tokenColor="#89dd0a"
        />
      </View>

      {/* Witch Animation */}
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
            playSound(`girl${random}`);
          }}
        >
          <LottieView source={Witch} autoPlay loop speed={1} style={styles.witch} />
        </Pressable>
      </Animated.View>

      <ComingSoonModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />

      <Text style={styles.artist}>A Game By • Nobita</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

   buttonsContainer: {
    marginTop: -50,
    alignItems: "center",
    zIndex: 10,          // ✅ always above witch
    elevation: 10,
  },


  imgContainer: {
    width: "60%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: -40,
    alignSelf: "center",
  },

  img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  artist: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    elevation: 6,
  },

   witchContainer: {
    position: "absolute",
    bottom: 40,          // ✅ always stays below buttons
    left: -40,           // move left a bit
    zIndex: 1,           // ✅ behind buttons
    elevation: 1,
    opacity: 0.95,
  },

  witch: {
    height: 210,         // smaller so it won't touch buttons
    width: 210,
    transform: [{ rotate: "25deg" }],
  },

});
