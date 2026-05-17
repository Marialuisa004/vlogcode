import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function EditRecipe({ route, navigation }: any) {
  const { recipe } = route.params;

  const [title, setTitle] = useState(recipe.title);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [steps, setSteps] = useState(recipe.steps || "");
  const [category, setCategory] = useState(recipe.category);

  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert"];

  const updateRecipe = async () => {
    if (!title || !ingredients || !steps || !category) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }

    const { error } = await supabase
      .from("recipes")
      .update({ title, ingredients, steps, category })
      .eq("id", recipe.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Recipe updated!");
    navigation.goBack();
  };

  const deleteRecipe = async () => {
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipe.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Deleted", "Recipe deleted successfully");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Recipe</Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={styles.input}
      />

      <TextInput
        value={ingredients}
        onChangeText={setIngredients}
        placeholder="Ingredients"
        multiline
        style={[styles.input, { height: 100 }]}
      />

      <TextInput
        value={steps}
        onChangeText={setSteps}
        placeholder="Cooking Steps"
        multiline
        style={[styles.input, { height: 120 }]}
      />

      <Text style={styles.label}>Category</Text>

      <View style={styles.categoryRow}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            style={[styles.catBtn, category === item && styles.catActive]}
          >
            <Text style={{ color: category === item ? "#fff" : "#333" }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={updateRecipe}>
        <Text style={styles.saveText}>Update Recipe</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => {
          Alert.alert("Confirm delete", "Are you sure you want to delete this recipe?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteRecipe(),
            },
          ]);
        }}
      >
        <Text style={styles.deleteText}>Delete Recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3fcf6",
    padding: 18,
  },

  header: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 18,
    color: "#3c7d68",
  },

  label: {
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 8,
    color: "#4a6a5d",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 20,
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

  saveBtn: {
    backgroundColor: "#459c80",
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#7fc6a7",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },

  saveText: {
    color: "#fff",
    fontWeight: "800",
  },

  deleteBtn: {
    backgroundColor: "#44846e",
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 14,
    shadowColor: "#7fc6a7",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "800",
  },
});

