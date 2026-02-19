import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),

    username: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),

    // economy
    coins: v.number(),
    gems: v.number(),
    level: v.number(),

    // stats
    matchesPlayed: v.number(),
    matchesWon: v.number(),
    matchesLost: v.number(),

    winStreak: v.number(),
    highestWinStreak: v.number(),

    tokensCut: v.number(),
    timesCut: v.number(),
    sixCount: v.number(),

    rankPoints: v.number(),
    likes: v.number(),
    vipLevel: v.number(),

    lastOnline: v.number(),

    // cosmetics
    avatarId: v.string(),
    frameId: v.string(),
    emotePackId: v.string(),
    diceSkinId: v.string(),
    boardSkinId: v.string(),

    updatedAt: v.number(),
    accountCreatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  rooms: defineTable({
    code: v.string(),
    hostId: v.string(),

   status: v.union(
  v.literal("waiting"),
  v.literal("playing"),
  v.literal("ended"),
  v.literal("abandoned")
)
,

    maxPlayers: v.number(),
    playersCount: v.number(),

    entryCoins: v.number(),
    mode: v.union(v.literal("classic"), v.literal("quick")),

    isPrivate: v.optional(v.boolean()),
minPlayersToStart: v.optional(v.number()),


    tokenColors: v.array(v.string()),

    // game state
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    winnerId: v.optional(v.string()),

    turnUserId: v.optional(v.string()),
    currentDice: v.optional(v.number()),

    gameState: v.optional(v.any()),

    createdAt: v.number(),
  }).index("by_code", ["code"]),

 roomPlayers: defineTable({
  roomId: v.id("rooms"),
  userId: v.string(),
  name: v.string(),
  joinedAt: v.number(),
})
  .index("by_room", ["roomId"])
  .index("by_user", ["userId"]),


  // finished match history
  matches: defineTable({
    roomCode: v.string(),
    mode: v.union(v.literal("classic"), v.literal("quick")),
    entryCoins: v.number(),

    startedAt: v.number(),
    endedAt: v.number(),

    maxPlayers: v.number(),
    playersCount: v.number(),

    winnerId: v.optional(v.string()),

    // full game replay snapshot (optional but useful)
    gameState: v.optional(v.any()),
  }).index("by_roomCode", ["roomCode"]),

  matchPlayers: defineTable({
    matchId: v.id("matches"),
    userId: v.string(),

    name: v.string(),
    imageUrl: v.string(),

    tokenColor: v.string(),

    sixCount: v.number(),
    tokensCut: v.number(),
    timesCut: v.number(),

    rankPointsEarned: v.number(),

    result: v.string(), // "win" | "lose"
  })
    .index("by_match", ["matchId"])
    .index("by_user", ["userId"]),
});
