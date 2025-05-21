import React, { useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, ScrollView } from "react-native";
import tw from "twrnc";
import { useState } from "react";
import { Feather } from "@expo/vector-icons"; // For icons
import { useAuthContext } from "@/context/hooks/use-auth-context";
import { useRouter } from "expo-router";

const SettingScreen = () => {

  const { sign_out, user } = useAuthContext();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const logout  = async() =>{

    try {
       sign_out?.()
    } catch (error) {
      console.log('==============Error Sign out======================');
      console.log(error)
    }
  }

  useEffect(() => {
     if(!user){
      router.replace('/(auth)');
     }
  }, [user])
  

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`bg-white p-4 border-b border-gray-300`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>Settings</Text>
      </View>

      {/* General Section */}
      <View style={tw`bg-white p-4 mt-4`}>
        <Text style={tw`text-gray-500 uppercase text-xs mb-3`}>General</Text>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Account</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Privacy</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-gray-700`}>Security</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={tw`bg-white p-4 mt-4`}>
        <Text style={tw`text-gray-500 uppercase text-xs mb-3`}>
          Preferences
        </Text>
        <View
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
        <View style={tw`flex-row justify-between items-center py-3`}>
          <Text style={tw`text-base text-gray-700`}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      {/* About Section */}
      <View style={tw`bg-white p-4 mt-4`}>
        <Text style={tw`text-gray-500 uppercase text-xs mb-3`}>About</Text>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Help & Support</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-gray-700`}>App Version</Text>
          <Text style={tw`text-gray-500`}>1.0.0</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={tw`p-4 mt-6`}>
        <TouchableOpacity style={tw`bg-red-500 py-3 rounded-lg items-center`} onPress={logout}>
          <Text style={tw`text-white font-bold text-base`}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingScreen;
