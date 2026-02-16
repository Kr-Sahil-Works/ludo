import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DefaultBG = require("../assets/images/ludo-bg2.png");

const Wrapper = ({ children, style, bg = DefaultBG }) => {
  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={[styles.inner, style]}>{children}</View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Wrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
