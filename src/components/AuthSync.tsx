import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { setUserData, resetUser } from "@/src/redux/userSlice";

export default function AuthSync() {
  const dispatch = useDispatch();

  const { isLoaded, isSignedIn, user } = useUser();

  const upsertUser = useMutation(api.users.upsertUser);

  const dbUser = useQuery(
    api.users.getUser,
    isSignedIn && user?.id ? { clerkId: user.id } : "skip"
  );

  // ✅ Create/update user in Convex
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      dispatch(resetUser());
      return;
    }

    (async () => {
      try {
        await upsertUser({
          clerkId: user.id,
          username: user.username || "player",
          name: user.fullName || "Player",
          email: user.primaryEmailAddress?.emailAddress || "",
          imageUrl: user.imageUrl || "",
        });
      } catch (err) {
        console.log("UPSERT USER ERROR:", err);
      }
    })();
  }, [isLoaded, isSignedIn, user?.id]);

  // ✅ Load Convex user into Redux
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      dispatch(resetUser());
      return;
    }

    if (!dbUser) return;

    dispatch(
      setUserData({
        username: dbUser.username,
        coins: dbUser.coins,
        gems: dbUser.gems,
        level: dbUser.level,
        imageUrl: dbUser.imageUrl,
      })
    );
  }, [dbUser, isLoaded, isSignedIn]);

  return null;
}
