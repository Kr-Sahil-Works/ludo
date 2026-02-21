import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import TokenOnline from "./TokenOnline";

import {
  GRID_SIZE,
  getTokenPositionXY,
  getCellXY,
  HomeTokenSlots,
} from "../../../src/helpers/BoardPositions";

import TileImpactPulseOnline from "./TileImpactPulseOnline";
import { startingPoints, victoryStart } from "@/src/helpers/PlotData";

const BoardImg = require("@/src/assets/images/boardsquare_2040.png");
const PADDING = Math.round(6);

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
  activePlayerIndexes: number[];
  lastMoveSteps?: number[];
  lastMovePlayerIndex?: number | null;
  lastMoveTokenIndex?: number | null;
};

export default function LudoBoardOnline({
  boardSize,
  players,
  onTokenPress,
  diceValue,
  currentPlayer,
  movableTokens,
  cuttingTokenKey,
  activePlayerIndexes,
  lastMoveSteps,
  lastMovePlayerIndex,
  lastMoveTokenIndex,
}: Props) {
  const usableBoardSize = boardSize - PADDING * 2;
  const cellSize = usableBoardSize / GRID_SIZE;
  const tokenSize = Math.round(cellSize * 0.7);

  const [impacts, setImpacts] = useState<
    { id: string; x: number; y: number; color: string }[]
  >([]);

  // 🔥 LAG BUFFER (core addition)
  const lagBufferRef = useRef<
    Record<string, { pos: number; time: number }[]>
  >({});

  const [animatedPositions, setAnimatedPositions] = useState<
    Record<string, number>
  >({});

  const walkingRef = useRef(false);

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

  // 🧠 AUTHORITATIVE WALK + LAG BUFFER
  useEffect(() => {
    if (!lastMoveSteps?.length) return;
    if (lastMovePlayerIndex == null || lastMoveTokenIndex == null) return;
    if (walkingRef.current) return;

    const key = `${lastMovePlayerIndex}-${lastMoveTokenIndex}`;
    walkingRef.current = true;

    if (!lagBufferRef.current[key]) {
      lagBufferRef.current[key] = [];
    }

    let cancelled = false;

    const run = async () => {
      for (let i = 0; i < lastMoveSteps.length; i++) {
        if (cancelled) break;

        const stepPos = lastMoveSteps[i];

        // 🔥 push into buffer
        lagBufferRef.current[key].push({
          pos: stepPos,
          time: Date.now(),
        });

        // keep buffer small
        if (lagBufferRef.current[key].length > 6) {
          lagBufferRef.current[key].shift();
        }

        // 🎯 smooth delayed render (THE MAGIC)
        const renderPos =
          lagBufferRef.current[key][
            lagBufferRef.current[key].length - 1
          ]?.pos ?? stepPos;

        setAnimatedPositions((prev) => ({
          ...prev,
          [key]: renderPos,
        }));

        await new Promise((res) => setTimeout(res, 180));
      }

      walkingRef.current = false;
    };

    run();

    return () => {
      cancelled = true;
      walkingRef.current = false;
    };
  }, [lastMoveSteps, lastMovePlayerIndex, lastMoveTokenIndex]);

  return (
    <View style={[styles.boardWrapper, { width: boardSize, height: boardSize }]}>
      {BoardImg && <Image source={BoardImg} style={styles.boardImage} />}

      {impacts.map((i) => (
        <TileImpactPulseOnline
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

      {players.flatMap((player, playerIndex) => {
        const boardIndex = colorIndexMap[player.color];
        const glowColor = getGlowColor(player.color);

        return player.tokens.map((pos, tokenIndex) => {
          const animKey = `${playerIndex}-${tokenIndex}`;

          const displayPos =
            animatedPositions[animKey] ?? pos ?? 0;

          let cellX = 0;
          let cellY = 0;

          if (displayPos === 0) {
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
            const boardXY = getTokenPositionXY(displayPos, cellSize);
            cellX = boardXY.x;
            cellY = boardXY.y;
          }

          const centerX = cellX + cellSize / 2;
          const centerY = cellY + cellSize / 2;

          const stackOffsetX = (tokenIndex % 2) * (tokenSize * 0.18);
          const stackOffsetY =
            Math.floor(tokenIndex / 2) * (tokenSize * 0.18);

          const finalX = Math.round(
            centerX - tokenSize / 2 + stackOffsetX + PADDING
          );
          const finalY = Math.round(
            centerY - tokenSize / 2 + stackOffsetY + PADDING
          );

          const homeSlot =
            boardIndex === 0
              ? HomeTokenSlots.red[tokenIndex]
              : boardIndex === 1
              ? HomeTokenSlots.green[tokenIndex]
              : boardIndex === 2
              ? HomeTokenSlots.yellow[tokenIndex]
              : HomeTokenSlots.blue[tokenIndex];

          const homeXY = getCellXY(cellSize, homeSlot.row, homeSlot.col);

          const homeCenterX = homeXY.x + cellSize / 2;
          const homeCenterY = homeXY.y + cellSize / 2;

          const homeFinalX =
            homeCenterX - tokenSize / 2 + stackOffsetX + PADDING;
          const homeFinalY =
            homeCenterY - tokenSize / 2 + stackOffsetY + PADDING;

          return (
            <TokenOnline
              key={`${playerIndex}-${tokenIndex}`}
              x={finalX}
              y={finalY}
              homeX={homeFinalX}
              homeY={homeFinalY}
              size={tokenSize}
              image={getTokenImage(player.color)}
              highlight={
                playerIndex === currentPlayer &&
                diceValue > 0 &&
                movableTokens.includes(tokenIndex)
              }
              glowColor={glowColor}
              isCutting={cuttingTokenKey === `${playerIndex}-${tokenIndex}`}
              kickDirection={getKickDirection(player.color)}
              zIndex={1000 + tokenIndex}
              isHomeFinal={
                displayPos === victoryStart[boardIndex] + 5
              }
              isSpawnProtected={
                displayPos === startingPoints[boardIndex]
              }
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

