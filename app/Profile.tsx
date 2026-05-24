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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

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
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {String(username).charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <Text style={styles.name}>{username}</Text>
            <Text style={styles.subtitle}>{username}@recipeapp.com</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Edit Profile</Text>

            <Text style={styles.label}>Username</Text>
            <TextInput value={username} onChangeText={setUsername} style={styles.input} />

            <TouchableOpacity style={styles.button} onPress={saveProfile}>
              <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.postTitle}>Your Past Recipes</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.recipeCard}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} />
          <View style={{ padding: 12 }}>
            <Text style={styles.recipeName}>{item.title}</Text>
            <Text style={styles.recipeCategory}>{item.category}</Text>
          </View>
        </View>
      )}
    />
  );
}

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
    fontWeight: "900",
    color: "#4B3248",
  },

  header: {
    paddingTop: 90,
    alignItems: "center",
    paddingBottom: 18,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#72b99e",
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 16,
  },

  label: {
    fontWeight: "800",
    color: "#4F9980",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#FF7A00",
    padding: 15,
    borderRadius: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
  },

  postTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4F9980",
    marginTop: 24,
    marginBottom: 10,
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
    color: "#4B3248",
  },

  recipeCategory: {
    marginTop: 4,
    color: "#5a9d80",
    fontWeight: "700",
  },
});
