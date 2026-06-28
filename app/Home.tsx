import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type Recipe = {
  id: string;
  title: string;
  image: string;
  ingredients: string;
  category: string;
  steps?: string;
  user_id?: number;
  created_at?: string;
};

export default function Home({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pressedCategory, setPressedCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All", "Breakfast", "Lunch", "Dinner", "Dessert"],
    []
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const normalizeRecipe = (d: any): Recipe => ({
  id: String(d.id),
  title: String(d.title ?? ""),
  image: String(d.image ?? ""),
  ingredients: String(d.ingredients ?? ""),
  category: String(d.category ?? ""),
  steps: String(d.steps ?? ""),
  user_id: Number(d.user_id ?? 0),
});
 
   const fetchRecipes = async () => {
  setLoading(true);

  try {
    // Get the logged-in user from AsyncStorage
    const storedUser = await AsyncStorage.getItem("user");

    if (!storedUser) {
      console.log("No logged-in user found.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);

    console.log("Current User:", user);

    // Fetch only this user's recipes
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.log("Fetch Error:", error);
      setLoading(false);
      return;
    }

    const normalized = (data || []).map(normalizeRecipe);

    setRecipes(normalized);
    setFiltered(normalized);
  } catch (err) {
    console.log("Error:", err);
  } finally {
    setLoading(false);
  }
};

useFocusEffect(
  useCallback(() => {
    fetchRecipes();
  }, [])
);

useEffect(() => {
  let next = recipes;

  if (selectedCategory !== "All") {
    next = next.filter(
      (r) =>
        r.category.toLowerCase() ===
        selectedCategory.toLowerCase()
    );
  }

  if (search.trim()) {
    const text = search.toLowerCase();

    next = next.filter(
      (r) =>
        r.title.toLowerCase().includes(text) ||
        r.ingredients.toLowerCase().includes(text)
    );
  }

  setFiltered(next);
}, [recipes, search, selectedCategory]);

  const logout = async () => {
  await AsyncStorage.removeItem("user");
  navigation.replace("Login");
};

  const AnimatedImage = ({ uri }: { uri: string }) => {
    const scale = useSharedValue(0.9);

    useEffect(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }, []);

    const style = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={style}>
        <Image source={{ uri }} style={styles.image} />
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={() => (
          <>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(c)}
                  onPressIn={() => setPressedCategory(c)}
                  onPressOut={() => setPressedCategory(null)}
                  style={[
                    styles.catBtn,
                    selectedCategory === c && styles.catActive,
                    pressedCategory === c && styles.catPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.catText,
                      selectedCategory === c && styles.catTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 🔥 SEPARATOR ADDED HERE */}
            <View style={styles.separator} />
          </>
        )}
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;

          const isLongText =
            item.ingredients.length > 120 || (item.steps?.length ?? 0) > 120;

          return (
            <View style={styles.card}>
              <AnimatedImage uri={item.image} />

              <View style={styles.cardContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.category}>{item.category}</Text>

                {/* INGREDIENTS */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <Text
                    style={styles.text}
                    numberOfLines={isExpanded ? undefined : 3}
                  >
                    {item.ingredients}
                  </Text>
                </View>

                {/* STEPS */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Steps</Text>
                  <Text
                    style={styles.text}
                    numberOfLines={isExpanded ? undefined : 3}
                  >
                    {item.steps}
                  </Text>
                </View>

                {/* TOGGLE */}
                {isLongText && (
                  <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                    <Text style={styles.seeMoreText}>
                      {isExpanded ? "See Less" : "See More"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E6",
    padding: 12,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topBar: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },

  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFE0C2",
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 42,
  },

  logoutBtn: {
    backgroundColor: "#FF7A00",
    padding: 10,
    borderRadius: 12,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "800",
  },

  catBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3E5D8",
  },

  catPressed: {
    transform: [{ scale: 0.95 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  catActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },

  catText: {
    color: "#333",
    fontWeight: "600",
  },

  catTextActive: {
    color: "#fff",
  },

  // 🔥 THIS IS YOUR SEPARATOR
  separator: {
    height: 2,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
    width: "100%",
    borderRadius: 2,
  },

  card: {
    backgroundColor: "#fff",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderLeftColor: "#FF7A00",
    borderRightColor: "#FF7A00",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },

  cardContent: {
    padding: 12,
  },

  image: {
    width: "100%",
    height: 180,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
  },

  category: {
    color: "#4F9980",
    marginBottom: 8,
    fontWeight: "700",
  },

  sectionBox: {
    borderWidth: 1,
    borderColor: "#F3E5D8",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },

  sectionTitle: {
    fontWeight: "800",
    color: "#FF7A00",
    marginBottom: 5,
  },

  text: {
    color: "#4B5563",
    lineHeight: 20,
  },

  seeMoreText: {
    color: "#FF7A00",
    fontWeight: "700",
    marginTop: 10,
  },
});