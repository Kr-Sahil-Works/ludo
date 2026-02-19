import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setMusicEnabled,
  setAllSoundEnabled,
  applySoundSettings,
  getMusicEnabled,
  getAllSoundEnabled,
} from "./sound";

const KEY_MUSIC = "SETTINGS_MUSIC";
const KEY_SFX = "SETTINGS_SFX";
const KEY_VIBRATION = "SETTINGS_VIBRATION";

let VIBRATION_ENABLED = true;

export async function loadMusicSetting() {
  const saved = await AsyncStorage.getItem(KEY_MUSIC);
  if (saved !== null) {
    setMusicEnabled(saved === "true");
  }
}

export async function saveMusicSetting(value: boolean) {
  setMusicEnabled(value);
  await AsyncStorage.setItem(KEY_MUSIC, String(value));
  applySoundSettings();
}

export function isMusicEnabled() {
  return getMusicEnabled();
}

export async function loadSfxSetting() {
  const saved = await AsyncStorage.getItem(KEY_SFX);
  if (saved !== null) {
    setAllSoundEnabled(saved === "true");
  }
}

export async function saveSfxSetting(value: boolean) {
  setAllSoundEnabled(value);
  await AsyncStorage.setItem(KEY_SFX, String(value));
  applySoundSettings();
}

export function isSfxEnabled() {
  return getAllSoundEnabled();
}

export async function loadVibrationSetting() {
  const saved = await AsyncStorage.getItem(KEY_VIBRATION);
  if (saved !== null) {
    VIBRATION_ENABLED = saved === "true";
  }
}

export async function saveVibrationSetting(value: boolean) {
  VIBRATION_ENABLED = value;
  await AsyncStorage.setItem(KEY_VIBRATION, String(value));
}

export function isVibrationEnabled() {
  return VIBRATION_ENABLED;
}
