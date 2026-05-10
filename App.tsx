import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import 'react-native-gesture-handler';

import Home from "./app/Home";
import AddRecipe from "./app/addRecipe";
import EditRecipe from "./app/EditRecipe";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ff6347",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Add Recipe") iconName = "add-circle";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Add Recipe" component={AddRecipe} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* MAIN TABS */}
        <Stack.Screen
          name="Main"
          component={Tabs}
          options={{ headerShown: false }}
        />

        {/* EDIT SCREEN (NO TAB) */}
        <Stack.Screen name="EditRecipe" component={EditRecipe} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}