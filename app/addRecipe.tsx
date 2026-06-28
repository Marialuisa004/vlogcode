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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddRecipe({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
   

  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert"];

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

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

  const uploadImage = async (uri: string) => {
    try {
      const fileName = `${Date.now()}.jpg`;

      const response = await fetch(uri);
      if (!response.ok) return null;

      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) return null;

      const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (e) {
      return null;
    }
  };

  const addRecipe = async () => {
  console.log("Save button pressed");

  if (!title || !ingredients || !steps || !category || !image) {
    Alert.alert("Missing Fields", "Please complete all fields");
    return;
  }

  try {
    setLoading(true);

    // Upload image
    const imageUrl = await uploadImage(image);
    console.log("Image URL:", imageUrl);

    if (!imageUrl) {
      Alert.alert("Error", "Image upload failed");
      return;
    }

    // Get the logged-in user from AsyncStorage
        const storedUser = await AsyncStorage.getItem("user");

        if (!storedUser) {
          Alert.alert("Error", "No logged-in user found.");
          return;
        }

        const user = JSON.parse(storedUser);

        console.log("Logged-in user:", user);

    console.log("Inserting recipe...");

    const { data, error } = await supabase
      .from("recipes")
      .insert([
        {
          title,
          ingredients,
          steps,
          category,
          image: imageUrl,
          user_id: user.id,
        },
      ])
      .select();

    console.log("Inserted Data:", data);
    console.log("Insert Error:", error);

    if (error) {
      Alert.alert("Insert Error", error.message);
      return;
    }

    Alert.alert("Success", "Recipe added successfully!");

    // Clear the form
    setTitle("");
    setIngredients("");
    setSteps("");
    setCategory("");
    setImage(null);

    navigation.goBack();
  } catch (err: any) {
    console.log("Catch Error:", err);
    Alert.alert("Unexpected Error", err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Recipe</Text>

      <TextInput
        placeholder="Title"
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Ingredients"
        placeholderTextColor="#9CA3AF"
        value={ingredients}
        onChangeText={setIngredients}
        style={[styles.input, { height: 100 }]}
        multiline
      />

      <TextInput
        placeholder="Cooking Steps"
        placeholderTextColor="#9CA3AF"
        value={steps}
        onChangeText={setSteps}
        style={[styles.input, { height: 120 }]}
        multiline
      />

      <Text style={styles.label}>Category</Text>

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
            <Text
              style={{
                color: category === item ? "#FFFFFF" : "#4B3248",
                fontWeight: "700",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Pick Image
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={addRecipe}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? "Saving..." : "Save Recipe"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* =========================
   THEME DESIGN
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF4E6",
  },

  header: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    color: "#4B3248",
  },

  label: {
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
    color: "#4F9980",
  },

  input: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8D9C8",
    color: "#4B3248",
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  catBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8D9C8",
  },

  catActive: {
    backgroundColor: "#4F9980",
    borderColor: "#4F9980",
  },

  imageBtn: {
    backgroundColor: "#FF7A00",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 14,
  },

  preview: {
    width: "100%",
    height: 210,
    borderRadius: 18,
    marginBottom: 14,
  },

  saveBtn: {
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});