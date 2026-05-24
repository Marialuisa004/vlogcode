import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';

import CategoryCard from '../components/CategoryCard';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*');

    if (error) {
      console.log(error);
      return;
    }

    setRecipes(data || []);
  };




  const grouped = recipes.reduce<Record<string, any[]>>((acc, recipe) => {
    const category = recipe.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(recipe);
    return acc;
  }, {});

  const categories = Object.keys(grouped).map((key) => ({
    title: key,
    image: grouped[key][0]?.image,
    count: grouped[key].length,
  }));

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d35400',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Recipe Categories</Text>

      <View style={styles.grid}>
        {categories.map((cat) => (
          <CategoryCard
            key={cat.title}
            title={cat.title}
            image={cat.image}
            count={cat.count}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}