import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  Vibration,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { playFX } from "@/src/utils/sound";

import { useUser } from "@clerk/clerk-expo";

const BackIcon = require("@/src/assets/images/back.png");

// coin icons
const Coin100 = require("@/src/assets/images/header/coins/coins100.png");
const Coin300 = require("@/src/assets/images/header/coins/coins300.png");
const Coin500 = require("@/src/assets/images/header/coins/coins500.png");
const Coin1000 = require("@/src/assets/images/header/coins/coins1k.png");
const Coin2500 = require("@/src/assets/images/header/coins/coins2.5k.png");
const Coin5000 = require("@/src/assets/images/header/coins/coins5k.png");

const CoinBag10k = require("@/src/assets/images/header/coins/coinbag10k.png");
const CoinBag25k = require("@/src/assets/images/header/coins/coinbag25k.png");
const CoinBag50k = require("@/src/assets/images/header/coins/coinbag50k.png");
const LockIcon = require("@/src/assets/images/header/coins/lock.png");

const ENTRY_LIST = [100, 300, 500, 1000, 2500, 5000, 10000, 25000, 50000];

export default function OnlineRoomScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { user, isLoaded } = useUser();

  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [entryIndex, setEntryIndex] = useState(0);
  const entryCoins = ENTRY_LIST[entryIndex];

  const isLocked = entryCoins > 5000;
  const isHighLobby = entryCoins >= 10000;

  const joinRoom = useMutation(api.rooms.joinRoom);

  // ✅ RECONNECT QUERY
  const activeRoom = useQuery(
    api.rooms.getMyActiveRoom,
    user?.id ? { userId: user.id } : "skip"
  );

  const reconnectDoneRef = useRef(false);

  // scale helper
  const s = (val: number) => {
    const base = 390;
    const scale = width / base;
    return Math.round(val * Math.min(Math.max(scale, 0.85), 1.4));
  };

  // animations
  const glowAnim = useRef(new Animated.Value(0)).current;
  const coinScale = useRef(new Animated.Value(1)).current;
  const coinFade = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(-200)).current;

  // toast + shake
  const [errorToast, setErrorToast] = useState("");
  const toastAnim = useRef(new Animated.Value(-120)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => {
    const panelWidth = Math.min(width * 0.9, isTablet ? 520 : 420);

    return StyleSheet.create({
      shine: {
        position: "absolute",
        top: -s(50),
        left: 0,
        width: s(140),
        height: s(260),
        opacity: 0.7,
      },

      container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      },

      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.6)",
      },

      backBtn: {
        position: "absolute",
        left: s(14),
        bottom: s(18),
        zIndex: 999,
        width: s(75),
        height: s(75),
        justifyContent: "center",
        alignItems: "center",
      },

      backIcon: {
        width: s(62),
        height: s(62),
        resizeMode: "contain",
      },

      panel: {
        width: panelWidth,
        backgroundColor: "#7b0c0c",
        borderRadius: s(18),
        borderWidth: s(4),
        borderColor: "#e8ae02",
        paddingBottom: s(22),
        shadowColor: "#f4c400",
        shadowRadius: s(20),
        elevation: 20,
      },

      tabWrapper: {
        flexDirection: "row",
        width: "88%",
        alignSelf: "center",
        marginTop: -s(22),
        borderWidth: s(4),
        borderColor: "#e8ae02",
        borderRadius: s(18),
        overflow: "hidden",
        backgroundColor: "#5e0909",
        elevation: 15,
      },

      tabHalf: {
        flex: 1,
        paddingVertical: s(12),
        justifyContent: "center",
        alignItems: "center",
      },

      tabDivider: {
        width: s(3),
        backgroundColor: "#f4c400",
      },

      tabHalfActive: {
        backgroundColor: "#a31111",
      },

      tabText: {
        fontSize: s(18),
        fontWeight: "900",
        color: "#ffd24a",
        textTransform: "uppercase",
      },

      tabTextActive: {
        color: "#fff3b0",
      },

      body: {
        paddingTop: s(32),
        paddingHorizontal: s(18),
        alignItems: "center",
      },

      title: {
        fontSize: s(22),
        fontWeight: "900",
        color: "#ffd24a",
        textTransform: "uppercase",
        marginBottom: s(18),
        textAlign: "center",
      },

      inputBox: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: s(12),
        borderWidth: s(3),
        borderColor: "#c4eaf2",
        paddingHorizontal: s(12),
        paddingVertical: s(12),
        marginBottom: s(18),
      },

      input: {
        fontSize: s(16),
        fontWeight: "800",
        color: "#333",
        letterSpacing: 2,
        textAlign: "center",
      },

      lockMessage: {
        marginTop: s(12),
        fontSize: s(13),
        fontWeight: "900",
        color: "#ffd24a",
        textAlign: "center",
        textTransform: "uppercase",
      },

      entryBox: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: s(20),
      },

      circleBtn: {
        width: s(58),
        height: s(58),
        borderRadius: s(14),
        borderWidth: s(3),
        borderColor: "#ffd24a",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#5e0909",
      },

      circleText: {
        fontSize: s(30),
        fontWeight: "900",
        color: "#fff",
      },

      entryCardOuter: {
        flex: 1,
        marginHorizontal: s(12),
        borderRadius: s(18),
        borderWidth: s(5),
        borderColor: "#ffb900",
        backgroundColor: "#f0c100",
        overflow: "hidden",
        elevation: 12,
        minHeight: s(165),
      },

      lockedCard: {
        opacity: 0.55,
      },

      entryCardInner: {
        height: s(125),
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      },

      coinRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "92%",
      },

      coinIconNormal: {
        width: s(52),
        height: s(52),
      },

      coinIconHigh: {
        width: s(82),
        height: s(82),
      },

      amountBox: {
        backgroundColor: "#1d1710ac",
        paddingHorizontal: s(6),
        paddingVertical: s(4),
        borderRadius: s(14),
        borderWidth: s(1),
        borderColor: "rgba(255,255,255,0.25)",
        marginLeft: s(10),
        minWidth: s(70),
        alignItems: "center",
      },

      amountBoxBig: {
        paddingHorizontal: s(5),
        paddingVertical: s(2),
        borderRadius: s(18),
        borderWidth: s(1),
        minWidth: s(60),
        alignItems: "center",
        marginLeft: s(-10),
      },

      coinValueNormal: {
        fontSize: s(26),
      },

      coinValueHigh: {
        fontSize: s(24),
      },

      coinValue: {
        fontWeight: "900",
        color: "#fff",
        textShadowColor: "#000",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
      },

      lockedText: {
        opacity: 0.6,
      },

      lockCenterBig: {
        position: "absolute",
        width: s(92),
        height: s(92),
        opacity: 0.95,
        alignSelf: "center",
      },

      lockIconSmall: {
        position: "absolute",
        right: s(10),
        top: s(10),
        width: s(32),
        height: s(32),
        opacity: 0.9,
      },

      entryBottom: {
        backgroundColor: "#ffb900",
        paddingVertical: s(14),
        alignItems: "center",
        justifyContent: "center",
      },

      entryText: {
        fontSize: s(18),
        fontWeight: "900",
        color: "#fff",
        textTransform: "uppercase",
      },

      mainBtn: {
        width: "100%",
        borderRadius: s(18),
        overflow: "hidden",
        borderWidth: s(4),
        borderColor: "#e8ae02",
      },

      btnGradient: {
        paddingVertical: s(14),
        alignItems: "center",
      },

      mainBtnText: {
        fontSize: s(20),
        fontWeight: "900",
        color: "#ffffff",
        textTransform: "uppercase",
      },

      reconnectText: {
        marginTop: s(14),
        fontSize: s(13),
        fontWeight: "900",
        color: "#ffd24a",
        textAlign: "center",
        textTransform: "uppercase",
      },
    });
  }, [width]);

  // ✅ AUTO RECONNECT EFFECT
  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) return;

    // convex still loading
    if (activeRoom === undefined) return;

    // prevent multiple router pushes
    if (reconnectDoneRef.current) return;

    if (activeRoom?.code) {
      reconnectDoneRef.current = true;

      // waiting -> lobby
      if (activeRoom.status === "waiting") {
        router.replace({
          pathname: "/pages_modals/online/room/[code]",
          params: { code: activeRoom.code },
        });
        return;
      }

      // playing -> game
      if (activeRoom.status === "playing") {
        router.replace({
          pathname: "/pages_modals/online/game/[code]",
          params: { code: activeRoom.code },
        });
        return;
      }
    }
  }, [activeRoom, isLoaded, user?.id]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 300,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(shineAnim, {
          toValue: -200,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, []);

  const animateCoinChange = () => {
    coinScale.setValue(0.85);
    coinFade.setValue(0.3);

    Animated.parallel([
      Animated.timing(coinScale, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(coinFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getCoinIcon = () => {
    if (entryCoins === 100) return Coin100;
    if (entryCoins === 300) return Coin300;
    if (entryCoins === 500) return Coin500;
    if (entryCoins === 1000) return Coin1000;
    if (entryCoins === 2500) return Coin2500;
    if (entryCoins === 5000) return Coin5000;
    if (entryCoins === 10000) return CoinBag10k;
    if (entryCoins === 25000) return CoinBag25k;
    if (entryCoins === 50000) return CoinBag50k;
    return Coin100;
  };

  const handleMinus = () => {
    Vibration.vibrate(20);

    setEntryIndex((prev) => {
      const newIndex = Math.max(0, prev - 1);
      if (newIndex !== prev) animateCoinChange();
      return newIndex;
    });
  };

  const handlePlus = () => {
    Vibration.vibrate(20);

    setEntryIndex((prev) => {
      const newIndex = Math.min(ENTRY_LIST.length - 1, prev + 1);
      if (newIndex !== prev) animateCoinChange();
      return newIndex;
    });
  };

  const showTopToast = (msg: string) => {
    setErrorToast(msg);

    toastAnim.setValue(-120);

    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setErrorToast("");
      });
    }, 2000);
  };

  const shakeInput = () => {
    shakeAnim.setValue(0);

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleJoin = async () => {
    try {
      if (!user?.id) {
        showTopToast("LOGIN REQUIRED!");
        return;
      }

      const trimmed = code.trim().toUpperCase();

      if (!trimmed) {
        showTopToast("ENTER ROOM CODE!");
        shakeInput();
        return;
      }

      if (trimmed.length < 6) {
        showTopToast("MIN 6 DIGIT CODE REQUIRED!");
        shakeInput();
        return;
      }

      setLoading(true);

      const userId = user.id;
      const userName =
        user.fullName ||
        user.username ||
        user.primaryEmailAddress?.emailAddress ||
        "Player";

      await joinRoom({
        code: trimmed,
        userId,
        name: userName,
      });

      router.push({
        pathname: "/pages_modals/online/room/[code]",
        params: { code: trimmed },
      });
    } catch (err: any) {
      console.log("JOIN ROOM ERROR:", err?.message);

      const msg = String(err?.message || "");

      shakeInput();

      if (msg.toLowerCase().includes("room not found")) {
        showTopToast("NO SUCH ROOM EXISTS!");
      } else if (msg.toLowerCase().includes("expired")) {
        showTopToast("ROOM EXPIRED!");
      } else if (msg.toLowerCase().includes("full")) {
        showTopToast("ROOM IS FULL!");
      } else {
        showTopToast("JOIN FAILED!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoSelectMode = () => {
    if (isLocked) return;

    router.push({
      pathname: "/pages_modals/online/selectMode",
      params: { entryCoins: String(entryCoins) },
    });
  };

  // wait for clerk load
  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#ffd24a" />
        <Text style={{ marginTop: 10, color: "#fff", fontWeight: "900" }}>
          Loading user...
        </Text>
      </View>
    );
  }

  // show reconnect loader
  if (user?.id && activeRoom === undefined) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#ffd24a" />
        <Text style={{ marginTop: 10, color: "#fff", fontWeight: "900" }}>
          Checking active match...
        </Text>
      </View>
    );
  }

  const disableMinus = entryIndex === 0;
  const disablePlus = entryIndex === ENTRY_LIST.length - 1;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.overlay} />

        {/* TOP ERROR TOAST */}
        {errorToast ? (
          <Animated.View
            style={{
              position: "absolute",
              top: s(70),
              alignSelf: "center",
              backgroundColor: "#000",
              borderWidth: s(3),
              borderColor: "#ffd24a",
              paddingHorizontal: s(22),
              paddingVertical: s(12),
              borderRadius: s(18),
              zIndex: 9999,
              transform: [{ translateY: toastAnim }],
            }}
          >
            <Text
              style={{
                fontSize: s(14),
                fontWeight: "900",
                color: "#ffd24a",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {errorToast}
            </Text>
          </Animated.View>
        ) : null}

        {/* BACK BUTTON */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Image source={BackIcon} style={styles.backIcon} />
        </Pressable>

        {/* MAIN PANEL */}
        <Animated.View
          style={[
            styles.panel,
            {
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.9],
              }),
            },
          ]}
        >
          {/* TOP TABS */}
          <View style={styles.tabWrapper}>
            <Pressable
              style={[
                styles.tabHalf,
                activeTab === "create" && styles.tabHalfActive,
              ]}
              onPress={() => setActiveTab("create")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "create" && styles.tabTextActive,
                ]}
              >
                CREATE
              </Text>
            </Pressable>

            <View style={styles.tabDivider} />

            <Pressable
              style={[
                styles.tabHalf,
                activeTab === "join" && styles.tabHalfActive,
              ]}
              onPress={() => setActiveTab("join")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "join" && styles.tabTextActive,
                ]}
              >
                JOIN
              </Text>
            </Pressable>
          </View>

          {/* BODY */}
          <View style={styles.body}>
            {activeTab === "join" ? (
              <>
                <Text style={styles.title}>ENTER PRIVATE CODE</Text>

                <Animated.View
                  style={[
                    styles.inputBox,
                    {
                      transform: [{ translateX: shakeAnim }],
                    },
                  ]}
                >
                  <TextInput
                    placeholder="Enter private code here..."
                    placeholderTextColor="#bdbdbd"
                    value={code}
                    onChangeText={setCode}
                    style={styles.input}
                    maxLength={6}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    returnKeyType="done"
                  />
                </Animated.View>

               <Pressable
  style={[
    styles.mainBtn,
    (loading || !!activeRoom?.code) && { opacity: 0.6 },
  ]}
  onPress={handleJoin}
  disabled={loading || !!activeRoom?.code}
>

                  <LinearGradient
                    colors={["#1ed6d6", "#025c5c"]}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.mainBtnText}>
                      {loading ? "Joining..." : "Join Room"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.title}>SELECT LOBBY</Text>

                {/* ENTRY BOX */}
                <View style={styles.entryBox}>
                  {/* MINUS */}
                  <Pressable
                    style={[
                      styles.circleBtn,
                      disableMinus && { opacity: 0.4 },
                    ]}
                    disabled={disableMinus}
                    onPress={() => {
                      if (!disableMinus) {
                        playFX("coins_sound");
                        handleMinus();
                      }
                    }}
                  >
                    <Text style={styles.circleText}>-</Text>
                  </Pressable>

                  <View
                    style={[
                      styles.entryCardOuter,
                      isLocked && styles.lockedCard,
                    ]}
                  >
                    <LinearGradient
                      colors={["#a43d01", "#181814", "#782704"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.entryCardInner}
                    >
                      {/* SHINE */}
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.shine,
                          {
                            transform: [
                              { translateX: shineAnim },
                              { rotate: "-20deg" },
                            ],
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={[
                            "rgba(255,255,255,0)",
                            "rgba(255,255,255,0.55)",
                            "rgba(255,255,255,0)",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFillObject}
                        />
                      </Animated.View>

                      {/* COIN CONTENT */}
                      <Animated.View
                        style={[
                          styles.coinRow,
                          {
                            opacity: coinFade,
                            transform: [{ scale: coinScale }],
                          },
                        ]}
                      >
                        <Image
                          source={getCoinIcon()}
                          style={
                            isHighLobby
                              ? styles.coinIconHigh
                              : styles.coinIconNormal
                          }
                          resizeMode="contain"
                        />

                        <View
                          style={[
                            styles.amountBox,
                            isHighLobby && styles.amountBoxBig,
                          ]}
                        >
                          <Text
                            style={[
                              styles.coinValue,
                              isHighLobby
                                ? styles.coinValueHigh
                                : styles.coinValueNormal,
                              isLocked && styles.lockedText,
                            ]}
                          >
                            {entryCoins}
                          </Text>
                        </View>
                      </Animated.View>

                      {/* LOCK */}
                      {isLocked && isHighLobby && (
                        <Image
                          source={LockIcon}
                          style={styles.lockCenterBig}
                          resizeMode="contain"
                        />
                      )}

                      {isLocked && !isHighLobby && (
                        <Image
                          source={LockIcon}
                          style={styles.lockIconSmall}
                          resizeMode="contain"
                        />
                      )}
                    </LinearGradient>

                    <View style={styles.entryBottom}>
                      <Text style={styles.entryText}>ENTRY</Text>
                    </View>
                  </View>

                  {/* PLUS */}
                  <Pressable
                    style={[
                      styles.circleBtn,
                      disablePlus && { opacity: 0.4 },
                    ]}
                    disabled={disablePlus}
                    onPress={() => {
                      if (!disablePlus) {
                        playFX("coins_sound");
                        handlePlus();
                      }
                    }}
                  >
                    <Text style={styles.circleText}>+</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={[
                    styles.mainBtn,
                    (loading || isLocked) && { opacity: 0.6 },
                  ]}
                  onPress={handleGoSelectMode}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#9fd21d", "#605505"]}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.mainBtnText}>
                      {isLocked ? "Locked" : "Next"}
                    </Text>
                  </LinearGradient>
                </Pressable>

                {isLocked && (
                  <Text style={styles.lockMessage}>
                    Reach Level 10 to unlock this lobby
                  </Text>
                )}
              </>
            )}

            {/* INFO */}
         {activeRoom?.code ? (
  <Text style={styles.reconnectText}>
    ACTIVE MATCH FOUND... RECONNECTING...
  </Text>
) : null}
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
