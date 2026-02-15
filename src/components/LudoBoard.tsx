import React from "react";
import { View, StyleSheet, Image } from "react-native";
import Token from "./Token";

import {
  GRID_SIZE,
  getTokenPositionXY,
  getCellXY,
  HomeTokenSlots,
} from "../helpers/BoardPositions";

const BoardImg = require("../assets/images/boardsquare_2040.png");
const PADDING = 6;

const RedToken = require("../assets/images/piles/red_1024.png");
const GreenToken = require("../assets/images/piles/green_1024.png");
const YellowToken = require("../assets/images/piles/yellow_1024.png");
const BlueToken = require("../assets/images/piles/blue_1024.png");

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
};

export default function LudoBoard({
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
    // You can adjust this based on your board layout
    if (pIndex === 0) return "left"; // red
    if (pIndex === 1) return "right"; // green
    if (pIndex === 2) return "left"; // yellow
    return "right"; // blue
  };

  return (
    <View style={[styles.boardWrapper, { width: boardSize, height: boardSize }]}>
      <Image source={BoardImg} style={styles.boardImage} />

      {players.map((player: Player, pIndex: number) =>
        player.tokens.map((pos: number, tIndex: number) => {
          let cellX = 0;
          let cellY = 0;

          if (pos === 0) {
            const slot = getHomeSlot(pIndex, tIndex);
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

          // stacking offset
          const stackOffsetX = (tIndex % 2) * (tokenSize * 0.18);
          const stackOffsetY = Math.floor(tIndex / 2) * (tokenSize * 0.18);

          const off = getTokenOffset(pIndex);
          finalX += stackOffsetX + off.x;
          finalY += stackOffsetY + off.y;

          // padding correction
          finalX += PADDING;
          finalY += PADDING;

          // ✅ HOME POSITION ALWAYS CALCULATED (for cut animation return)
          const homeSlot = getHomeSlot(pIndex, tIndex);
          const homeXY = getCellXY(cellSize, homeSlot.row, homeSlot.col);

          const homeCenterX = homeXY.x + cellSize / 2;
          const homeCenterY = homeXY.y + cellSize / 2;

          let homeFinalX = homeCenterX - tokenSize / 2;
          let homeFinalY = homeCenterY - tokenSize / 2;

          homeFinalX += stackOffsetX + off.x;
          homeFinalY += stackOffsetY + off.y;

          homeFinalX += PADDING;
          homeFinalY += PADDING;

          const glowColor =
            pIndex === 0
              ? "rgba(255,45,45,0.85)"
              : pIndex === 1
              ? "rgba(0,255,60,0.85)"
              : pIndex === 2
              ? "rgba(255,213,0,0.85)"
              : "rgba(0,183,255,0.85)";

          return (
            <Token
              key={`${pIndex}-${tIndex}`}
              x={finalX}
              y={finalY}
              homeX={homeFinalX}
              homeY={homeFinalY}
              size={tokenSize}
              image={getTokenImage(pIndex)}
              highlight={shouldHighlightToken(pIndex, tIndex)}
              glowColor={glowColor}
              isCutting={
                pos !== 0 && cuttingTokenKey === `${pIndex}-${tIndex}`
              }
              kickDirection={getKickDirection(pIndex)}
              zIndex={1000 + tIndex}
              onPress={() => onTokenPress(pIndex, tIndex)}
            />
          );
        })
      )}
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
