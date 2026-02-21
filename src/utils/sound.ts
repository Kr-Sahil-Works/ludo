import { createAudioPlayer, AudioPlayer } from "expo-audio";

// =====================================================
// 🎧 PLAYERS
// =====================================================

let bgPlayer: AudioPlayer | null = null;
let fxPlayer: AudioPlayer | null = null;

let currentBGTrack: string | null = null;

// ✅ FIXED TYPE (no more any)
let bgFadeInterval: ReturnType<typeof setInterval> | null = null;

// =====================================================
// 🔊 CONFIG
// =====================================================

const BG_MAX_VOLUME = 0.2;
const FX_MAX_VOLUME = 1.0;

const FADE_STEP = 0.04;
const FADE_DELAY = 60;

// =====================================================
// 🌍 GLOBAL SETTINGS
// =====================================================

let FX_ENABLED = true;
let MUSIC_ENABLED = true;
let ALL_SOUND_ENABLED = true;

// =====================================================
// 🎵 SOUND FILES
// =====================================================

const soundFiles: Record<string, any> = {
  home: require("../assets/sounds/hometrack.mp3"),
  game_start: require("../assets/sounds/game_start.mp3"),

  girl1: require("../assets/sounds/girl1.mp3"),
  girl2: require("../assets/sounds/girl2.mp3"),
  girl3: require("../assets/sounds/girl3.mp3"),

  dice_roll: require("../assets/sounds/dice_roll.mp3"),
  ui: require("../assets/sounds/ui.mp3"),

  coins_pour: require("../assets/sounds/Coins_Pour.mp3"),
  coins_sound: require("../assets/sounds/Coins_sound.mp3"),
  luckywheelspin: require("../assets/sounds/Luckywheelspin.mp3"),
  pop: require("../assets/sounds/Pop.mp3"),

  pileMove: require("../assets/sounds/pile_move.mp3"),
  collide: require("../assets/sounds/punch.mp3"),
  safespot: require("../assets/sounds/safe_spot.mp3"),
  homepass: require("../assets/sounds/homepass.mp3"),
};

// =====================================================
// 🧹 INTERNAL HELPERS
// =====================================================

function clearBGFade() {
  if (bgFadeInterval) {
    clearInterval(bgFadeInterval);
    bgFadeInterval = null;
  }
}

function safePause(player: AudioPlayer | null) {
  try {
    player?.pause();
  } catch {}
}

function fadeBGToVolume(targetVolume: number, onDone?: () => void) {
  clearBGFade();

  if (!bgPlayer) {
    onDone?.();
    return;
  }

  bgFadeInterval = setInterval(() => {
    try {
      if (!bgPlayer) {
        clearBGFade();
        return;
      }

      const current = bgPlayer.volume ?? 1;

      if (Math.abs(current - targetVolume) <= FADE_STEP) {
        bgPlayer.volume = targetVolume;
        clearBGFade();
        onDone?.();
        return;
      }

      if (current < targetVolume) {
        bgPlayer.volume = Math.min(targetVolume, current + FADE_STEP);
      } else {
        bgPlayer.volume = Math.max(targetVolume, current - FADE_STEP);
      }
    } catch (err) {
      console.log("Fade error:", err);
      clearBGFade();
    }
  }, FADE_DELAY);
}

// =====================================================
// ⚙️ SETTINGS
// =====================================================

export function setFXEnabled(value: boolean) {
  FX_ENABLED = value;
  if (!value) stopFX();
}

export function setMusicEnabled(value: boolean) {
  MUSIC_ENABLED = value;
}

export function setAllSoundEnabled(value: boolean) {
  ALL_SOUND_ENABLED = value;
}

export const getFXEnabled = () => FX_ENABLED;
export const getMusicEnabled = () => MUSIC_ENABLED;
export const getAllSoundEnabled = () => ALL_SOUND_ENABLED;

// =====================================================
// 🎼 BACKGROUND MUSIC
// =====================================================

export function playBG(name: string, fadeIn: boolean = true) {
  try {
    if (!soundFiles[name]) return;
    if (!ALL_SOUND_ENABLED || !MUSIC_ENABLED) return;

    // ✅ same track guard
    if (bgPlayer && currentBGTrack === name) return;

    // 🔁 switch track safely
    if (bgPlayer && currentBGTrack !== name) {
      stopBG(true, () => playBG(name, fadeIn));
      return;
    }

    const player = createAudioPlayer(soundFiles[name]);
    player.loop = true;

    bgPlayer = player;
    currentBGTrack = name;

    player.volume = fadeIn ? 0 : BG_MAX_VOLUME;

    setTimeout(() => {
      try {
        player.play();
        if (fadeIn) fadeBGToVolume(BG_MAX_VOLUME);
      } catch (err) {
        console.log("BG play error:", err);
      }
    }, 80);
  } catch (err) {
    console.log("BG sound error:", err);
  }
}

export function stopBG(fadeOut: boolean = false, onDone?: () => void) {
  try {
    if (!bgPlayer) {
      currentBGTrack = null;
      onDone?.();
      return;
    }

    if (fadeOut) {
      fadeBGToVolume(0, () => {
        safePause(bgPlayer);
        bgPlayer = null;
        currentBGTrack = null;
        onDone?.();
      });
    } else {
      clearBGFade();
      safePause(bgPlayer);
      bgPlayer = null;
      currentBGTrack = null;
      onDone?.();
    }
  } catch (err) {
    console.log("Stop BG error:", err);
  }
}

// =====================================================
// 🔊 SOUND EFFECTS
// =====================================================

export function playFX(name: string) {
  try {
    if (!soundFiles[name]) return;
    if (!ALL_SOUND_ENABLED || !FX_ENABLED) return;

    // ✅ smoother stop (no pop)
    if (fxPlayer) {
      safePause(fxPlayer);
      fxPlayer = null;
    }

    const player = createAudioPlayer(soundFiles[name]);
    player.loop = false;
    player.volume = FX_MAX_VOLUME;

    fxPlayer = player;
    player.play();
  } catch (err) {
    console.log("FX sound error:", err);
  }
}

export const playSound = playFX;

export function stopFX() {
  safePause(fxPlayer);
  fxPlayer = null;
}

export function stopAllSound(fadeOut: boolean = false) {
  stopFX();
  stopBG(fadeOut);
}

// =====================================================
// 🧠 APPLY SETTINGS SAFELY
// =====================================================

export function applySoundSettings() {
  if (!ALL_SOUND_ENABLED || !MUSIC_ENABLED) {
    stopBG(true);
  }
}