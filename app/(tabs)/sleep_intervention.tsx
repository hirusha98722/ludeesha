import React, { useState, useEffect, useRef } from 'react';
import { Alert, View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Modal, Linking } from 'react-native';
import axios, { endpoints } from "@/utils/axios";
import { useFocusEffect } from '@react-navigation/native'; // For resetting state when screen comes into focus
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';

type Message = {
  text: string;
  isBot: boolean;
};

interface ApiResponse {
  stress_level: string;
  emotion: string;
  intervention: string;
}

const questionSets = [
  [
    { question: "Hey, it’s pretty late! What’s keeping you up tonight?", type: "text" },
    { question: "If you could tell me your current thoughts, what would it be?", type: "text" },
    { question: "How has this been affecting your day so far?", type: "text" },
    { question: "What is your current preference for spending your time?", type: "text" },
  ],
  [
    { question: "Hey it’s bedtime, but you’re still up! What’s keeping you from falling asleep?", type: "text" },
    { question: "Have you noticed any recent changes in your sleep patterns or appetite?", type: "yesno", positiveAnswer: "Yes, I have definitely noticed some changes in how I am sleeping or how my appetite has been lately", negativeAnswer: "I have not noticed changes in my sleep patterns or appetite." },
    { question: "How do you usually cope with stress or emotional difficulties?", type: "text" },
    { question: "Would you like me to help you calm your body or your mind first?", type: "yesno", positiveAnswer: "I have had specific thoughts on my mind frequently.", negativeAnswer: "I have not had specific thoughts on my mind frequently." },
  ],
  [
    { question: "Hey there, what’s going on that’s stopping you from drifting off to sleep tonight?", type: "text" },
    { question: "Do you find it difficult to concentrate or make decisions lately?", type: "yesno", positiveAnswer: "Yes, I have been finding it difficult to concentrate or make decisions.", negativeAnswer: "No, I have been able to concentrate and make decisions just fine lately!" },
    { question: "How often do you feel overwhelmed by your daily tasks and responsibilities?", type: "text" },
    { question: "Have you noticed any recent changes in your interactions with family, friends, or colleagues?", type: "text" },
  ],
  [
    { question: "Hey...Is there something on your mind that you can’t stop thinking about tonight?", type: "yesno", positiveAnswer: "Yes, I can not stop thinking about something.", negativeAnswer: "No, there is nothing on my mind right now." },
    { question: "Do you feel like your thoughts are making it harder to relax and fall asleep?", type: "yesno", positiveAnswer: "Yes, my thoughts are making it hard to relax.", negativeAnswer: "No, I usually feel refreshed and recharged after resting." },
    { question: "How do you usually react to unexpected challenges or stressful situations?", type: "text" },
    { question: "Have you recently felt a loss of interest in activities you used to enjoy?", type: "yesno", positiveAnswer: "Yes I do not have interest in anything I do", negativeAnswer: "No, I am still enjoying the activities I used to." },
  ]
];

const SleepInterventionScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentQuestionSet, setCurrentQuestionSet] = useState<any[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [suggestionModalVisible, setSuggestionModalVisible] = useState<boolean>(false);
  const [questionVisible, setQuestionVisible] = useState<boolean>(true);
  const [interventionResponse, setInterventionResponse] = useState<ApiResponse | null>(null);
  const [suggestions, setSuggestions] = useState<{ videos: { linkName: string; link: string }[]; songs: { linkName: string; link: string }[] }>({ videos: [], songs: [] });
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const randomSet = questionSets[Math.floor(Math.random() * questionSets.length)];
    setCurrentQuestionSet(randomSet);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Reset all states when the screen is focused
      setMessages([]);
      setUserInput('');
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setInterventionResponse(null);
      setModalVisible(false);
      setQuestionVisible(true);
      setErrorMessage(null)
    }, [])
  );

  useEffect(() => {
    if (currentQuestionSet.length > 0) {
      addMessage(currentQuestionSet[currentQuestionIndex].question, true);
    }
  }, [currentQuestionSet, currentQuestionIndex]);

  const addMessage = (text: string, isBot: boolean) => {
    setMessages((prevMessages) => [...prevMessages, { text, isBot }]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const sendToBackend = async (updatedAnswers: string[]) => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>(
        'http://127.0.0.1:5001/predictIntervention',
        {
          answers: updatedAnswers.join(' '),
          user_level: 2,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setInterventionResponse(response.data);
      if (response.data) {
        setQuestionVisible(false);
      }
      setModalVisible(true); // Show the modal with suggestions
    } catch (error) {
      addMessage('Failed to submit answers. Please try again.', true);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextAnswer = () => {
    if (!userInput.trim()) return;

    const isValid = isValidInput(userInput);
    if (!isValid) {
      setErrorMessage('Please enter a valid answer');
      return;
    }

    setErrorMessage(null);

    const updatedAnswers = [...answers, userInput];
    setAnswers(updatedAnswers);
    addMessage(userInput, false);
    setUserInput('');

    if (currentQuestionIndex < currentQuestionSet.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      sendToBackend(updatedAnswers);
    }
  };

  const handleYesNoAnswer = (answer: 'Yes' | 'No') => {
    const question = currentQuestionSet[currentQuestionIndex];
    const formattedAnswer = answer === 'Yes' ? question.positiveAnswer : question.negativeAnswer;

    const updatedAnswers = [...answers, formattedAnswer];
    setAnswers(updatedAnswers);
    addMessage(formattedAnswer, false);
    setUserInput('');

    if (currentQuestionIndex < currentQuestionSet.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      sendToBackend(updatedAnswers);
    }
  };

  const handleRestart = () => {
    // Reset the state to clear previous answers and data
    setMessages([]);
    setUserInput('');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setInterventionResponse(null);
    setModalVisible(false);

    // Randomly select a new question set
    const randomSet = questionSets[Math.floor(Math.random() * questionSets.length)];
    setCurrentQuestionSet(randomSet);
    setQuestionVisible(true);  // Ensure the questions are visible
  };


  const isValidInput = (text: string): boolean => {
    const words = text.split(' ');

    return words.every(word => {
      // Check if the word has at least one letter
      if (!/[a-zA-Z?]/.test(word)) return false;

      // Ensure word length is at least 3
      // if (word.length < 3) return false;

      // Check if it consists of only repeated letters (invalid case)
      if (/^([a-zA-Z])\1+$/.test(word)) return false;

      // Ensure 't' represents repeating letters
      if (/t{3,}/.test(word)) return false;

      return true;
    });
  };


  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSaveDetails = async (emotion: string, stress_level: string, intervention: string) => {
    console.log("%%%%%%%%");
    console.log("User id");
    console.log("Date and time");
    console.log("emotion : " + emotion);
    console.log("stress_level : " + stress_level);
    console.log("intervention : " + intervention);
    console.log("%%%%%%%%");
    const response = await axios.post(endpoints.sleepIntervention.save, {
      userId: "12",
      dateAndTime: new Date(),
      emotion: emotion,
      stress_level: stress_level,
      intervention: intervention
    },
      { headers: { 'Content-Type': 'application/json' } });
    console.log("%%%%%%%%");
    console.log(response);
    console.log("%%%%%%%%");
    if (response.status === 201) {
      Alert.alert("Success", "Record saved successfully");
      setQuestionVisible(false);
      setModalVisible(false);
    } else {
      Alert.alert("Error", "Failed to save record");
    }

  };

  const handleSuggestion = (emotion: string) => {
    setSuggestionModalVisible(true);
    setModalVisible(false);
    const emotionSuggestions: { [key: string]: { videos: { linkName: string; link: string }[]; songs: { linkName: string; link: string }[] } } = {
      Happy: {
        videos: [
          { linkName: "Affirmations before sleep ", link: "https://youtube.com/shorts/Lk-cNWmADaQ?si=hLzsUdm_-lf9GbU9" },
          { linkName: "Affirmations", link: "https://youtube.com/shorts/MFybvVd5kjU?si=pXNaPryWA8JSkFNK" }
        ],
        songs: []
      },
      Calm: {
        videos: [
          { linkName: "Ocean wave", link: "https://youtube.com/shorts/BirAwHctifo?si=z3aVM_-Dy2O9KAO0" },
          { linkName: "Rain on leaves", link: "https://youtu.be/Go4YMAws6BU?si=SnORRwbC4YBKIXX-" }
        ],
        songs: []
      },
      Anxious: {
        videos: [
          { linkName: "4 2 6 breathing exercise for anxiety", link: "https://youtube.com/shorts/fiW-kErshcU?si=Vri8jZZLQLUMPcTp" },
          { linkName: "Body Tension Releas", link: "https://youtube.com/shorts/Y4tZywA2k6M?si=mxTMFlMHHj5aUcOk" }
        ],
        songs: []
      },
      Sad: {
        videos: [
          { linkName: "Heart-Centered Breathing 1", link: "https://youtube.com/shorts/u1SNUuZd6DA?si=WvNi1vrRsLT-28_Y" },
          { linkName: "Heart-Centered Breathing 2", link: "https://youtube.com/shorts/Z5xErM57JY4?si=svSzIs-DTXSXZmNC" }
        ],
        songs: []
      },
      Frustrated: {
        videos: [
          { linkName: "Quick Frustration Reels", link: "https://youtube.com/shorts/zOi56YybbvY?si=Y8aM19-8x6QIRHWP" },
          { linkName: "Mental “Let-It-Go” Practice", link: "https://youtu.be/AJ0DQR6M1PM?si=k9mcH6AkYxy23Uat" }
        ],
        songs: []
      },
      Stressed: {
        videos: [
          { linkName: "Deep Relaxation Technique", link: "https://youtube.com/shorts/fW3uegzKf5M?si=v4O17AHVViV9rNAw" },
          { linkName: "Mindful Body Check-in", link: "https://youtu.be/SK8v_R-5p90?si=LmZsiI6uhrYyxcBx" },
          { linkName: "Visualization to Lower Cortisol", link: "https://youtube.com/shorts/hPqLwL8ZpKo?si=bnm7bMyJrxRCB539" }
        ],
        songs: []
      }
    };

    setSuggestions(emotionSuggestions[emotion] || { videos: [], songs: [] });
  };

  const SuggestionModal = ({ visible, onClose, suggestions }: { visible: boolean; onClose: () => void; suggestions: { videos: { linkName: string; link: string }[]; songs: { linkName: string; link: string }[] } }) => {
    return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {suggestions.videos.length > 0 && <Text style={styles.modalText}>Suggested Videos:</Text>}
            {suggestions.videos.map((video, index) => (
              <TouchableOpacity key={index} onPress={() => Linking.openURL(video.link)}>
                <Text style={styles.linkNameText}>{video.linkName}</Text>
                <Text style={styles.linkText}>{video.link}</Text>
              </TouchableOpacity>
            ))}

            {suggestions.songs.length > 0 && <Text style={styles.modalText}>Suggested Songs:</Text>}
            {suggestions.songs.map((song, index) => (
              <TouchableOpacity key={index} onPress={() => Linking.openURL(song.link)}>
                <Text style={styles.linkNameText}>{song.linkName}</Text>
                <Text style={styles.linkText}>{song.link}</Text>
              </TouchableOpacity>
            ))}

            <Button title="Close" onPress={onClose} />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.isBot ? styles.botRow : styles.userRow]}>
            {item.isBot && <Icon1 name="robot" size={28} color="#4A90E2" />}
            <View style={item.isBot ? styles.botMessage : styles.userMessage}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
            {!item.isBot && <Icon name="user" size={28} color="#7393B3" />}
          </View>
        )}
      />

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {currentQuestionSet.length > 0 && questionVisible ? (
        <>
          {currentQuestionSet[currentQuestionIndex].type === 'text' && (
            <>
              <Text style={styles.question}>{currentQuestionSet[currentQuestionIndex].question}</Text>
              <TextInput
                style={styles.input}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Type your answer..."
              />

              <Button title={loading ? 'Processing...' : 'Send'} onPress={handleTextAnswer} disabled={loading || userInput.trim() === ''} />
            </>
          )}

          {currentQuestionSet[currentQuestionIndex].type === 'yesno' && (
            <>
              <Text style={styles.question}>{currentQuestionSet[currentQuestionIndex].question}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleYesNoAnswer('Yes')}
                >
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleYesNoAnswer('No')}
                >
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      ) :
        (
          <View style={styles.resetContainer}>
            <Text style={styles.informationText}>
              You have completed all the questions or there's an issue with the questions.
            </Text>
            <Button
              title="Restart and Get New Questions"
              onPress={() => handleRestart()}
            />
          </View>
        )
      }


      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {interventionResponse && (
              <>
                <Text style={styles.modalTitle}> Your Wellness Insight</Text>

                <View style={styles.infoRow}>
                  <Icon name="smile-o" size={20} color="#ff9800" />
                  <Text style={styles.modalText}>Emotion: {interventionResponse.emotion}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="heartbeat" size={20} color="#f44336" />
                  <Text style={styles.modalText}>Stress Level: {interventionResponse.stress_level}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="lightbulb-o" size={20} color="#4caf50" />
                  <Text style={styles.modalText}>Suggested: {interventionResponse.intervention}</Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButtonStyled, { backgroundColor: '#4caf50' }]}
                    onPress={() =>
                      handleSaveDetails(
                        interventionResponse.emotion,
                        interventionResponse.stress_level,
                        interventionResponse.intervention
                      )
                    }
                  >
                    <Icon name="save" size={16} color="#fff" />
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButtonStyled, { backgroundColor: '#2196f3' }]}
                    onPress={() => handleSuggestion(interventionResponse.emotion)}
                  >
                    <Icon name="magic" size={16} color="#fff" />
                    <Text style={styles.modalButtonText}>Suggestion</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButtonStyled, { backgroundColor: '#9e9e9e' }]}
                    onPress={handleCloseModal}
                  >
                    <Icon name="times" size={16} color="#fff" />
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>


      <SuggestionModal
        visible={suggestionModalVisible}
        onClose={() => setSuggestionModalVisible(false)}
        suggestions={suggestions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E5ECF4',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    maxWidth: '75%',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 0,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    maxWidth: '75%',
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 0,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    color: '#000',
  },
  avatar: {
    fontSize: 24,
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  question: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  resetContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  informationText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 12,
    color: '#333',
  },
  modalViewButton: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    width: '100%',
    marginVertical: 6,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  modalActions: {
    marginTop: 20,
    flexDirection: 'column',
    gap: 10,
  },
  modalButtonStyled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
  linkNameText: {
    color: 'black',
    marginBottom: 2,
  },
});


export default SleepInterventionScreen;