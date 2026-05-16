}import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Recipe = {
  id: string;
  title: string;
  image: string;
  ingredients: string;
  category: string;
  steps?: string;
};

type Props = { navigation: any };

export default function Home({ navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert"];

  // =========================
  // FETCH RECIPES
  // =========================
  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("recipes").select("*");

    if (error) {
      console.log("FETCH ERROR:", error.message);
      setLoading(false);
      return;
    }

    setRecipes((data || []) as Recipe[]);
    setLoading(false);
  };

  // =========================
  // REALTIME (FIXED + NO DUPLICATES)
  // =========================
  useEffect(() => {
    fetchRecipes();

    const channel = supabase
      .channel("recipes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recipes" },
        (payload) => {
          console.log("REALTIME:", payload);

          if (payload.eventType === "INSERT") {
            setRecipes((prev) => {
              const exists = prev.some((r) => r.id === payload.new.id);
              if (exists) return prev;
              return [payload.new as Recipe, ...prev];
            });
          }

          if (payload.eventType === "DELETE") {
            setRecipes((prev) => prev.filter((item) => item.id !== payload.old.id));
          }

          if (payload.eventType === "UPDATE") {
            setRecipes((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as Recipe) : item))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =========================
  // FILTER + SEARCH
  // =========================
  useEffect(() => {
    const base =
      selectedCategory === "All"
        ? recipes
        : recipes.filter((r) => (r.category || "") === selectedCategory);

    const q = search.trim().toLowerCase();
    const searched = q.length
      ? base.filter((item) => (item.title || "").toLowerCase().includes(q))
      : base;

    setFiltered(searched);
  }, [recipes, search, selectedCategory]);

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TextInput
          placeholder="Search recipes..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(i) => i}
        style={styles.categoriesList}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            style={[styles.categoryBtn, selectedCategory === item && styles.categoryActive]}
          >
            <Text style={selectedCategory === item ? styles.categoryActive : styles.category}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* RECIPES */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text numberOfLines={2} style={styles.ingredients}>
                {item.ingredients}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("EditRecipe", { recipe: item })}
                  style={styles.editBtn}
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    padding: 15,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  categoryBtn: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
    marginRight: 8,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryActive: {
    backgroundColor: "#ff6347",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 180,
  },

  cardContent: {
    padding: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  category: {
    color: "#ff6347",
    marginBottom: 5,
    fontWeight: "bold",
  },

  ingredients: {
    color: "#555",
    marginBottom: 5,
  },

  seeMoreIngredient: {
    color: "#ff6347",
    fontWeight: "bold",
    marginBottom: 10,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  editBtn: {
    backgroundColor: "#4a90e2",
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },

  deleteBtn: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  seeMoreBtn: {
    padding: 12,
    backgroundColor: "#ff6347",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },

  seeMoreText: {
    color: "#fff",
    fontWeight: "bold",
  },
  
  logoutBtn: {
  backgroundColor: "#e74c3c",
  padding: 10,
  borderRadius: 10,
  alignSelf: "flex-end",
  marginBottom: 10,
},

logoutText: {
  color: "#fff",
  fontWeight: "bold",
},
  
});
