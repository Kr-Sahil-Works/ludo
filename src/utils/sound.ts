import { createAudioPlayer, AudioPlayer } from "expo-audio";

let player: AudioPlayer | null = null;

const soundFiles: Record<string, any> = {
  home: require("../assets/sounds/home.mp3"),
  game_start: require("../assets/sounds/game_start.mp3"),

  girl1: require("../assets/sounds/girl1.mp3"),
  girl2: require("../assets/sounds/girl2.mp3"),
  girl3: require("../assets/sounds/girl3.mp3"),
};

export async function playSound(name: string, loop = false) {
  try {
    if (player) {
      player.pause();
      player = null;
    }

    player = createAudioPlayer(soundFiles[name]);

    // loop setup
    player.loop = loop;

    player.play();
  } catch (err) {
    console.log("Sound error:", err);
  }
}

export async function stopSound() {
  try {
    if (player) {
      player.pause();
      player = null;
    }
  } catch (err) {
    console.log("Stop sound error:", err);
  }
}
