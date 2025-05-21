import React, { useContext, useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAuthContext } from '@/context/hooks/use-auth-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ThemedView } from '../ThemedView';

// import { AuthContext } from '@/auth/AuthProvider';

export default function LoginScreen() {

  const colorScheme = useColorScheme()

  const router= useRouter()
  
  const { sign_in, user, loading } = useAuthContext()


  // const [email, setEmail] = useState('sysadmin@edfoci.onmicrosoft.com');
  // const [password, setPassword] = useState('qlzwinkbwrseqgnh');

  const [email, setEmail] = useState('sahanrandika@gmail.com');
  const [password, setPassword] = useState('sahan');

  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    
    if(user && buttonLoading){
      setButtonLoading(false);
      Toast.show({type:'success',text1:"Login Success", position:'bottom', swipeable:true})
    }
  }, [user,buttonLoading])
  

  const handleLogin = async () => {
    
    setButtonLoading(true);

    try{

      await sign_in?.(email, password);

    } catch (error) {
      Toast.show({type:'error',text1:'Login failed. Please try again.',position:'bottom', swipeable:true})

    } finally {
      setButtonLoading(false);
    }
    
  };

  return (
    <ThemedView style={styles.container}>
      <TextInput
        style={[styles.input, { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }]}
        placeholder="Email"
        placeholderTextColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }]}
        placeholder="Password"
        placeholderTextColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {buttonLoading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
        ):(
          <Button title="Sign In"
            onPress={handleLogin} 
            disabled={buttonLoading}
            />
        )
      }
   </ThemedView>
  );
}


const styles = StyleSheet.create({

  container: {
    padding:10,
    justifyContent: 'center',
    display:'flex',
    alignItems:'center',
    marginTop:50
  },
  input: {
    height: 50,
    width:250,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});