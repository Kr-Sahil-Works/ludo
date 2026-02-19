import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  Image,
} from "react-native";

const diceImages: Record<number, any> = {
  1: require("@/src/assets/images/dice/dice1.png"),
  2: require("@/src/assets/images/dice/dice2.png"),
  3: require("@/src/assets/images/dice/dice3.png"),
  4: require("@/src/assets/images/dice/dice4.png"),
  5: require("@/src/assets/images/dice/dice5.png"),
  6: require("@/src/assets/images/dice/dice6.png"),
};

type Props = {
  tokenImage: any;        // ✅ ADD THIS
  color: string;
  diceValue: number;
  isActive: boolean;
  isMyTurn: boolean;
  disabled: boolean;
  onRoll: () => void;
};

export default function OnlineDiceBox({
  tokenImage,
  color,
  diceValue,
  isActive,
  isMyTurn,
  disabled,
  onRoll,
}: Props) {

  const rotate = useRef(new Animated.Value(0)).current;
  const [rolling, setRolling] = useState(false);
  const [localDice, setLocalDice] = useState(1);

  // 🔄 Spin animation
  useEffect(() => {
    if (!rolling) return;

    const loop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    );

    loop.start();
    return () => loop.stop();
  }, [rolling]);

  // 🛑 Stop spin when server dice arrives
  useEffect(() => {
    if (diceValue > 0) {
      setRolling(false);
      rotate.setValue(0);
      setLocalDice(diceValue);
    }
  }, [diceValue]);

  const handleRoll = () => {
    if (!isMyTurn || disabled) return;

    setRolling(true);
    onRoll();
  };

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

 const shownDice = rolling
  ? Math.floor(Math.random() * 6) + 1
  : diceValue > 0
  ? diceValue
  : 1;


  return (
 <View
  style={[
    styles.wrapper,
    {
      borderColor: color,
      backgroundColor: isMyTurn ? color + "55" : "#222",
      opacity: isMyTurn ? 1 : 0.5,
    },
  ]}
>
  {/* PLAYER TOKEN */}
  <Image
    source={tokenImage}
    style={styles.token}
  />

  {/* DICE */}
  <Pressable onPress={handleRoll} disabled={!isMyTurn || disabled}>
    <Animated.Image
      source={diceImages[shownDice]}
      style={[
        styles.dice,
        {
          transform: [{ rotate: spin }],
        },
      ]}
    />
  </Pressable>
</View>

  );
}

const styles = StyleSheet.create({
wrapper: {
  position: "absolute",
  bottom: 45,
  alignSelf: "center",
  width: 200,
  height: 90,
  borderRadius: 25,
  borderWidth: 3,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
},


  dice: {
    width: 75,
    height: 75,
    resizeMode: "contain",
  },
  token: {
  width: 55,
  height: 55,
  resizeMode: "contain",
},

});
