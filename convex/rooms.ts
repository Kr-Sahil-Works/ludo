import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateRoomCode() {
  const chars = "123456789";
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
    playersCount: v.number(), // 2 | 3 | 4
    entryCoins: v.number(),

    tokenColors: v.array(v.string()), // ✅ NEW

    maxPlayers: v.number(),
  },

  handler: async (ctx, args) => {
    let code = generateRoomCode();

    // ensure unique code
    while (true) {
      const existing = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (!existing) break;
      code = generateRoomCode();
    }

    const roomId = await ctx.db.insert("rooms", {
      code,
      hostId: args.hostId,
      status: "waiting",

      mode: args.mode,
      playersCount: args.playersCount,
      entryCoins: args.entryCoins,

      tokenColors: args.tokenColors, // ✅ SAVE COLORS

      maxPlayers: args.maxPlayers,
      createdAt: Date.now(),
    });

    await ctx.db.insert("roomPlayers", {
      roomId,
      userId: args.hostId,
      name: args.hostName,
      joinedAt: Date.now(),
    });

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
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!room) throw new Error("Room not found");
    if (room.status !== "waiting") throw new Error("Game already started");

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
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();

    if (!room) return null;

    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    const hostUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", room.hostId))
      .unique();

    // ✅ fetch user profiles for joined players
    const playerUsers = await Promise.all(
      players.map(async (p) => {
        const u = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", p.userId))
          .unique();

        return {
          userId: p.userId,
          name: u?.name || p.name,
          imageUrl:
            u?.imageUrl ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };
      })
    );

    return {
      room,
      players,
      hostUser,
      playerUsers, // ✅ NEW
    };
  },
});


// START GAME
export const startGame = mutation({
  args: { code: v.string(), userId: v.string() },

  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!room) throw new Error("Room not found");
    if (room.hostId !== args.userId) throw new Error("Only host can start");

    await ctx.db.patch(room._id, { status: "playing" });

    return true;
  },
});
