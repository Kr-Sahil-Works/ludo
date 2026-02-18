import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import NetInfo from "@react-native-community/netinfo";

import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { setUserData, resetUser } from "@/src/redux/userSlice";
import { setConnection, setSignedIn } from "@/src/redux/appSlice";
import type { RootState } from "@/src/redux/store";

export default function AuthSync() {
  const dispatch = useDispatch();

  const { isLoaded, isSignedIn, user } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  const isConnected = useSelector((state: RootState) => state.app.isConnected);

  // 🔥 Detect Internet
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const connected = !!state.isConnected && !!state.isInternetReachable;
      dispatch(setConnection(connected));
    });

    return () => unsub();
  }, []);

  // 🔥 Track signed in globally
  useEffect(() => {
    dispatch(setSignedIn(!!isSignedIn));
  }, [isSignedIn]);

  // only query convex if onlineReady
  const dbUser = useQuery(
    api.users.getUser,
    isSignedIn && user?.id && isConnected ? { clerkId: user.id } : "skip"
  );

  // ✅ Sync user to Convex ONLY when online + signed in
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user || !isConnected) {
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
  }, [isLoaded, isSignedIn, user?.id, isConnected]);

  // ✅ Load Convex user into Redux
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !isConnected) {
      dispatch(resetUser());
      return;
    }

    if (!dbUser) return;

    dispatch(
      setUserData({
        clerkId: dbUser.clerkId,
        username: dbUser.username,
        name: dbUser.name,
        email: dbUser.email,
        coins: dbUser.coins,
        gems: dbUser.gems,
        level: dbUser.level,
        imageUrl: dbUser.imageUrl,
      })
    );
  }, [dbUser, isLoaded, isSignedIn, isConnected]);

  return null;
}
