import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  message?: string;
};

export default function OfflineToast({
  visible,
  message = "YOU ARE OFFLINE. CONNECT TO INTERNET!",
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(anim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.box,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.96, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    width: Math.min(width * 0.85, 360),
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#000",
    borderWidth: 3,
    borderColor: "#ffd24a",
    zIndex: 999999,
    elevation: 999999,
  },

  text: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffd24a",
    textAlign: "center",
    textTransform: "uppercase",
  },
});
