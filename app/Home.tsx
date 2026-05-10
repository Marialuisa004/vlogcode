import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Recipe = {
  id: string;
  title: string;
  image: string;
  ingredients: string;
  category: string;
};

export default function Home({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [expanded, setExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const categories = ["All", "Dessert", "Lunch", "Breakfast", "Dinner"];

  const fetchRecipes = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("recipes").select("*");

    if (error) {
      console.log("Fetch error:", error.message);
      setLoading(false);
      return;
    }

    setRecipes(data || []);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  useEffect(() => {
    const base =
      selectedCategory === "All"
        ? recipes
        : recipes.filter((r) => r.category === selectedCategory);

    const searched = base.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(searched);

    setExpanded(false);
    setExpandedItems([]);
  }, [recipes, selectedCategory, search]);

  // ✅ FIXED DELETE WITH GUARANTEED POPUP
  const deleteRecipe = (id: string) => {
    console.log("Delete clicked:", id);

    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Delete cancelled"),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log("Confirm delete:", id);

            const { error } = await supabase
              .from("recipes")
              .delete()
              .eq("id", id);

            if (error) {
              console.log("Delete error:", error.message);
              Alert.alert("Error", error.message);
              return;
            }

            fetchRecipes();
          },
        },
      ]
    );
  };

  const toggleIngredient = (id: string) => {
    setExpandedItems((prev: string[]) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const logout = async () => {
  await AsyncStorage.removeItem("user");

  navigation.replace("Login");
};

<TouchableOpacity
  style={styles.logoutBtn}
  onPress={logout}
>
  <Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  const visibleRecipes = expanded ? filtered : filtered.slice(0, 3);

  return (
    <View style={styles.container}>

      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search recipes..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* 🧠 CATEGORY */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(i) => i}
        style={{ marginBottom: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            style={[
              styles.categoryBtn,
              selectedCategory === item && styles.categoryActive,
            ]}
          >
            <Text
              style={{
                color: selectedCategory === item ? "#fff" : "#333",
                fontWeight: "bold",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* 🍽️ RECIPES */}
      <FlatList
        data={visibleRecipes}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>

            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.cardContent}>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>

              <Text
                numberOfLines={
                  expandedItems.includes(item.id) ? undefined : 2
                }
                style={styles.ingredients}
              >
                {item.ingredients}
              </Text>

              {item.ingredients.length > 80 && (
                <TouchableOpacity onPress={() => toggleIngredient(item.id)}>
                  <Text style={styles.seeMoreIngredient}>
                    {expandedItems.includes(item.id)
                      ? "Show Less"
                      : "See More"}
                  </Text>
                </TouchableOpacity>

              )}

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={logout}
                >
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              <View style={styles.actions}>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("EditRecipe", { recipe: item })
                  }
                  style={styles.editBtn}
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>

                {/* ✅ DELETE BUTTON */}
                <TouchableOpacity
                  onPress={() => deleteRecipe(item.id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>

              </View>

            </View>
          </View>
        )}
      />

      {/* 🔽 SEE MORE */}
      {filtered.length > 3 && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.seeMoreBtn}
        >
          <Text style={styles.seeMoreText}>
            {expanded ? "Show Less" : "See More"}
          </Text>
        </TouchableOpacity>
      )}

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
    borderRadius: 20,
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