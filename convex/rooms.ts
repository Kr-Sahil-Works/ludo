import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { moveTokenSteps, findCutTokens } from "./gameLogic/moveLogic";

function generateRoomCode() {
  const chars = "0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// CREATE ROOM
export const createRoom = mutation({
  args: {
    hostId: v.string(),
    hostName: v.string(),

    mode: v.union(v.literal("classic"), v.literal("quick")),
    playersCount: v.number(),
    entryCoins: v.number(),

    tokenColors: v.array(v.string()),
    maxPlayers: v.number(),

    isPrivate: v.optional(v.boolean()),
    minPlayersToStart: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    let code = generateRoomCode().toUpperCase();

    while (true) {
      const existing = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (!existing) break;
      code = generateRoomCode().toUpperCase();
    }

    const roomId = await ctx.db.insert("rooms", {
      code,
      hostId: args.hostId,
      status: "waiting",

      mode: args.mode,
      playersCount: args.playersCount,
      entryCoins: args.entryCoins,

      tokenColors: args.tokenColors,
      maxPlayers: args.maxPlayers,

      isPrivate: args.isPrivate ?? true,
      minPlayersToStart: args.minPlayersToStart ?? 2,

      currentDice: 0,

      createdAt: Date.now(),
    });

    await ctx.db.insert("roomPlayers", {
      roomId,
      userId: args.hostId,
      name: args.hostName,
      joinedAt: Date.now(),
    });

    console.log("ROOM CREATED:", code);

    return { roomId, code };
  },
});

// JOIN ROOM
export const joinRoom = mutation({
  args: {
    code: v.string(),
    userId: v.string(),
    name: v.string(),
  },

  handler: async (ctx, args) => {
    const roomCode = args.code.trim().toUpperCase();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", roomCode))
      .first();

    if (!room) throw new Error("Room not found");
    if (room.status !== "waiting") throw new Error("Game already started");

    const expired = Date.now() - room.createdAt > 15 * 60 * 1000;
    if (expired) {
      await ctx.db.patch(room._id, {
        status: "abandoned",
        endedAt: Date.now(),
      });
      throw new Error("Room expired");
    }

    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (players.length >= room.maxPlayers) throw new Error("Room is full");

    const alreadyJoined = players.find((p) => p.userId === args.userId);
    if (alreadyJoined) return { roomId: room._id };

    await ctx.db.insert("roomPlayers", {
      roomId: room._id,
      userId: args.userId,
      name: args.name,
      joinedAt: Date.now(),
    });

    return { roomId: room._id };
  },
});

// GET ROOM DETAILS
export const getRoom = query({
  args: { code: v.string() },

  handler: async (ctx, args) => {
    const roomCode = args.code.trim().toUpperCase();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", roomCode))
      .first();

    if (!room) return null;

    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    players.sort((a, b) => a.joinedAt - b.joinedAt);

    const hostUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", room.hostId))
      .unique();

    const playerUsers = await Promise.all(
      players.map(async (p) => {
        const u = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", p.userId))
          .unique();

        return {
          userId: p.userId,
          name: u?.name || p.name,
          username: u?.username || null,
          imageUrl: u?.imageUrl || null,
        };
      })
    );

    return {
      room,
      players,
      hostUser,
      playerUsers,
    };
  },
});

// START GAME
export const startGame = mutation({
  args: { code: v.string(), userId: v.string() },

  handler: async (ctx, args) => {
    const roomCode = args.code.trim().toUpperCase();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", roomCode))
      .first();

    if (!room) throw new Error("Room not found");
    if (room.hostId !== args.userId) throw new Error("Only host can start");
    if (room.status !== "waiting") throw new Error("Room already started");

    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    players.sort((a, b) => a.joinedAt - b.joinedAt);

    if (players.length < room.playersCount) {
      throw new Error("Not enough players");
    }

    const initialPlayers = players.map((p, index) => ({
      userId: p.userId,
      name: p.name,
      tokens: [0, 0, 0, 0],
      killCount: 0,
      color: room.tokenColors[index] ?? "red",
    }));

    const gameState = {
      players: initialPlayers,
      currentPlayerIndex: 0,
      diceValue: 0,
      winnerId: null,
      cuttingTokenKey: null,
      sixStreak: 0,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(room._id, {
      status: "playing",
      startedAt: Date.now(),
      turnUserId: players[0].userId,
      currentDice: 0,
      gameState,
    });

    return true;
  },
});

// ROLL DICE
export const rollDiceOnline = mutation({
  args: {
    code: v.string(),
    userId: v.string(),
  },

  handler: async (ctx, args) => {
    const roomCode = args.code.trim().toUpperCase();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", roomCode))
      .first();

    if (!room) throw new Error("Room not found");
    if (room.status !== "playing") throw new Error("Game not playing");
    if (!room.gameState) throw new Error("Game state missing");

    const state = room.gameState;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) throw new Error("Current player not found");

    if (currentPlayer.userId !== args.userId) {
      throw new Error("Not your turn");
    }

    if (state.diceValue !== 0) {
      throw new Error("Dice already rolled");
    }

    const dice = Math.floor(Math.random() * 6) + 1;

    let sixStreak = state.sixStreak ?? 0;
    if (dice === 6) sixStreak++;
    else sixStreak = 0;

    if (sixStreak >= 3) {
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;

      await ctx.db.patch(room._id, {
        gameState: {
          ...state,
          diceValue: 0,
          currentPlayerIndex: nextIndex,
          sixStreak: 0,
          updatedAt: Date.now(),
        },
        turnUserId: state.players[nextIndex].userId,
        currentDice: 0,
      });

      return { dice: 0, skipped: true };
    }

    await ctx.db.patch(room._id, {
      gameState: {
        ...state,
        diceValue: dice,
        sixStreak,
        updatedAt: Date.now(),
      },
      currentDice: dice,
    });

    return { dice };
  },
});

// MOVE TOKEN
export const moveTokenOnline = mutation({
  args: {
    code: v.string(),
    userId: v.string(),
    tokenIndex: v.number(),
  },

  handler: async (ctx, args) => {
    const roomCode = args.code.trim().toUpperCase();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", roomCode))
      .first();

    if (!room) throw new Error("Room not found");
    if (room.status !== "playing") throw new Error("Game not playing");
    if (!room.gameState) throw new Error("Game state missing");

    const state = room.gameState;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) throw new Error("Current player not found");

    if (currentPlayer.userId !== args.userId) {
      throw new Error("Not your turn");
    }

    const diceValue = state.diceValue;
    if (!diceValue || diceValue <= 0) {
      throw new Error("Roll dice first");
    }

    const tokenPos = currentPlayer.tokens[args.tokenIndex];
    if (tokenPos === undefined) throw new Error("Invalid token");

    const steps = moveTokenSteps(state.currentPlayerIndex, tokenPos, diceValue);

    if (steps.length === 0) {
      throw new Error("Invalid move");
    }

    const finalPos = steps[steps.length - 1];

    const newPlayers = [...state.players];
    const updatedPlayer = { ...currentPlayer };
    const newTokens = [...updatedPlayer.tokens];

    newTokens[args.tokenIndex] = finalPos;
    updatedPlayer.tokens = newTokens;

    newPlayers[state.currentPlayerIndex] = updatedPlayer;

    const cuts = findCutTokens(newPlayers, state.currentPlayerIndex, finalPos);

    let cuttingTokenKey: string | null = null;

    for (const cut of cuts) {
      cuttingTokenKey = `${cut.playerIndex}-${cut.tokenIndex}`;

      const cutPlayer = { ...newPlayers[cut.playerIndex] };
      const cutTokens = [...cutPlayer.tokens];

      cutTokens[cut.tokenIndex] = 0;

      cutPlayer.tokens = cutTokens;
      newPlayers[cut.playerIndex] = cutPlayer;
    }

    const neededToWin = room.mode === "quick" ? 2 : 4;

    const victoryCount = updatedPlayer.tokens.filter(
      (p: number) => p >= 100 && p % 100 === 6
    ).length;

    let winnerId: string | null = state.winnerId ?? null;

    if (victoryCount >= neededToWin) {
      winnerId = updatedPlayer.userId;
    }

    let nextPlayerIndex = state.currentPlayerIndex;

    if (diceValue !== 6 && cuts.length === 0) {
      nextPlayerIndex = (state.currentPlayerIndex + 1) % newPlayers.length;
    }

    await ctx.db.patch(room._id, {
      gameState: {
        ...state,
        players: newPlayers,
        diceValue: 0,
        currentPlayerIndex: nextPlayerIndex,
        winnerId,
        cuttingTokenKey,
        updatedAt: Date.now(),
      },
      turnUserId: newPlayers[nextPlayerIndex].userId,
      currentDice: 0,
    });

    return true;
  },
});

// AUTO ABANDON
export const abandonRoomIfExpired = mutation({
  args: { code: v.string() },

  handler: async (ctx, args) => {
    const roomCode = args.code.trim().toUpperCase();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", roomCode))
      .first();

    if (!room) return false;
    if (room.status !== "waiting") return false;

    const expired = Date.now() - room.createdAt > 15 * 60 * 1000;
    if (!expired) return false;

    await ctx.db.patch(room._id, {
      status: "abandoned",
      endedAt: Date.now(),
    });

    return true;
  },
});
