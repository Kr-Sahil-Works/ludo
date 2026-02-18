import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),

    username: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),

    coins: v.number(),
    gems: v.number(),
    level: v.number(),

    updatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  rooms: defineTable({
  code: v.string(),
  hostId: v.string(),
  status: v.string(),
  maxPlayers: v.number(),

  entryCoins: v.optional(v.number()),
  mode: v.optional(v.union(v.literal("classic"), v.literal("quick"))),
  playersCount: v.optional(v.number()),
  tokenColors: v.optional(v.array(v.string())),


  createdAt: v.number(),
}).index("by_code", ["code"]),


  roomPlayers: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(),
    name: v.string(),
    joinedAt: v.number(),
  }).index("by_room", ["roomId"]),
});
