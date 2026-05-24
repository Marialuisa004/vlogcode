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
  withSpring,
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
  user_id?: string;
};

export default function Home({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [myPosts, setMyPosts] = useState<Recipe[]>([]);

  const categories = useMemo(
    () => ["All", "Breakfast", "Lunch", "Dinner", "Dessert"],
    []
  );

  const normalizeRecipe = (d: any): Recipe => ({
    ...d,
    id: String(d.id),
    title: String(d.title ?? ""),
    image: String(d.image ?? ""),
    ingredients: String(d.ingredients ?? ""),
    category: String(d.category ?? ""),
    steps: d.steps ? String(d.steps) : "",
    user_id: d.user_id ? String(d.user_id) : "",
  });

  // GET USER
  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setUserId(user.id);
      }
    };
    loadUser();
  }, []);

  // FETCH ALL RECIPES
  const fetchRecipes = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      const normalized = (data || []).map(normalizeRecipe);
      setRecipes(normalized);
      setFiltered(normalized);
    }

    setLoading(false);
  };

  // FETCH MY POSTS
  const fetchMyPosts = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false });

    setMyPosts((data || []).map(normalizeRecipe));
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  // REALTIME
  useEffect(() => {
    const channel = supabase
      .channel("recipes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recipes" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRecipe = normalizeRecipe((payload as any).new);
            setRecipes((prev) => [newRecipe, ...prev]);
          }

          if (payload.eventType === "DELETE") {
            const deletedId = String((payload as any).old?.id);
            setRecipes((prev) => prev.filter((r) => r.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  // FILTER
  useEffect(() => {
    let next = recipes;

    if (selectedCategory !== "All") {
      next = next.filter(
        (r) => r.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    const text = search.toLowerCase();
    if (text) {
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

  const openMyPosts = async () => {
    setShowMyPosts(true);
    await fetchMyPosts();
  };

  const AnimatedRecipeImage = ({ uri }: { uri: string }) => {
    const translateX = useSharedValue(-120);
    const scale = useSharedValue(0.8);

    useEffect(() => {
      translateX.value = withSpring(0);
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    }));

    return (
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image source={{ uri }} style={styles.recipeImage} />
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

      {/* MY POSTS MODAL (ONLY ONCE) */}
      {showMyPosts && (
        <View style={styles.myPostsOverlay}>
          <View style={styles.overlayHeader}>
            <Text style={styles.overlayTitle}>My Posts</Text>

            <TouchableOpacity onPress={() => setShowMyPosts(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={myPosts}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.myPostCard}>
                <Image source={{ uri: item.image }} style={styles.myPostImage} />
                <Text style={styles.myPostTitle}>{item.title}</Text>
              </View>
            )}
          />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <>
            {/* TOP BAR FIXED */}
            <View style={styles.topBar}>
              <TextInput
                placeholder="Search recipes..."
                value={search}
                onChangeText={setSearch}
                style={styles.search}
              />

              {/* BETWEEN SEARCH AND LOGOUT */}
              <TouchableOpacity onPress={openMyPosts} style={styles.myPostsBtn}>
                <Text style={styles.myPostsText}>My Posts</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSelectedCategory(item)}
                  style={styles.categoryBtn}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <AnimatedRecipeImage uri={item.image} />
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E6",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF4E6",
  },

  topBar: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
  },

  search: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE0C2",
    paddingHorizontal: 16,
    borderRadius: 18,
    flex: 1,
    height: 50,
  },

  logoutBtn: {
    backgroundColor: "#FF7A00",
    padding: 12,
    borderRadius: 18,
  },

  logoutText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  categoriesWrapper: {
    marginBottom: 18,
  },


  categoryBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
  },

  categoryActive: {
    backgroundColor: "#FF7A00",
  },

  categoryText: {
    color: "#6B7280",
    fontWeight: "700",
  },

  categoryActiveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  card: {
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  marginBottom: 16,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 8,
  elevation: 3,
},

imageContainer: {
  width: "100%",
  height: 170,
  overflow: "hidden",
},

recipeImage: {
  width: "100%",
  height: 170,
  borderTopLeftRadius: 22,
  borderTopRightRadius: 22,
},

cardContent: {
  padding: 14,
},

title: {
  fontSize: 20,
  fontWeight: "800",
  color: "#4B3248",
},

category: { 
  color: "#4F9980",
  marginTop: 6,
  fontWeight: "800", 
},

ingredients: {
  color: "#6B7280",
  marginTop: 8,
  lineHeight: 20,
  fontSize: 13,
},

emptyContainer: {
  alignItems: "center", 
  marginTop: 50,
  },

emptyText: { 
  fontSize: 18, 
  fontWeight: "700",
  color: "#4F9980",
},

steps: {
  color: "#4B5563",
  marginTop: 8,
  lineHeight: 20,
  fontSize: 13,
},

seeMoreText: {
  color: "#FF7A00",
  fontWeight: "700",
  marginTop: 8,
},

sectionTitle: {
  marginTop: 10,
  fontSize: 15,
  fontWeight: "800",
  color: "#4F9980",
},

myPostsBtn: {
  backgroundColor: "#FF7A00",
  padding: 12,
  borderRadius: 14,
  marginBottom: 10,
},

myPostsText: {
  color: "#fff",
  fontWeight: "800",
},

myPostsOverlay: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "#FFF4E6",
  zIndex: 999,
  padding: 16,
},

overlayHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
},

overlayTitle: {
  fontSize: 20,
  fontWeight: "800",
},

closeBtn: {
  color: "#FF7A00",
  fontWeight: "800",
},

myPostCard: {
  backgroundColor: "#fff",
  marginBottom: 12,
  borderRadius: 16,
  overflow: "hidden",
},

myPostImage: {
  width: "100%",
  height: 150,
},

myPostTitle: {
  fontSize: 16,
  fontWeight: "800",
},

myPostCategory: {
  color: "#4F9980",
},
});