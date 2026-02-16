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
});
