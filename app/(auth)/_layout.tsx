import { View, Image, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoginScreen from '@/components/auth/Login';
import RegisterScreen from '@/components/auth/Register';
import React from 'react';

const Tab = createMaterialTopTabNavigator();

export default function AuthLayout() {

  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/auth-header.jpeg')}
        style={styles.image}
      />
      <Text style={styles.text}>Good Night</Text>
      {/* Description */}
      <Text style={[styles.description, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        Welcome to Good Night
      </Text>
      <Tab.Navigator
          initialRouteName='Login'
          screenOptions={{
            tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
            tabBarIndicatorStyle: { 
              backgroundColor: colorScheme === 'dark' ? '#fff' : '#000',
              height: 3,
            },
            tabBarPressColor:'#ffffff',
            tabBarStyle: {
              backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#ffffff',
            },
            tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
            tabBarInactiveTintColor: colorScheme === 'dark' ? '#888' : '#666',
          }}
        >
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="Register" component={RegisterScreen} />
      </Tab.Navigator>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Adjust background color as needed
  },
  image: {
    width: '100%',
    height: 150, // Adjust height as needed
    right:50,
    resizeMode:'center', // Ensure the image covers the area
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  text: {
    position: 'absolute',
    top: 80,  // Adjust this value to control the vertical position
    right: 0,   // Adjust this value to control the horizontal position
    fontSize: 34,
    color: 'black',
    fontWeight: 'bold',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Optional: Adds background for readability
    padding: 5,
  },
});
