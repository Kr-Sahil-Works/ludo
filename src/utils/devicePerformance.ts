import { Platform } from "react-native";

export const isAndroid = Platform.OS === "android";

// Android API:
// 34 = Android 14
// 33 = Android 13
// 31 = Android 12
// 29 = Android 10

export const isLowEndAndroid =
  Platform.OS === "android" && Number(Platform.Version) < 34;

export const isHighEndAndroid =
  Platform.OS === "android" && Number(Platform.Version) >= 34;