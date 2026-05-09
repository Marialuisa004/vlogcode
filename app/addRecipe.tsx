import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

export default function AddRecipe({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 📸 Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ☁️ Upload image to Supabase Storage
  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `recipe-${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from("recipe-images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
      });

    if (error) {
      console.log("UPLOAD ERROR:", error.message);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  // 💾 SAVE RECIPE
  const saveRecipe = async () => {
    if (!title || !ingredients || !category || !image) {
      Alert.alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage(image);

      if (!imageUrl) {
        Alert.alert("Image upload failed");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("recipes").insert({
        title,
        ingredients,
        category,
        image: imageUrl,
      });

      console.log("INSERT DATA:", data);
      console.log("INSERT ERROR:", error);

      if (error) {
        Alert.alert("Save failed", error.message);
      } else {
        Alert.alert("Success", "Recipe saved!");

        // reset form
        setTitle("");
        setIngredients("");
        setCategory("");
        setImage(null);

        navigation.goBack();
      }
    } catch (err) {
      console.log("ERROR:", err);
      Alert.alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Recipe 🍲</Text>

      {/* TITLE */}
      <TextInput
        placeholder="Recipe Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      {/* INGREDIENTS */}
      <TextInput
        placeholder="Ingredients"
        value={ingredients}
        onChangeText={setIngredients}
        style={[styles.input, { height: 100 }]}
        multiline
      />

      {/* CATEGORY */}
      <TextInput
        placeholder="Category (Dessert, Lunch, etc.)"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      {/* IMAGE */}
      <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
        <Text style={{ color: "white" }}>Pick Image</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={saveRecipe}
        style={styles.saveBtn}
        disabled={loading}
      >
        <Text style={{ color: "white" }}>
          {loading ? "Saving..." : "Save Recipe"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  imageBtn: {
    backgroundColor: "#333",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  saveBtn: {
    backgroundColor: "green",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
  },
});