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
    const fileName = `${Date.now()}.jpg`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from("recipe-images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
      });

    if (error) {
      console.log("UPLOAD ERROR:", error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // 💾 SAVE RECIPE
  const addRecipe = async () => {
    if (!title || !ingredients || !steps || !category || !image) {
      Alert.alert("Missing Fields", "Please complete all fields");
      return;
    }

    setLoading(true);

    const imageUrl = await uploadImage(image);

    if (!imageUrl) {
      setLoading(false);
      Alert.alert("Error", "Image upload failed");
      return;
    }

    const { error } = await supabase.from("recipes").insert([
      {
        title,
        ingredients,
        steps,
        category,
        image: imageUrl,
      },
    ]);

    setLoading(false);

    if (error) {
      console.log(error);
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Recipe added!");

    navigation.goBack(); // IMPORTANT FIX (no reset)
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