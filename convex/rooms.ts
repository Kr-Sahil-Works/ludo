import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { moveTokenSteps, findCutTokens, getVictoryIdByColor } from "./gameLogic/moveLogic";

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

// JOIN ROOM (ALSO SUPPORTS RECONNECT)
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

    // cannot join ended/abandoned rooms
    if (room.status === "abandoned" || room.status === "ended") {
      throw new Error("Room ended");
    }

    // expiry ONLY for waiting rooms
    if (room.status === "waiting") {
      const expired = Date.now() - room.createdAt > 15 * 60 * 1000;

      if (expired) {
        await ctx.db.patch(room._id, {
          status: "abandoned",
          endedAt: Date.now(),
        });

        throw new Error("Room expired");
      }
    }

    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    // if already joined, just return roomId (reconnect)
    const alreadyJoined = players.find((p) => p.userId === args.userId);
    if (alreadyJoined) {
      return { roomId: room._id };
    }

    // ✅ IMPORTANT FIX: FULL CHECK SHOULD USE playersCount (NOT maxPlayers)
    const limit = room.playersCount || room.maxPlayers;

    if (players.length >= limit) {
      throw new Error("Room is full");
    }

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

    // only host can start
    if (room.hostId !== args.userId) {
      throw new Error("Only host can start");
    }

    // ended/abandoned rooms cannot start
    if (room.status === "ended" || room.status === "abandoned") {
      throw new Error("Room ended");
    }

    // already started -> return safely
    if (room.status === "playing" && room.gameState) {
      return true;
    }

    if (room.status !== "waiting") {
      return true;
    }

    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    players.sort((a, b) => a.joinedAt - b.joinedAt);

    // ✅ IMPORTANT FIX: playersCount is required count
    const neededPlayers = room.playersCount || room.maxPlayers;

    if (players.length < neededPlayers) {
      throw new Error("Not enough players");
    }

    const selectedPlayers = players.slice(0, neededPlayers);

const usedColors = room.tokenColors.slice(0, neededPlayers);

const initialPlayers = selectedPlayers.map((p, index) => ({
  userId: p.userId,
  name: p.name,
  tokens: [0, 0, 0, 0],
  killCount: 0,
  color: usedColors[index],
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
      turnUserId: selectedPlayers[0].userId,
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

    if (!room || !room.gameState)
      throw new Error("Room invalid");

    const state = room.gameState;

    const currentIndex = state.currentPlayerIndex;
    const currentPlayer = state.players[currentIndex];

    if (currentPlayer.userId !== args.userId)
      throw new Error("Not your turn");

    if (state.diceValue !== 0)
      throw new Error("Dice already rolled");

    const dice = Math.floor(Math.random() * 6) + 1;

    let sixStreak = state.sixStreak ?? 0;
    sixStreak = dice === 6 ? sixStreak + 1 : 0;

    const nextIndex =
      (currentIndex + 1) % state.players.length;

    // 🔴 3 consecutive six → force pass
    if (sixStreak >= 3) {
      await ctx.db.patch(room._id, {
        gameState: {
          ...room.gameState,
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

    // 🔎 Check if any token can move
   const hasMove = currentPlayer.tokens.some((tokenPos: number) => {
  const steps = moveTokenSteps(currentPlayer, tokenPos, dice);
  return steps.length > 0;
});


    if (!hasMove) {
      await ctx.db.patch(room._id, {
        gameState: {
          ...room.gameState,
          diceValue: 0,
          currentPlayerIndex: nextIndex,
          sixStreak: 0,
          updatedAt: Date.now(),
        },
        turnUserId: state.players[nextIndex].userId,
        currentDice: 0,
      });

      return { dice, skipped: true };
    }

    // ✅ Normal roll
    await ctx.db.patch(room._id, {
      gameState: {
        ...room.gameState,
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

    const currentPlayerIndex = state.currentPlayerIndex;
    const currentPlayer = state.players[currentPlayerIndex];

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

    // ✅ COLOR BASED MOVEMENT
    const steps = moveTokenSteps(currentPlayer, tokenPos, diceValue);

    if (steps.length === 0) {
      throw new Error("Invalid move");
    }

    const finalPos = steps[steps.length - 1];

    const newPlayers = [...state.players];
    const updatedPlayer = { ...currentPlayer };
    const newTokens = [...updatedPlayer.tokens];

    newTokens[args.tokenIndex] = finalPos;
    updatedPlayer.tokens = newTokens;

    newPlayers[currentPlayerIndex] = updatedPlayer;

    // ✅ CUT LOGIC
    const cuts = findCutTokens(newPlayers, currentPlayerIndex, finalPos);

    let cuttingTokenKey: string | null = null;

    for (const cut of cuts) {
      cuttingTokenKey = `${cut.playerIndex}-${cut.tokenIndex}`;

      const cutPlayer = { ...newPlayers[cut.playerIndex] };
      const cutTokens = [...cutPlayer.tokens];

      cutTokens[cut.tokenIndex] = 0;

      cutPlayer.tokens = cutTokens;
      newPlayers[cut.playerIndex] = cutPlayer;
    }

    // ✅ WIN CHECK (COLOR BASED)
    const neededToWin = room.mode === "quick" ? 2 : 4;

    const victoryId = getVictoryIdByColor(currentPlayer.color);

    const victoryCount = updatedPlayer.tokens.filter(
      (p: number) => p === victoryId
    ).length;

    let winnerId: string | null = state.winnerId ?? null;

    if (victoryCount >= neededToWin) {
      winnerId = updatedPlayer.userId;
    }

    let nextPlayerIndex = currentPlayerIndex;

    // if no 6 and no cut → next player
    if (diceValue !== 6 && cuts.length === 0 && !winnerId) {
      nextPlayerIndex = (currentPlayerIndex + 1) % newPlayers.length;
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
      turnUserId: newPlayers[nextPlayerIndex]?.userId ?? null,
      currentDice: 0,
    });

    return true;
  },
});


// AUTO ABANDON (ONLY WAITING ROOMS)
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

// GET MY ACTIVE ROOM (RECONNECT FEATURE)
export const getMyActiveRoom = query({
  args: {
    userId: v.string(),
  },

  handler: async (ctx, args) => {
    const myRooms = await ctx.db
      .query("roomPlayers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (!myRooms.length) return null;

    // newest joined first
    myRooms.sort((a, b) => b.joinedAt - a.joinedAt);

    for (const rp of myRooms) {
      const room = await ctx.db.get(rp.roomId);
      if (!room) continue;

      // skip ended rooms
      if (room.status === "abandoned") continue;
      if (room.status === "ended") continue;

      // waiting lobby reconnect (only if not expired)
      if (room.status === "waiting") {
        const expired = Date.now() - room.createdAt > 15 * 60 * 1000;
        if (expired) continue;

        return {
          code: room.code,
          status: room.status,
          roomId: room._id,
        };
      }

      // playing reconnect (even if winner exists you can still view game)
    if (room.status === "playing" && room.gameState) {
        return {
          code: room.code,
          status: room.status,
          roomId: room._id,
        };
      }
    }

    return null;
  },
});
