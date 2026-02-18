import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Insert user if not exists.
 * If exists, update only provided values.
 */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),

    username: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),

    coins: v.optional(v.number()),
    gems: v.optional(v.number()),
    level: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    // ✅ Update existing user
    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username ?? existing.username,
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,

        coins: args.coins ?? existing.coins,
        gems: args.gems ?? existing.gems,
        level: args.level ?? existing.level,

        updatedAt: Date.now(),
      });

      return existing._id;
    }

    // ✅ Insert new user
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username ?? "",
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,

      coins: args.coins ?? 12000,
      gems: args.gems ?? 199,
      level: args.level ?? 1,

      updatedAt: Date.now(),
    });
  },
});

/**
 * Get user by clerkId
 */
export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * Add coins to user
 */
export const addCoins = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
  },

  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const newCoins = user.coins + args.amount;

    await ctx.db.patch(user._id, {
      coins: newCoins,
      updatedAt: Date.now(),
    });

    return { coins: newCoins };
  },
});

/**
 * Add gems to user
 */
export const addGems = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
  },

  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const newGems = user.gems + args.amount;

    await ctx.db.patch(user._id, {
      gems: newGems,
      updatedAt: Date.now(),
    });

    return { gems: newGems };
  },
});

/**
 * Update level
 */
export const setLevel = mutation({
  args: {
    clerkId: v.string(),
    level: v.number(),
  },

  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      level: args.level,
      updatedAt: Date.now(),
    });

    return { level: args.level };
  },
});
