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
<<<<<<< HEAD

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";

=======
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
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
<<<<<<< HEAD
=======

>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
        setUser(parsed);
        setUsername(parsed.username || "User");
        setAvatar(parsed.avatar || "");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
=======
  };

  // =========================
  // FETCH USER POSTS
  // =========================
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

  // =========================
  // PICK AVATAR IMAGE
  // =========================
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

  // =========================
  // SAVE PROFILE
  // =========================
  const saveProfile = async () => {
    try {
      const updatedUser = {
        ...user,
        username,
        avatar,
      };

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);

      Alert.alert("Success", "Profile updated!");
    } catch (e) {
      console.log(e);
    }
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
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
<<<<<<< HEAD
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
=======
            onPress={() => navigation.navigate("Main")}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {/* PROFILE HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={pickImage}>
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {String(username).charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.name}>{username}</Text>

          </View>

          {/* PROFILE CARD */}
          <View style={styles.card}>
            <Text style={styles.label}>Edit Username</Text>
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012

            <TextInput
              value={username}
              onChangeText={setUsername}
<<<<<<< HEAD
=======
              placeholder="Username"
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
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
<<<<<<< HEAD


          </View>

          <Text style={styles.postTitle}>
            Your Past Recipes
          </Text>
=======
          </View>

          {/* USER POSTS */}
          <Text style={styles.postTitle}>Your Past Recipes</Text>
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.recipeCard}>
<<<<<<< HEAD
          <Image source={{ uri: item.image }} style={styles.recipeImage} />

          <View style={{ padding: 14 }}>
            <Text style={styles.recipeName}>{item.title}</Text>
=======
          <Image
            source={{ uri: item.image }}
            style={styles.recipeImage}
          />

          <View style={{ padding: 12 }}>
            <Text style={styles.recipeName}>
              {item.title}
            </Text>

>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
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

<<<<<<< HEAD
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 999,
    backgroundColor: "#FFF",
    width: 55,
    height: 55,
    borderRadius: 28,
=======
  header: {
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: "center",
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#72b99e",
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
    justifyContent: "center",
    alignItems: "center",
  },

<<<<<<< HEAD
  backButtonText: {
    fontSize: 24,
=======
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
  },

  avatarText: {
    color: "#fff",
    fontSize: 34,
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
    fontWeight: "800",
    color: "#4B3248",
  },

<<<<<<< HEAD
  header: {
    paddingTop: 90,
    alignItems: "center",
    paddingBottom: 18,
  },

=======
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
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
<<<<<<< HEAD
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

=======
    color: "#2f6b55",
  },

  subtitle: {
    marginTop: 6,
    color: "#5a9d80",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#94c9b7",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
    marginTop: 10,
  },

  label: {
    fontWeight: "800",
    color: "#3c7d68",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#3c7d68",
    marginBottom: 16,
    textAlign: "center",
  },

  backButton: {
    marginTop: 8,
    marginBottom: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#94c9b7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#94c9b7",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  backButtonText: {
    color: "#d43006",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 42,
  },

  button: {
    backgroundColor: "#459c80",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
  buttonText: {
    color: "#FFF",
    fontWeight: "800",
  },

<<<<<<< HEAD
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
=======
  postTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2f6b55",
    marginTop: 24,
    marginBottom: 14,
  },

  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
  },

  recipeImage: {
    width: "100%",
<<<<<<< HEAD
    height: 190,
  },

  recipeName: {
    fontSize: 19,
    fontWeight: "800",
  },

  recipeCategory: {
    color: "#6B7280",
=======
    height: 180,
  },

  recipeName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3f5f54",
  },

  recipeCategory: {
    marginTop: 4,
    color: "#5a9d80",
    fontWeight: "700",
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
  },
});