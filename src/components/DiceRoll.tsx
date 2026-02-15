import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Image, View } from "react-native";
import LottieView from "lottie-react-native";
import { BackgroundImage } from "../helpers/GetIcons";

const diceAnim = require("../assets/animation/diceroll.json");

type Props = {
  displayDice: number;
  onFinish: () => void;
  disabled?: boolean;
};


export default function DiceRoll({ displayDice, onFinish, disabled }: Props) {
  const lottieRef = useRef<LottieView>(null);
  const [rolling, setRolling] = useState(false);

  const handlePress = () => {
  if (rolling) return;
  if (disabled) return;

  setRolling(true);

  lottieRef.current?.reset();
  lottieRef.current?.play();

  setTimeout(() => {
    onFinish();
  }, 150);

  setTimeout(() => {
    setRolling(false);
  }, 800);
};


  return (
    <Pressable onPress={handlePress} style={styles.box}>
      {rolling ? (
        <LottieView
          ref={lottieRef}
          source={diceAnim}
          loop={false}
          autoPlay={true}
          speed={1}
          style={styles.anim}
        />
      ) : displayDice > 0 ? (
        <Image
          source={BackgroundImage.GetImage(displayDice)}
          style={styles.anim}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.anim} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",

    borderRadius: 14, // ✅ SAME AS diceSlot
    overflow: "hidden", // ✅ IMPORTANT
    backgroundColor: "transparent",
  },

  anim: {
    width: "88%",
    height: "88%",
  },
});
