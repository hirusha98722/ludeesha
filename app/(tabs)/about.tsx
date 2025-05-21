import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons"; // Icons for navigation

const AboutScreen = () => {
  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`bg-white p-4 border-b border-gray-300`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>About</Text>
      </View>

      {/* App Information */}
      <View style={tw`bg-white p-6 mt-4`}>
        <Text style={tw`text-lg font-bold text-gray-800`}>
          GoodNight Sleep Tracker App
        </Text>
        <Text style={tw`text-gray-500 text-sm mt-2`}>Version: 1.0.0</Text>
        <Text style={tw`text-gray-700 text-sm mt-2`}>
          This app helps you monitor and improve your sleep patterns using
          AI-based predictions.
        </Text>
      </View>

      {/* Additional Information */}
      <View style={tw`bg-white p-4 mt-4`}>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Privacy Policy</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Terms of Service</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-gray-700`}>Open Source Licenses</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Contact Section */}
      <View style={tw`bg-white p-4 mt-4`}>
        <Text style={tw`text-gray-500 uppercase text-xs mb-3`}>Support</Text>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Help & Support</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-gray-700`}>Contact Us</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={tw`p-4 mt-6 items-center`}>
        <Text style={tw`text-gray-500 text-xs`}>
          © 2025 GoodNight. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

export default AboutScreen;
