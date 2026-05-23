import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  FlatList,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

/* =========================
   FLIP AVATAR COMPONENT
========================= */
const FlippingAvatar = ({
  avatar,
  username,
  onPick,
}: {
  avatar: string;
  username: string;
  onPick: () => void;
}) => {
  const rotate = useSharedValue(0);
  const flipped = useSharedValue(false);

  const flip = () => {
    flipped.value = !flipped.value;
    rotate.value = withTiming(flipped.value ? 180 : 0, {
      duration: 600,
    });
  };

  const frontStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${rotate.value}deg` }],
      opacity: interpolate(rotate.value, [0, 90, 180], [1, 0, 0]),
    };
  });

  const backStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${rotate.value + 180}deg` }],
      opacity: interpolate(rotate.value, [0, 90, 180], [0, 0, 1]),
    };
  });

  return (
    <TouchableOpacity onPress={flip}>
      <View style={{ width: 110, height: 110 }}>
        {/* FRONT */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 110,
              height: 110,
              backfaceVisibility: "hidden",
            },
            frontStyle,
          ]}
        >
          <TouchableOpacity onPress={onPick}>
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  borderWidth: 4,
                  borderColor: "#FF7A00",
                }}
              />
            ) : (
              <View
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  backgroundColor: "#FFFFFF",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 4,
                  borderColor: "#FF7A00",
                }}
              >
                <Text style={{ fontSize: 34, fontWeight: "800", color: "#4B3248" }}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* BACK */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "#FF7A00",
              justifyContent: "center",
              alignItems: "center",
              backfaceVisibility: "hidden",
            },
            backStyle,
          ]}
        >
          <Text style={{ color: "#fff", fontWeight: "800", textAlign: "center" }}>
            {username}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

/* =========================
   PROFILE SCREEN
========================= */
export default function Profile({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    loadUser();
    fetchUserRecipes();
  }, []);

  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");

      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        setUsername(parsed.username || "User");
        setAvatar(parsed.avatar || "");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecipes = async () => {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    const parsed = JSON.parse(raw);

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", parsed.id);

    if (!error) {
      setRecipes(data || []);
    }
  };

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    try {
      const updatedUser = {
        ...user,
        username,
        avatar,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      Alert.alert("Success", "Profile updated!");
    } catch (e) {
      console.log(e);
    }
  };

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          navigation.replace("Login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={recipes}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <>
          {/* BACK BUTTON */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* HEADER */}
          <View style={styles.header}>
            {/* 🔥 FLIPPING AVATAR */}
            <FlippingAvatar
              avatar={avatar}
              username={username}
              onPick={pickImage}
            />

            <Text style={styles.name}>{username}</Text>

            <Text style={styles.subtitle}>
              {username}@recipeapp.com
            </Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <Text style={styles.title}>Edit Profile</Text>

            <Text style={styles.label}>Username</Text>

            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={saveProfile}
            >
              <Text style={styles.buttonText}>
                Save Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
            >
              <Text style={styles.logoutText}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.postTitle}>
            Your Past Recipes
          </Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.recipeCard}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} />

          <View style={{ padding: 14 }}>
            <Text style={styles.recipeName}>{item.title}</Text>
            <Text style={styles.recipeCategory}>
              {item.category}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

/* =========================
   STYLES (UNCHANGED)
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E6",
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 999,
    backgroundColor: "#FFF",
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4B3248",
  },

  header: {
    paddingTop: 90,
    alignItems: "center",
    paddingBottom: 18,
  },

  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4B3248",
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 24,
    marginTop: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  label: {
    fontWeight: "800",
    marginTop: 10,
  },

  input: {
    backgroundColor: "#FFF4E6",
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
  },

  button: {
    backgroundColor: "#FF7A00",
    padding: 15,
    borderRadius: 18,
    marginTop: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
  },

  logoutButton: {
    backgroundColor: "#D35400",
    padding: 15,
    borderRadius: 18,
    marginTop: 14,
    alignItems: "center",
  },

  logoutText: {
    color: "#FFF",
    fontWeight: "800",
  },

  postTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 24,
  },

  recipeCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    marginBottom: 18,
  },

  recipeImage: {
    width: "100%",
    height: 190,
  },

  recipeName: {
    fontSize: 19,
    fontWeight: "800",
  },

  recipeCategory: {
    color: "#6B7280",
  },
});