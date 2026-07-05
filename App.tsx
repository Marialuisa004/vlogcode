import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import "react-native-gesture-handler";

import Login from "./app/Login";
import Register from "./app/Register";
import Home from "./app/Home";
import AddRecipe from "./app/addRecipe";
import EditRecipe from "./app/EditRecipe";
import Profile from "./app/Profile";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* =========================
   BOTTOM TABS
========================= */
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ff6347",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Add Recipe") {
            iconName = "add-circle";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          return (
            <Ionicons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Add Recipe" component={AddRecipe} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

/* =========================
   MAIN APP NAVIGATION
========================= */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* AUTH */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />

        {/* MAIN APP */}
        <Stack.Screen name="Main" component={Tabs} />

        {/* EDIT SCREEN (IMPORTANT) */}
        <Stack.Screen name="EditRecipe" component={EditRecipe} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}