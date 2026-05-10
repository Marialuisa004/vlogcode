import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from './app/Home';
import AddRecipe from './app/addRecipe';
import Login from './app/Login';
import Register from './app/Register';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // ---------------- NOT LOGGED IN ----------------
  if (!loggedIn) {
    // REGISTER SCREEN
    if (showRegister) {
      return (
        <Register
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }

    // LOGIN SCREEN
    return (
      <Login
        onLogin={() => setLoggedIn(true)}
        onGoToRegister={() => setShowRegister(true)}
      />
    );
  }

  // ---------------- MAIN APP ----------------
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home">
          {() => (
            <Home
              onLogout={() => {
                setLoggedIn(false);
                setShowRegister(false);
              }}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Add Recipe"
          component={AddRecipe}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}