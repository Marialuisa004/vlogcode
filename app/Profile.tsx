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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

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
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f9980" />
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

            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
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
          </View>

          {/* USER POSTS */}
          <Text style={styles.postTitle}>Your Past Recipes</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.recipeCard}>
          <Image
            source={{ uri: item.image }}
            style={styles.recipeImage}
          />

          <View style={{ padding: 12 }}>
            <Text style={styles.recipeName}>
              {item.title}
            </Text>

            <Text style={styles.recipeCategory}>
              {item.category}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#effaf3",
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#effaf3",
    padding: 16,
  },

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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
  },

  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },

  name: {
    fontSize: 22,
    fontWeight: "800",
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

  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },

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
  },

  recipeImage: {
    width: "100%",
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
  },
});