import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { useAuthContext } from '@/context/hooks/use-auth-context';
import Toast from 'react-native-toast-message';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';


export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const { sign_up, signup_state } = useAuthContext();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('Sahan Randika');
  const [email, setEmail] = useState('sahanrandika@gmail.com');
  const [age, setAge] = useState('20');
  const [occupation, setOccupation] = useState('SE');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('160');
  const [weight, setWeight] = useState('65');
  const [password, setPassword] = useState('sahan');
  const [confirmPassword, setConfirmPassword] = useState('sahan');
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match', position: 'bottom', swipeable: true });
      return;
    }

    setButtonLoading(true);
    try {
      const userData = {
        fullName,
        email,
        age: parseInt(age),
        occupation,
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        password
      };

      await sign_up?.(userData);
      

    } catch (error) {
      Toast.show({ type: 'error', text1: 'Registration failed. Please try again.', position: 'bottom', swipeable: true });
    } finally {
      setButtonLoading(false);
    }
  };

  const inputStyle = [
    styles.input, 
    { 
      color: colorScheme === 'dark' ? '#ffffff' : '#000000',
      placeholderTextColor: colorScheme === 'dark' ? '#ffffff' : '#000000'
    }
  ];

  useEffect(() => {
    
    if(signup_state && signup_state.success){
      Toast.show({ type: 'success', text1: 'Registration successful!', position: 'bottom', swipeable: true });
      // router.replace('/(tabs)')
    }

  }, [signup_state])
  

  return (
    // <ScrollView>
    <ThemedView style={styles.container}>
    <ScrollView style={{marginTop:40, marginBottom:30}}>
      <TextInput
        style={inputStyle}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        keyboardType='ascii-capable'
      />

      <TextInput
        style={inputStyle}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={inputStyle}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        style={inputStyle}
        placeholder="Occupation"
        value={occupation}
        onChangeText={setOccupation}
      />

      <TextInput
        style={inputStyle}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />

      <TextInput
        style={inputStyle}
        placeholder="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <TextInput
        style={inputStyle}
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <TextInput
        style={inputStyle}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={inputStyle}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {buttonLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <Button 
          title="Register" 
          onPress={handleRegister} 
          disabled={buttonLoading}
        />
      )}
      </ScrollView>
    </ThemedView>
    // </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    display:'flex',
    alignItems:'center',
    // marginTop:50
  },
  input: {
    height: 50,
    width: 250,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});