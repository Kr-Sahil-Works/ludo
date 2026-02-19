import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),

    username: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),

    // economy
    coins: v.optional(v.number()),
    gems: v.optional(v.number()),
    level: v.optional(v.number()),

    // stats (optional updates)
    matchesPlayed: v.optional(v.number()),
    matchesWon: v.optional(v.number()),
    matchesLost: v.optional(v.number()),

    winStreak: v.optional(v.number()),
    highestWinStreak: v.optional(v.number()),

    tokensCut: v.optional(v.number()),
    timesCut: v.optional(v.number()),
    sixCount: v.optional(v.number()),

    rankPoints: v.optional(v.number()),
    likes: v.optional(v.number()),
    vipLevel: v.optional(v.number()),

    lastOnline: v.optional(v.number()),

    // cosmetics
    avatarId: v.optional(v.string()),
    frameId: v.optional(v.string()),
    emotePackId: v.optional(v.string()),
    diceSkinId: v.optional(v.string()),
    boardSkinId: v.optional(v.string()),

    accountCreatedAt: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    // ✅ UPDATE USER
    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username ?? existing.username,
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,

        coins: args.coins ?? existing.coins,
        gems: args.gems ?? existing.gems,
        level: args.level ?? existing.level,

        matchesPlayed: args.matchesPlayed ?? existing.matchesPlayed,
        matchesWon: args.matchesWon ?? existing.matchesWon,
        matchesLost: args.matchesLost ?? existing.matchesLost,

        winStreak: args.winStreak ?? existing.winStreak,
        highestWinStreak: args.highestWinStreak ?? existing.highestWinStreak,

        tokensCut: args.tokensCut ?? existing.tokensCut,
        timesCut: args.timesCut ?? existing.timesCut,
        sixCount: args.sixCount ?? existing.sixCount,

        rankPoints: args.rankPoints ?? existing.rankPoints,
        likes: args.likes ?? existing.likes,
        vipLevel: args.vipLevel ?? existing.vipLevel,

        lastOnline: Date.now(),

        avatarId: args.avatarId ?? existing.avatarId,
        frameId: args.frameId ?? existing.frameId,
        emotePackId: args.emotePackId ?? existing.emotePackId,
        diceSkinId: args.diceSkinId ?? existing.diceSkinId,
        boardSkinId: args.boardSkinId ?? existing.boardSkinId,

        // ✅ NEVER RESET THIS
        accountCreatedAt: existing.accountCreatedAt ?? Date.now(),

        updatedAt: Date.now(),
      });

      return existing._id;
    }

    // ✅ CREATE USER
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,

      // ✅ IMPORTANT: keep username EMPTY so player can set it once
      username: args.username ?? "",
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,

      coins: args.coins ?? 12000,
      gems: args.gems ?? 199,
      level: args.level ?? 1,

      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,

      winStreak: 0,
      highestWinStreak: 0,

      tokensCut: 0,
      timesCut: 0,
      sixCount: 0,

      rankPoints: 0,
      likes: 0,
      vipLevel: 0,

      lastOnline: Date.now(),

      avatarId: args.avatarId ?? "1",
      frameId: args.frameId ?? "default",
      emotePackId: args.emotePackId ?? "basic",
      diceSkinId: args.diceSkinId ?? "default",
      boardSkinId: args.boardSkinId ?? "default",

      updatedAt: Date.now(),

      // ✅ created time stored once
      accountCreatedAt: args.accountCreatedAt ?? Date.now(),
    });
  },
});

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (args.clerkId === "guest") return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
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
