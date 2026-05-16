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
  container: { flex: 1, padding: 20, backgroundColor: "#f6f6f6" },

  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },

  catBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ddd",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  catActive: {
    backgroundColor: "#ff6347",
  },

  imageBtn: {
    backgroundColor: "#4a90e2",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  preview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});