import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { io } from 'socket.io-client';
import * as ImageManipulator from 'expo-image-manipulator';

// API URL configuration
const SERVER_URL = 'http://192.168.8.140:5000';
const API_URL = 'http://192.168.8.140:5000/detect_emotion';

export default function MoodCamera() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('Unknown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceResults, setFaceResults] = useState<any[]>([]);

  const [showDialog, setShowDialog] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<any>(null);


  const cameraRef = useRef<CameraView>(null);
  const socketRef = useRef<any>(null);
  const frameTimerRef = useRef<number | null>(null);
  const processingFrameRef = useRef<boolean>(false);
  const navigation = useNavigation();

  // Set up socket connection
  useEffect(() => {
    // Initialize socket
    socketRef.current = io(SERVER_URL);

    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      stopStreaming();
    });

    socketRef.current.on('emotion_result', (data) => {
      processingFrameRef.current = false;

      if (data.status === 'success') {
        setFaceResults(data.results || []);


        // If face detected, set the current emotion and show dialog
        if (data.results && data.results.length > 0) {
          setCurrentEmotion(data.results[0].emotion);

          // Stop streaming and show dialog when face is detected
          if (!isStreaming && !showDialog) {
            handleFaceDetected(data.results[0].emotion);
          }

        } else {
          setCurrentEmotion('No face detected');
        }
      } else {
        setError(data.message || 'Error processing image');
      }
    });

    // Clean up on unmount
    return () => {
      stopStreaming();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };

  }, [isStreaming, showDialog]);

  const handleFaceDetected = async (emotion: string) => {
    // Stop streaming
    stopStreaming();

    try {
      // Capture the current frame
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          exif: false,
        });

        // Convert image to base64
        const base64Image = await convertToBase64(photo.uri);

        // Store the captured frame data
        setCapturedFrame({
          photoUri: photo.uri,
          mood: emotion,
          base64Image: base64Image
        });

        // Show the dialog
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  };


  const stopStreaming = () => {
    setIsStreaming(false);
    if (frameTimerRef.current !== null) {
      clearTimeout(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const convertToBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const detectEmotion = async (base64Image: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error detecting emotion:', error);
      throw error;
    }
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const captureFrame = async () => {
    console.log('Capturing frame...');

    if (!cameraRef.current || processingFrameRef.current || isStreaming || !socketRef.current?.connected) {
      console.log('cameraRef:', !cameraRef.current, 'processingFrame:', processingFrameRef.current, 'isStreaming:', !isStreaming, 'socketRef:', !socketRef.current?.connected);

      return;
    }

    try {
      processingFrameRef.current = true;

      // Take a photo with the camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true, // Skip additional processing to reduce delay
        exif: false
      });

      // Resize the image to reduce bandwidth
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 320 } }], // Smaller size for faster processing
        { format: 'jpeg', compress: 0.6, base64: true }
      );

      // Send the frame to the server
      if (manipResult.base64) {
        socketRef.current.emit('frame', {
          image: `data:image/jpeg;base64,${manipResult.base64}`
        });
      }

    } catch (error: any) {
      console.error('Failed to capture frame:', error);
      processingFrameRef.current = false;
    }

    // Schedule next frame capture with a delay to control frame rate
    if (isStreaming) {
      frameTimerRef.current = setTimeout(captureFrame, 200) as unknown as number;
    }
  };

  const toggleStreaming = async () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      setIsStreaming(true);
      setError(null);
      setFaceResults([]);

      // Start capturing frames
      captureFrame();
    }
  };


  const handleContinue = async () => {
    if (capturedFrame) {
      setShowDialog(false);

      // Process the captured frame
      try {
        setLoading(true);

        // Call the emotion detection API to get the processed image
        const result = await detectEmotion(capturedFrame.base64Image);

        // Navigate to the detail screen
        navigation.navigate('MoodDetailScreen', {
          photoUri: capturedFrame.photoUri,
          mood: capturedFrame.mood,
          processedImageBase64: result.processed_image || null
        });

      } catch (error: any) {
        console.error('Failed to process image:', error);
        setError(error.message || 'Error processing image. Please try again.');
      } finally {
        setLoading(false);

        setCapturedFrame(null);
      }
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setCapturedFrame(null);
  };


  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        autofocus="on"
      >
        {/* Render face detection rectangles over camera view */}
        {faceResults.map((face, index) => (
          <View
            key={index}
            style={[
              styles.faceBox,
              {
                left: face.face.x,
                top: face.face.y,
                width: face.face.width,
                height: face.face.height
              }
            ]}
          >
            <Text style={styles.faceLabel}>{face.emotion}</Text>
          </View>
        ))}

        <View style={styles.emotionContainer}>
          <Text style={styles.emotionText}>
            {faceResults.length > 0
              ? `Detected: ${faceResults.length} face(s) - ${currentEmotion}`
              : 'No faces detected'}
          </Text>
        </View>

        <View style={styles.controlsContainer}>

          {/* Camera reverse button commented out as requested
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity> */}


          <TouchableOpacity
            style={[styles.streamButton, isStreaming ? styles.streamingActive : {}]}
            onPress={toggleStreaming}

            disabled={showDialog}
          >
            {/* Icon based start/stop stream button */}
            <Ionicons
              name={isStreaming ? "stop-circle" : "videocam"}
              size={32}
              color="white"
            />
          </TouchableOpacity>

          {/* Capture button commented out as requested

          {loading ? (
            <View style={styles.captureButton}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={loading || isStreaming}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

          )} */}

        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </CameraView>


      {/* Face detection dialog */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDialog}
        onRequestClose={handleCancel}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Face Detected!</Text>
            <Text style={styles.modalText}>
              Detected emotion: {capturedFrame?.mood || 'Unknown'}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.continueButton]}
                onPress={handleContinue}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  faceBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
  },
  faceLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#00FF00',
    fontSize: 12,
    padding: 2,
    position: 'absolute',
    top: -20,
    left: 0,
  },
  emotionContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  emotionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamButton: {

    width: 70,
    height: 70,
    borderRadius: 35,

    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamingActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
  },
  streamButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 50,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
  },
  continueButton: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: 'white',
  },

});