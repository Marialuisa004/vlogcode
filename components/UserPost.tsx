import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

type Recipe = {
  id: string;
  title: string;
  image: string;
  category: string;
  ingredients: string;
  steps: string;
};

type Props = {
  userId: string;
  navigation: any;
};

export default function UserPosts({ userId, navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", String(userId))
      .order("id", { ascending: false });

    if (error) {
      console.log("FETCH ERROR:", error.message);
      setLoading(false);
      return;
    }

    setRecipes((data || []) as Recipe[]);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchUserPosts();
  }, [userId]);

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id);

    if (!error) {
      setRecipes((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FF7A00" />;
  }

  return (
    <View>
      {recipes.length === 0 ? (
        <Text style={styles.empty}>No recipes yet</Text>
      ) : (
        recipes.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>

              <Text style={styles.label}>Ingredients</Text>
              <Text style={styles.text}>{item.ingredients}</Text>

              <Text style={styles.label}>Steps</Text>
              <Text style={styles.text}>{item.steps}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate("EditRecipe", { recipe: item })
                  }
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteRecipe(item.id)}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 180,
  },

  content: {
    padding: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4B3248",
  },

  category: {
    color: "#4F9980",
    fontWeight: "700",
    marginBottom: 8,
  },

  label: {
    marginTop: 10,
    fontWeight: "800",
    color: "#FF7A00",
  },

  text: {
    color: "#6B7280",
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },

  editBtn: {
    backgroundColor: "#FF7A00",
    padding: 8,
    borderRadius: 12,
    marginRight: 10,
  },

  deleteBtn: {
    backgroundColor: "#E53935",
    padding: 8,
    borderRadius: 12,
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});