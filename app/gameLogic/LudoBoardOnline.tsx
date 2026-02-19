import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import Token from "./Token";

import {
  GRID_SIZE,
  getTokenPositionXY,
  getCellXY,
  HomeTokenSlots,
} from "../../src/helpers/BoardPositions";

import TileImpactPulse from "@/app/gameLogic/TileImpactPulse";

const BoardImg = require("@/src/assets/images/boardsquare_2040.png");
const PADDING = 6;

const RedToken = require("@/src/assets/images/piles/red_1024_transparent.png");
const GreenToken = require("@/src/assets/images/piles/green_1024_transparent.png");
const YellowToken = require("@/src/assets/images/piles/yellow_1024_transparent.png");
const BlueToken = require("@/src/assets/images/piles/blue_1024_transparent.png");

type Player = {
  name: string;
  tokens: number[];
  color: "red" | "green" | "yellow" | "blue";
};

type Props = {
  boardSize: number;
  players: Player[];
  onTokenPress: (playerIndex: number, tokenIndex: number) => void;
  diceValue: number;
  currentPlayer: number;
  movableTokens: number[];
  cuttingTokenKey: string | null;
  activePlayerIndexes: number[]; // ✅ ADD THIS
};


export default function LudoBoardOnline({
  boardSize,
  players,
  onTokenPress,
  diceValue,
  currentPlayer,
  movableTokens,
  cuttingTokenKey,
}: Props) {
  const cellSize = (boardSize - PADDING * 2) / GRID_SIZE;
  const tokenSize = cellSize * 0.7;

  const [impacts, setImpacts] = useState<
    { id: string; x: number; y: number; color: string }[]
  >([]);

  const triggerImpact = (x: number, y: number, color: string) => {
    const id = `${Date.now()}-${Math.random()}`;

    setImpacts((prev) => [
      ...prev,
      {
        id,
        x: x - tokenSize * 0.2,
        y: y - tokenSize * 0.2,
        color,
      },
    ]);
  };

  // 🔥 COLOR → BOARD INDEX MAP
  const colorIndexMap: Record<string, number> = {
    red: 0,
    green: 1,
    yellow: 2,
    blue: 3,
  };

  const getTokenImage = (color: string) => {
    if (color === "red") return RedToken;
    if (color === "green") return GreenToken;
    if (color === "yellow") return YellowToken;
    return BlueToken;
  };

  const getGlowColor = (color: string) => {
    if (color === "red") return "rgba(255,45,45,0.9)";
    if (color === "green") return "rgba(0,255,60,0.9)";
    if (color === "yellow") return "rgba(255,213,0,0.9)";
    return "rgba(0,183,255,0.9)";
  };

  const getKickDirection = (color: string) => {
    if (color === "red") return "left";
    if (color === "green") return "right";
    if (color === "yellow") return "left";
    return "right";
  };

  const shouldHighlightToken = (pIndex: number, tokenIndex: number) => {
    if (pIndex !== currentPlayer) return false;
    if (diceValue <= 0) return false;
    return movableTokens.includes(tokenIndex);
  };

  return (
    <View style={[styles.boardWrapper, { width: boardSize, height: boardSize }]}>
      <Image source={BoardImg} style={styles.boardImage} />

      {impacts.map((i) => (
        <TileImpactPulse
          key={i.id}
          x={i.x}
          y={i.y}
          size={tokenSize * 1.3}
          color={i.color}
          onDone={() =>
            setImpacts((prev) => prev.filter((p) => p.id !== i.id))
          }
        />
      ))}

      {players.map((player, playerIndex) => {
        const boardIndex = colorIndexMap[player.color];
        const glowColor = getGlowColor(player.color);

        return player.tokens.map((pos, tokenIndex) => {
          let cellX = 0;
          let cellY = 0;

          if (pos === 0) {
            const slot =
              boardIndex === 0
                ? HomeTokenSlots.red[tokenIndex]
                : boardIndex === 1
                ? HomeTokenSlots.green[tokenIndex]
                : boardIndex === 2
                ? HomeTokenSlots.yellow[tokenIndex]
                : HomeTokenSlots.blue[tokenIndex];

            const homeXY = getCellXY(cellSize, slot.row, slot.col);
            cellX = homeXY.x;
            cellY = homeXY.y;
          } else {
            const boardXY = getTokenPositionXY(pos, cellSize);
            cellX = boardXY.x;
            cellY = boardXY.y;
          }

          const centerX = cellX + cellSize / 2;
          const centerY = cellY + cellSize / 2;

          const finalX = centerX - tokenSize / 2 + PADDING;
          const finalY = centerY - tokenSize / 2 + PADDING;

          return (
           <Token
  key={`${player.color}-${tokenIndex}`}
  x={finalX}
  y={finalY}
  homeX={finalX}
  homeY={finalY}
  size={tokenSize}
  image={getTokenImage(player.color)}
  highlight={
    playerIndex === currentPlayer &&
    diceValue > 0 &&
    movableTokens.includes(tokenIndex)
  }
  glowColor={glowColor}
  isCutting={
    cuttingTokenKey === `${playerIndex}-${tokenIndex}`
  }
  kickDirection={getKickDirection(player.color)}
  zIndex={1000 + tokenIndex}
  onPress={() => onTokenPress(playerIndex, tokenIndex)}
  onStepImpact={(impactX, impactY) =>
    triggerImpact(impactX, impactY, glowColor)
  }
/>

          );
        });
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrapper: {
    alignSelf: "center",
    borderRadius: 18,
    overflow: "hidden",
    padding: 6,
    backgroundColor: "transparent",
  },

  boardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
  },
});
