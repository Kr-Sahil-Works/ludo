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

const RedToken = require("@/src/assets/images/piles/red_1024.png");
const GreenToken = require("@/src/assets/images/piles/green_1024.png");
const YellowToken = require("@/src/assets/images/piles/yellow_1024.png");
const BlueToken = require("@/src/assets/images/piles/blue_1024.png");

type Player = {
  name: string;
  tokens: number[];
};

type Props = {
  boardSize: number;
  players: Player[];
  onTokenPress: (playerIndex: number, tokenIndex: number) => void;
  diceValue: number;
  currentPlayer: number;
  movableTokens: number[];
  cuttingTokenKey: string | null;
  activePlayerIndexes: number[];
};

export default function LudoBoard({
  boardSize,
  players,
  onTokenPress,
  diceValue,
  currentPlayer,
  movableTokens,
  cuttingTokenKey,
  activePlayerIndexes,
}: Props) {
  const cellSize = (boardSize - PADDING * 2) / GRID_SIZE;
  const tokenSize = cellSize * 0.7;

  // ✅ TILE IMPACT EFFECT STATE
  const [impacts, setImpacts] = useState<
    { id: string; x: number; y: number; color: string }[]
  >([]);

  // ✅ Trigger Impact Pulse
  const triggerImpact = (x: number, y: number, color: string = "#00ffff") => {
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

  const getTokenOffset = (playerIndex: number) => {
    if (playerIndex === 0) return { x: 4, y: -1 }; // red
    if (playerIndex === 1) return { x: 1, y: 1 }; // green
    if (playerIndex === 3) return { x: 1, y: -1 }; // blue
    return { x: 0, y: 0 }; // yellow
  };

  const getHomeSlot = (playerIndex: number, tokenIndex: number) => {
    if (playerIndex === 0) return HomeTokenSlots.red[tokenIndex];
    if (playerIndex === 1) return HomeTokenSlots.green[tokenIndex];
    if (playerIndex === 2) return HomeTokenSlots.yellow[tokenIndex];
    return HomeTokenSlots.blue[tokenIndex];
  };

  const getTokenImage = (playerIndex: number) => {
    if (playerIndex === 0) return RedToken;
    if (playerIndex === 1) return GreenToken;
    if (playerIndex === 2) return YellowToken;
    return BlueToken;
  };

  const shouldHighlightToken = (pIndex: number, tokenIndex: number) => {
    if (pIndex !== currentPlayer) return false;
    if (diceValue <= 0) return false;

    return movableTokens.includes(tokenIndex);
  };

  const getKickDirection = (pIndex: number) => {
    if (pIndex === 0) return "left";
    if (pIndex === 1) return "right";
    if (pIndex === 2) return "left";
    return "right";
  };

  const getGlowColor = (realPlayerIndex: number) => {
    return realPlayerIndex === 0
      ? "rgba(255,45,45,0.9)"
      : realPlayerIndex === 1
      ? "rgba(0,255,60,0.9)"
      : realPlayerIndex === 2
      ? "rgba(255,213,0,0.9)"
      : "rgba(0,183,255,0.9)";
  };

  return (
    <View style={[styles.boardWrapper, { width: boardSize, height: boardSize }]}>
      {/* BOARD IMAGE */}
      <Image source={BoardImg} style={styles.boardImage} />

      {/* ✅ TILE IMPACT PULSES */}
      {impacts.map((i) => (
        <TileImpactPulse
          key={i.id}
          x={i.x}
          y={i.y}
          size={tokenSize * 1.3}
          color={i.color}
          onDone={() => {
            setImpacts((prev) => prev.filter((p) => p.id !== i.id));
          }}
        />
      ))}

      {/* TOKENS */}
      {players.map((player: Player, localIndex: number) => {
        const realPlayerIndex = activePlayerIndexes[localIndex];

        return player.tokens.map((pos: number, tIndex: number) => {
          let cellX = 0;
          let cellY = 0;

          if (pos === 0) {
            const slot = getHomeSlot(realPlayerIndex, tIndex);
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

          let finalX = centerX - tokenSize / 2;
          let finalY = centerY - tokenSize / 2;

          const stackOffsetX = (tIndex % 2) * (tokenSize * 0.18);
          const stackOffsetY = Math.floor(tIndex / 2) * (tokenSize * 0.18);

          const off = getTokenOffset(realPlayerIndex);
          finalX += stackOffsetX + off.x;
          finalY += stackOffsetY + off.y;

          finalX += PADDING;
          finalY += PADDING;

          // HOME POSITION (for cutting animation teleport)
          const homeSlot = getHomeSlot(realPlayerIndex, tIndex);
          const homeXY = getCellXY(cellSize, homeSlot.row, homeSlot.col);

          const homeCenterX = homeXY.x + cellSize / 2;
          const homeCenterY = homeXY.y + cellSize / 2;

          let homeFinalX = homeCenterX - tokenSize / 2;
          let homeFinalY = homeCenterY - tokenSize / 2;

          homeFinalX += stackOffsetX + off.x;
          homeFinalY += stackOffsetY + off.y;

          homeFinalX += PADDING;
          homeFinalY += PADDING;

          const glowColor = getGlowColor(realPlayerIndex);

          return (
            <Token
              key={`${realPlayerIndex}-${tIndex}`}
              x={finalX}
              y={finalY}
              homeX={homeFinalX}
              homeY={homeFinalY}
              size={tokenSize}
              image={getTokenImage(realPlayerIndex)}
              highlight={shouldHighlightToken(realPlayerIndex, tIndex)}
              glowColor={glowColor}
              isCutting={
                pos !== 0 && cuttingTokenKey === `${realPlayerIndex}-${tIndex}`
              }
              kickDirection={getKickDirection(realPlayerIndex)}
              zIndex={1000 + tIndex}
              onPress={() => onTokenPress(realPlayerIndex, tIndex)}
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
