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
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  const [recipes, setRecipes] = useState<any[]>([]);

  const [isEditing, setIsEditing] =
    useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const raw =
        await AsyncStorage.getItem("user");

      if (!raw) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(raw);

      setUser(parsed);

      setUsername(parsed.username || "");
      setEmail(parsed.email || "");
      setAvatar(parsed.avatar || "");

      fetchUserRecipes(parsed.id);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecipes = async (userId: string) => {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", String(userId));

  if (error) {
    console.log("FETCH ERROR:", error.message);
    return;
  }

  setRecipes(data || []);
};

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission denied");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
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
        email,
        avatar,
      };

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);

      Alert.alert(
        "Success",
        "Profile updated!"
      );
    } catch (e) {
      console.log(e);
    }
  };

  const deleteRecipe = (
    recipeId: string
  ) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } =
              await supabase
                .from("recipes")
                .delete()
                .eq("id", recipeId);

            if (error) {
              Alert.alert(
                "Error",
                error.message
              );
              return;
            }

            setRecipes((prev) =>
              prev.filter(
                (item) =>
                  String(item.id) !==
                  String(recipeId)
              )
            );

            Alert.alert(
              "Deleted",
              "Recipe deleted successfully"
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#FF7A00"
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={recipes}
      keyExtractor={(item) =>
        String(item.id)
      }
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <TouchableOpacity
              disabled={!isEditing}
              onPress={pickImage}
            >
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text
                    style={styles.avatarText}
                  >
                    {username
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.name}>
              {username}
            </Text>

            <Text style={styles.subtitle}>
              {email}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              Profile Information
            </Text>

            <Text style={styles.label}>
              Username
            </Text>

            <TextInput
              value={username}
              editable={isEditing}
              onChangeText={setUsername}
              style={styles.input}
            />

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              value={email}
              editable={isEditing}
              onChangeText={setEmail}
              style={styles.input}
            />

            {!isEditing ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  setIsEditing(true)
                }
              >
                <Text
                  style={styles.buttonText}
                >
                  Edit Profile
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  saveProfile();
                  setIsEditing(false);
                }}
              >
                <Text
                  style={styles.buttonText}
                >
                  Save Profile
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.postTitle}>
            Your Recipes
          </Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.recipeCard}>
          <Image
            source={{ uri: item.image }}
            style={styles.recipeImage}
          />

          <View style={styles.recipeContent}>
            <Text style={styles.recipeName}>
              {item.title}
            </Text>

            <Text
              style={styles.recipeCategory}
            >
              {item.category}
            </Text>

            <Text
              style={styles.sectionTitle}
            >
              Ingredients
            </Text>

            <Text
              style={
                styles.recipeIngredients
              }
            >
              {item.ingredients}
            </Text>

            <Text
              style={styles.sectionTitle}
            >
              Steps
            </Text>

            <Text style={styles.recipeSteps}>
              {item.steps}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate(
                    "EditRecipe",
                    {
                      recipe: item,
                    }
                  )
                }
              >
                <Text
                  style={styles.actionText}
                >
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  deleteRecipe(
                    String(item.id)
                  )
                }
              >
                <Text
                  style={styles.actionText}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
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

  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#72b99e",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },

  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4B3248",
    marginTop: 10,
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 22,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 18,
    color: "#4B3248",
  },

  label: {
    color: "#4F9980",
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  postTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4F9980",
    marginBottom: 16,
  },

  recipeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
  },

  recipeImage: {
    width: "100%",
    height: 180,
  },

  recipeContent: {
    padding: 16,
  },

  recipeName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4B3248",
  },

  recipeCategory: {
    color: "#4F9980",
    marginTop: 4,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 12,
    color: "#FF7A00",
    fontWeight: "800",
  },

  recipeIngredients: {
    marginTop: 6,
    color: "#6B7280",
    lineHeight: 20,
  },

  recipeSteps: {
    marginTop: 6,
    color: "#4B5563",
    lineHeight: 20,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },

  editBtn: {
    backgroundColor: "#FF7A00",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginRight: 10,
  },

  deleteBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});