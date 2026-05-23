import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

export default function AddRecipe({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert"];

  // 📸 PICK IMAGE
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow access to photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ☁️ UPLOAD IMAGE TO SUPABASE STORAGE
  const uploadImage = async (uri: string) => {
    try {
      const fileName = `${Date.now()}.jpg`;

      const response = await fetch(uri);
      if (!response.ok) {
        console.log("[AddRecipe] fetch image failed:", response.status, response.statusText);
        return null;
      }

      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.log("[AddRecipe] UPLOAD ERROR:", error.message);
        return null;
      }

      const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (e: any) {
      console.log("[AddRecipe] uploadImage exception:", e);
      return null;
    }
  };

  // 💾 SAVE RECIPE
const addRecipe = async () => {
  // Prevent multiple taps
  if (loading) return;

  // Validate fields
  if (
    !title.trim() ||
    !ingredients.trim() ||
    !steps.trim() ||
    !category.trim() ||
    !image
  ) {
    Alert.alert("Missing Fields", "Please complete all fields");
    return;
  }

  try {
    setLoading(true);

    // Upload image first
    const imageUrl = await uploadImage(image);

    if (!imageUrl) {
      Alert.alert("Upload Failed", "Could not upload image");
      setLoading(false);
      return;
    }

    // Save recipe to Supabase
    const { error } = await supabase.from("recipes").insert([
      {
        title: title.trim(),
        ingredients: ingredients.trim(),
        steps: steps.trim(),
        category,
        image: imageUrl,
      },
    ]);

    if (error) {
      console.log("SAVE ERROR:", error.message);
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    // Clear form
    setTitle("");
    setIngredients("");
    setSteps("");
    setCategory("");
    setImage(null);

    Alert.alert("Success", "Recipe saved successfully!");

    // Go back to Home
    navigation.navigate("Home");

  } catch (err: any) {
    console.log("ADD RECIPE ERROR:", err);
    Alert.alert("Error", err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.header}>Add Recipe</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Ingredients"
        value={ingredients}
        onChangeText={setIngredients}
        style={[styles.input, { height: 100 }]}
        multiline
      />

      <TextInput
        placeholder="Cooking Steps"
        value={steps}
        onChangeText={setSteps}
        style={[styles.input, { height: 120 }]}
        multiline
      />

      {/* CATEGORY */}
      <View style={styles.categoryRow}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            style={[
              styles.catBtn,
              category === item && styles.catActive,
            ]}
          >
            <Text style={{ color: category === item ? "#fff" : "#333" }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* IMAGE */}
      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        <Text style={{ color: "#fff" }}>Pick Image</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      {/* SAVE */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={addRecipe}
        disabled={loading}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          {loading ? "Saving..." : "Save Recipe"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f3fcf6",
  },

  header: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    color: "#3c7d68",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#b8e6d5",
    shadowColor: "#9cd3c1",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  catBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#cde9d8",
    borderRadius: 24,
    marginRight: 10,
    marginBottom: 10,
  },

  catActive: {
    backgroundColor: "#72b99e",
  },

  imageBtn: {
    backgroundColor: "#4d9c7a",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#7fc6a7",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  preview: {
    width: "100%",
    height: 210,
    borderRadius: 20,
    marginBottom: 14,
  },

  saveBtn: {
    backgroundColor: "#459c80",
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#7fc6a7",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  saveText: {
    color: "#fff",
    fontWeight: "800",
  },
});