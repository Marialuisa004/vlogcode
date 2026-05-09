import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { supabase } from "../lib/supabase";

type Recipe = {
  id: string;
  title: string;
  ingredients: string;
  image: string;
  category: string;
};

const categories = ["All", "Dessert", "Lunch", "Breakfast", "Dinner"];

export default function Home({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 📥 FETCH RECIPES (FIXED)
  const fetchRecipes = async () => {
    let query = supabase.from("recipes").select("*");

    if (selectedCategory !== "All") {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query.order("id", { ascending: false });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      console.log("Fetch error:", error.message);
      return;
    }

    setRecipes(data || []);
  };

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  // 🗑 DELETE
  const deleteRecipe = async (id: string) => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (!error) {
      fetchRecipes();
    } else {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipes 🍲</Text>

      {/* CATEGORY FILTER */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            style={[
              styles.category,
              selectedCategory === item && styles.activeCategory,
            ]}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* RECIPES */}
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <Text style={styles.name}>{item.title}</Text>
            <Text>{item.category}</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("EditRecipe", { recipe: item })}
              style={styles.edit}
            >
              <Text>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteRecipe(item.id)}
              style={styles.delete}
            >
              <Text style={{ color: "white" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

  category: {
    padding: 10,
    backgroundColor: "#eee",
    marginRight: 10,
    borderRadius: 20,
  },

  activeCategory: {
    backgroundColor: "#ffd700",
  },

  card: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },

  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  delete: {
    backgroundColor: "red",
    padding: 8,
    marginTop: 5,
    borderRadius: 5,
    alignItems: "center",
  },

  edit: {
    backgroundColor: "#ddd",
    padding: 8,
    marginTop: 5,
    borderRadius: 5,
    alignItems: "center",
  },
});