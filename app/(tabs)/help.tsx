import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons"; // For icons

const HelpScreen = () => {
  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`bg-white p-4 border-b border-gray-300`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>Help & Support</Text>
      </View>

      {/* Help Topics */}
      <View style={tw`bg-white p-4 mt-4`}>
        <Text style={tw`text-gray-500 uppercase text-xs mb-3`}>
          Help Topics
        </Text>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>Getting Started</Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>
            How Sleep Tracking Works
          </Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-gray-700`}>
            Understanding Predictions
          </Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* FAQs */}
      <View style={tw`bg-white p-4 mt-4`}>
        <Text style={tw`text-gray-500 uppercase text-xs mb-3`}>FAQs</Text>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>
            How do I log my sleep?
          </Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
        >
          <Text style={tw`text-base text-gray-700`}>
            Why are my sleep predictions inaccurate?
          </Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-gray-700`}>
            How can I improve my sleep score?
          </Text>
          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Contact Support */}
      <View style={tw`bg-white p-4 mt-4`}>
        <Text style={tw`text-gray-500 uppercase text-xs mb-3`}>
          Need More Help?
        </Text>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center py-3`}
        >
          <Text style={tw`text-base text-blue-500`}>Contact Support</Text>
          <Feather name="mail" size={20} color="blue" />
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

export default HelpScreen;
