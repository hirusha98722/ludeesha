import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons"; // Icons for navigation

const AccountScreen = () => {
  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`bg-white p-4 border-b border-gray-300`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>Account</Text>
      </View>

      {/* Profile Section */}
      <View style={tw`bg-white p-6 items-center mt-4`}>
        <Image
          source={{ uri: "https://via.placeholder.com/100" }}
          style={tw`w-24 h-24 rounded-full mb-3`}
        />
        <Text style={tw`text-lg font-bold text-gray-800`}>John Doe</Text>
        <Text style={tw`text-gray-500 text-sm`}>johndoe@example.com</Text>
      </View>

      {/* Account Options */}
      <View style={tw`bg-white p-4 mt-4`}>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Edit Profile</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Change Password</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Payment Methods</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-gray-700`}>Connected Accounts</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Privacy & Security */}
      <View style={tw`bg-white p-4 mt-4`}>
        <Text style={tw`text-gray-500 uppercase text-xs mb-3`}>Security</Text>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>
            Two-Factor Authentication
          </Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-gray-700`}>Privacy Settings</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={tw`p-4 mt-6`}>
        <TouchableOpacity style={tw`bg-red-500 py-3 rounded-lg items-center`}>
          <Text style={tw`text-white font-bold text-base`}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AccountScreen;
