import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { supabase } from '../lib/supabase';

type Recipe = {
  id: string;
  title: string;
  ingredients: string;
  category: string;
  image: string;
};

type Props = {
  onLogout: () => void;
};

export default function Home({ onLogout }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*');

    console.log('DATA:', data);
    console.log('ERROR:', error);

    if (data) {
      setRecipes(data);
    }
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchRecipes();
    }
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.category}>
        Category: {item.category}
      </Text>

      <Text style={styles.ingredients}>
        {item.ingredients}
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteRecipe(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        onPress={onLogout}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>🍲 My Recipes</Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f2f2f2',
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  logoutButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },

  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  category: {
    fontSize: 16,
    color: 'green',
    marginVertical: 5,
  },

  ingredients: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
  },

  deleteText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});