import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import LudoDotsLoader from "../src/components/LudoDotsLoader";


const Logo = require("../src/assets/images/ludo-logo.png");
const SplashBG = require("../src/assets/images/splash-bg.png");

export default function SplashScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();

    const timer = setTimeout(() => {
      router.replace("/home");
    }, 1500);

    return () => {
      breathingAnimation.stop();
      clearTimeout(timer);
    };
  }, []);

  return (
    <ImageBackground source={SplashBG} style={styles.container} resizeMode="cover">
      <View style={styles.center}>
        <Animated.View style={[styles.imgContainer, { transform: [{ scale }] }]}>
          <Image source={Logo} style={styles.img} />
        </Animated.View>

       <LudoDotsLoader />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imgContainer: {
    width: "70%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  loader: {
    marginTop: 30,
    width: 60,
    height: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});
