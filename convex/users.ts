import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
      .first();

    // ✅ update existing user
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

    // ✅ insert new user
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

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});


export const addCoins = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      coins: user.coins + args.amount,
      updatedAt: Date.now(),
    });

    return { coins: user.coins + args.amount };
  },
});