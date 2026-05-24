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
      Alert.alert("Missing Fields");
      return;
    }

    const { error } = await supabase
      .from("recipes")
      .update({
        title,
        ingredients,
        steps,
        category,
      })
      .eq("id", recipe.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Recipe updated");
    navigation.goBack();
  };

  const deleteRecipe = async () => {
    const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Recipe deleted");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Recipe</Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
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
        style={[styles.input, { height: 120 }]}
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

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TouchableOpacity
          style={[styles.saveBtn, { flex: 1, marginRight: 8 }]}
          onPress={updateRecipe}
        >
          <Text style={styles.saveText}>Update Recipe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteBtn,
            {
              flex: 1,
              marginTop: 0,
              backgroundColor: "#9e9e9e",
            },
          ]}
          onPress={() =>
            Alert.alert(
              "Confirm delete",
              "Are you sure you want to delete this recipe?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: deleteRecipe },
              ]
            )
          }
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.deleteBtn, { marginTop: 12, backgroundColor: "#D35400" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.deleteText}>Cancel</Text>
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
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 18,
    color: "#4B3248",
  },

  label: {
    fontWeight: "700",
    marginBottom: 10,
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

  saveBtn: {
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  deleteBtn: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF7A00",
  },

  deleteText: {
    color: "#FF7A00",
    fontWeight: "800",
  },
});
