import axios, { endpoints } from "@/utils/axios";
import { useFocusEffect } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SleepRecord } from "./SleepPredictionScreen";

const getMarkedDates = (records: SleepRecord[]) => {
  let markedDates: { [date: string]: any } = {};
  records.forEach(({ date }) => {
    markedDates[date] = { selected: true, selectedColor: "#fbc02d" };
  });
  return markedDates;
};

export default function SleepTracker() {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sleepDuration, setSleepDuration] = useState<string>("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  useFocusEffect(
    React.useCallback(() => {
      const fetchSleepRecords = async () => {
        try {
          const response = await axios.get(
            endpoints.sleepPrediction.getAllRecords
          );
          const records: SleepRecord[] = response.data.map((item: any) => ({
            id: item._id, // Using MongoDB _id
            date: item.date.split("T")[0],
            sleepDuration: item.sleepDuration,
          }));
          setSleepRecords(records);
        } catch (error) {
          console.error("Error fetching sleep records", error);
        }
      };

      fetchSleepRecords();
    }, [])
  );

  const handleDayPress = (day: { dateString: string }) => {
    if (day.dateString > today) return; // Prevent selecting future dates

    setSelectedDate(day.dateString);
    const record = sleepRecords.find((r) => r.date === day.dateString);
    setSleepDuration(record ? String(record.sleepDuration) : "");
    if (record?.id) setSelectedRecordId(record.id);

    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedDate) return;

    try {
      if (selectedRecordId) {
        // Update existing record using ID
        await axios.put(
          `${endpoints.sleepPrediction.updateRecord}/${selectedRecordId}`,
          {
            sleepDuration: Number(sleepDuration),
          }
        );
      } else {
        // Create new record
        const response = await axios.post(endpoints.sleepPrediction.addRecord, {
          date: selectedDate,
          sleepDuration: Number(sleepDuration),
        });

        setSleepRecords([
          ...sleepRecords,
          {
            id: response.data._id,
            date: selectedDate,
            sleepDuration: Number(sleepDuration),
          },
        ]);
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error updating record", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecordId) return;

    try {
      await axios.delete(
        `${endpoints.sleepPrediction.deleteRecord}/${selectedRecordId}`
      );
      setSleepRecords(sleepRecords.filter((r) => r.id !== selectedRecordId));
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting record", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/fire.png")} style={styles.icon} />
      <Text style={styles.title}>Sleep Tracker</Text>

      <Calendar
        markedDates={getMarkedDates(sleepRecords)}
        onDayPress={handleDayPress}
        style={{
          width: 350,
          height: 350,
          borderRadius: 10,
          padding: 50,
          backgroundColor: "white",
        }}
        theme={{
          todayTextColor: "#ff5722",
          arrowColor: "#ff5722",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Sleep Duration ({selectedDate})
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter sleep duration (hrs)"
              keyboardType="numeric"
              value={sleepDuration}
              onChangeText={setSleepDuration}
            />

            <View style={styles.buttonRow}>
              <Button title="Update" onPress={handleUpdate} color="#4CAF50" />
              {selectedRecordId && (
                <Button title="Delete" onPress={handleDelete} color="#F44336" />
              )}
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  icon: {
    width: 60,
    height: 70,
    marginTop: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  closeText: {
    marginTop: 10,
    color: "#ff5722",
    fontWeight: "bold",
  },
});
