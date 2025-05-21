import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Keyboard, TouchableWithoutFeedback,
  Alert
} from 'react-native';

const MoodDetailsScreen = ({ route, navigation }) => {
  const [reason, setReason] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [moodData, setMoodData] = useState(null);
  const [photoUri, setPhotoUri] = useState('');
  const [mood, setMood] = useState('');

  // Initialize state based on route params
  useEffect(() => {
    if (route.params) {
      if (route.params.moodData) {
        // Scenario 1: Viewing an existing record
        const data = route.params.moodData;
        setMoodData(data);
        setReason(data.note || '');
        setPhotoUri(data.image_url || '');
        setMood(data.mood || '');
        setIsViewMode(true);
      } else if (route.params.photoUri && route.params.mood) {
        // Scenario 2: Creating a new record
        setPhotoUri(route.params.photoUri);
        setMood(route.params.mood);
        setIsViewMode(false);
      }
    }
  }, [route.params]);

  // Add current date formatting
  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const dayName = days[now.getDay()];
    return dayName;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return getCurrentDate();

    try {
      const date = new Date(timestamp);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    } catch (error) {
      console.error("Error formatting date:", error);
      return getCurrentDate();
    }
  };

  const date = moodData?.createdAt ? formatTimestamp(moodData.createdAt) : getCurrentDate();

  const uploadToCloudinary = async (uri) => {
    const cloudName = "dhgqbkulm"; // Replace with your Cloudinary cloud name
    const uploadPreset = "mood_detection"; // Replace with your upload preset

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg', // You might need to detect the actual image type
      name: `mood_${new Date().getTime()}.jpg`
    });
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return data.secure_url; // Return the secure URL of the uploaded image
      } else {
        console.error('Cloudinary upload failed:', data);
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setIsUploading(true);

    try {
      // 1. Upload image to Cloudinary (only for new records)
      let cloudinaryUrl = photoUri;
      if (!isViewMode) {
        cloudinaryUrl = await uploadToCloudinary(photoUri);
      }

      // 2. Create JSON payload with the Cloudinary URL
      const payload = {
        mood: mood,
        note: reason,
        imageUrl: cloudinaryUrl
      };

      // If we're editing an existing record, include its ID
      if (isViewMode && moodData && moodData.id) {
        payload.id = moodData.id;
      }

      // 3. Save data to your database - use PUT for update, POST for new
      const endpoint = isViewMode
        ? `http://192.168.8.140:5000/emotions/${moodData.id}`
        : "http://192.168.8.140:5000/emotions";

      const method = isViewMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Mood saved successfully:", result);
        Alert.alert(
          "Success",
          isViewMode ? "Mood updated successfully" : "Mood saved successfully",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        console.error("Failed to save mood:", result);
        Alert.alert("Error", "Failed to save your mood. Please try again.");
      }
    } catch (error) {
      console.error("Error during save process:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!moodData || !moodData.id) return;

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this mood entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUploading(true);
              const response = await fetch(`http://192.168.8.140:5000/emotions/${moodData.id}`, {
                method: "DELETE",
                headers: {
                  'Accept': 'application/json'
                }
              });

              if (response.ok) {
                Alert.alert(
                  "Success",
                  "Mood entry deleted successfully",
                  [{ text: "OK", onPress: () => navigation.goBack() }]
                );
              } else {
                const errData = await response.json();
                Alert.alert("Error", "Failed to delete entry. Please try again.");
                console.error("Failed to delete:", errData);
              }
            } catch (error) {
              console.error("Error deleting mood:", error);
              Alert.alert("Error", "An error occurred. Please try again.");
            } finally {
              setIsUploading(false);
            }
          }
        }
      ]
    );
  };


  // Handle navigation to the context page
  const navigateToContext = () => {
    if (moodData) {
      navigation.navigate('MoodIntevention', { moodData: moodData });
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.dayText}>{date}</Text>
            </View>
            <View style={styles.content}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.moodSection}>
                <Text style={styles.moodTitle}>
                  {isViewMode ? `You were ${mood}` : `Today you're ${mood}`}
                </Text>
                <Text style={styles.moodQuestion}>
                  {isViewMode ? "The reason was:" : "What is the reason?"}
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    isViewMode && !isUploading && styles.readOnlyInput
                  ]}
                  placeholder={!isViewMode ? "Type here.." : ""}
                  multiline
                  value={reason}
                  onChangeText={setReason}
                  placeholderTextColor="#999"
                  editable={!isViewMode || isUploading}
                />
                <View style={styles.buttonContainer}>
                  {!isViewMode && (
                    <>
                      <TouchableOpacity
                        style={[styles.saveButton, isUploading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isUploading}
                      >
                        <Text style={styles.saveButtonText}>
                          {isUploading ? 'Uploading...' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.buttonContainer}>
                {isViewMode && (

                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDelete}
                      disabled={isUploading}
                    >
                      <Text style={styles.deleteButtonText}>
                        {isUploading ? 'Processing...' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={navigateToContext}
                      disabled={isUploading}
                    >
                      <Text style={styles.nextButtonText}>
                        Next
                      </Text>
                    </TouchableOpacity>
                  </View>

                )}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  dayText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Add extra padding at bottom
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: '80%',
    height: 200, // Fixed height instead of percentage
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  moodSection: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  moodTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  moodQuestion: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginTop: 20,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    minHeight: 100,
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },

  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },

  saveButton: {
    backgroundColor: '#A5EEB8',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#7EC8E3',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FFB6B6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,

  },
  deleteButtonText: {
    fontSize: 16,
    color: '#333',
  },

  nextButton: {
    backgroundColor: '#A5EEB8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#333',
  },

  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  }
});

export default MoodDetailsScreen;