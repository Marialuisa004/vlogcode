import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

export default function EditRecipe({ route, navigation }: any) {
  const { recipe } = route.params;

  const [title, setTitle] = useState(recipe.title);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [steps, setSteps] = useState(recipe.steps || "");
  const [category, setCategory] = useState(recipe.category);
  const [image, setImage] = useState(recipe.image);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Dessert",
  ];

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photos."
      );
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
      // Already uploaded
      if (uri.startsWith("http")) {
        return uri;
      }

      const fileName = `${Date.now()}.jpg`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.log(error);
        return null;
      }

      const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const updateRecipe = async () => {
    if (
      !title ||
      !ingredients ||
      !steps ||
      !category
    ) {
      Alert.alert(
        "Missing Fields",
        "Please complete all fields."
      );
      return;
    }

    try {
      setLoading(true);

      let imageUrl = image;

      // Upload only if user selected a new image
      if (image && !image.startsWith("http")) {
        const uploaded = await uploadImage(image);

        if (!uploaded) {
          Alert.alert(
            "Error",
            "Image upload failed."
          );
          return;
        }

        imageUrl = uploaded;
      }

      const { error } = await supabase
        .from("recipes")
        .update({
          title,
          ingredients,
          steps,
          category,
          image: imageUrl,
        })
        .eq("id", recipe.id);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert(
        "Success",
        "Recipe updated successfully!"
      );

      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipe.id);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert(
        "Success",
        "Recipe deleted successfully!"
      );

      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <ScrollView
    style={styles.container}
    contentContainerStyle={{ paddingBottom: 30 }}
  >
    <Text style={styles.header}>Edit Recipe</Text>

    <TextInput
      value={title}
      onChangeText={setTitle}
      placeholder="Recipe Title"
      placeholderTextColor="#999"
      style={styles.input}
    />

    <TextInput
      value={ingredients}
      onChangeText={setIngredients}
      placeholder="Ingredients"
      placeholderTextColor="#999"
      multiline
      style={[styles.input, { height: 100 }]}
    />

    <TextInput
      value={steps}
      onChangeText={setSteps}
      placeholder="Cooking Steps"
      placeholderTextColor="#999"
      multiline
      style={[styles.input, { height: 140 }]}
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
              color:
                category === item
                  ? "#FFFFFF"
                  : "#4B3248",
              fontWeight: "700",
            }}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <TouchableOpacity
      style={styles.imageBtn}
      onPress={pickImage}
      disabled={loading}
    >
      <Text style={styles.imageBtnText}>
        Change Image
      </Text>
    </TouchableOpacity>

    {image ? (
      <Image
        source={{ uri: image }}
        style={styles.preview}
      />
    ) : null}

    <TouchableOpacity
      style={[
        styles.saveBtn,
        loading && { opacity: 0.7 },
      ]}
      onPress={updateRecipe}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.saveText}>
          Update Recipe
        </Text>
      )}
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.deleteBtn}
      disabled={loading}
      onPress={() =>
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
              onPress: deleteRecipe,
            },
          ]
        )
      }
    >
      <Text style={styles.deleteText}>
        Delete Recipe
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.cancelBtn}
      disabled={loading}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.cancelText}>
        Cancel
      </Text>
    </TouchableOpacity>
  </ScrollView>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E6",
    padding: 18,
  },

  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4B3248",
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F9980",
    marginBottom: 10,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8D9C8",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    color: "#4B3248",
    textAlignVertical: "top",
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  catBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
  },

  imageBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginBottom: 20,
  },

  saveBtn: {
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  deleteBtn: {
    backgroundColor: "#E53935",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  deleteText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  cancelBtn: {
    backgroundColor: "#9E9E9E",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  cancelText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});