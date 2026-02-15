import { createAudioPlayer, AudioPlayer } from "expo-audio";

let bgPlayer: AudioPlayer | null = null;
let fxPlayer: AudioPlayer | null = null;

const soundFiles: Record<string, any> = {
  home: require("../assets/sounds/hometrack.mp3"),
  game_start: require("../assets/sounds/game_start.mp3"),

  girl1: require("../assets/sounds/girl1.mp3"),
  girl2: require("../assets/sounds/girl2.mp3"),
  girl3: require("../assets/sounds/girl3.mp3"),

  dice_roll: require("../assets/sounds/dice_roll.mp3"),
  ui: require("../assets/sounds/ui.mp3"),

  pileMove: require("../assets/sounds/pile_move.mp3"),
  collide: require("../assets/sounds/punch.mp3"),
  safespot: require("../assets/sounds/safe_spot.mp3"),
  homepass: require("../assets/sounds/homepass.mp3"),
};

// ✅ BACKGROUND SOUND (music)
export function playBG(name: string) {
  try {
    if (!soundFiles[name]) return;

    if (bgPlayer) {
      bgPlayer.pause();
      bgPlayer = null;
    }

    bgPlayer = createAudioPlayer(soundFiles[name]);
    bgPlayer.loop = true;

    setTimeout(() => {
      bgPlayer?.play();
    }, 200);
  } catch (err) {
    console.log("BG sound error:", err);
  }
}

// ✅ EFFECT SOUND (one shot)
export function playFX(name: string) {
  try {
    if (!soundFiles[name]) return;

    if (fxPlayer) {
      fxPlayer.pause();
      fxPlayer = null;
    }

    fxPlayer = createAudioPlayer(soundFiles[name]);
    fxPlayer.loop = false;

    fxPlayer.play();
  } catch (err) {
    console.log("FX sound error:", err);
  }
}

// ✅ COMPATIBILITY FIX (old code calls playSound)
export function playSound(name: string) {
  playFX(name);
}

export function stopBG() {
  try {
    if (bgPlayer) {
      bgPlayer.pause();
      bgPlayer = null;
    }
  } catch (err) {
    console.log("Stop BG error:", err);
  }
}

export function stopFX() {
  try {
    if (fxPlayer) {
      fxPlayer.pause();
      fxPlayer = null;
    }
  } catch (err) {
    console.log("Stop FX error:", err);
  }
}

export function stopAllSound() {
  stopBG();
  stopFX();
}
