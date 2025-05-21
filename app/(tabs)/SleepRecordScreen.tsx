import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import { Provider } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios, { endpoints } from "@/utils/axios";
import tw from "twrnc";

const SleepRecordScreen = () => {
  const [hoursSlept, setHoursSlept] = useState("");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [stepCount, setStepCount] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    const response = await axios.post(endpoints.sleepPrediction.addRecord, {
      date: date,
      sleepDuration: hoursSlept,
      dailyStepCount: stepCount,
    });
    if (response.status === 201 || response.status === 200) {
      Alert.alert("Success", "Record saved successfully");
    } else {
      Alert.alert("Error", "Failed to save record");
    }
  };

  return (
    <Provider>
      <View style={tw`flex-1 bg-white px-6 pt-12`}>
        <Text style={tw`text-2xl font-bold text-center mb-6`}>
          Sleep Record
        </Text>

        {/* Hours Slept Input */}
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4 bg-gray-100`}
          placeholder="Hours Slept"
          keyboardType="numeric"
          value={hoursSlept}
          onChangeText={setHoursSlept}
        />

        {/* Step Count Input */}
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4 bg-gray-100`}
          placeholder="How many steps did you walk?"
          keyboardType="numeric"
          value={stepCount}
          onChangeText={setStepCount}
        />

        {/* Date Picker */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <TextInput
            style={tw`border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4 bg-gray-100`}
            value={date.toDateString()}
            editable={false}
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Description Input */}
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-4 py-3 text-lg mb-6 bg-gray-100 h-24`}
          placeholder="Describe your day..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={tw`bg-blue-500 rounded-lg py-3`}
          onPress={handleSave}
        >
          <Text style={tw`text-white text-lg font-semibold text-center`}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </Provider>
  );
};

export default SleepRecordScreen;
