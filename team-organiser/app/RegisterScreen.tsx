import React from 'react';
import { TextInput, View, Button, Alert, Text } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, User } from "firebase/auth";
import { useRouter } from 'expo-router';
import { FirebaseError, initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore'

import {styles} from './styles/global'

function RegisterScreen() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false)
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("")
    const router = useRouter()

    const db = getFirestore();

    const handleRegister = async () => {
        setLoading(true);

        try {
            const auth = getAuth()
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

            const user = userCredentials.user;
            console.log("User registreed: ", user.email);
            Alert.alert("Success", `Welcome, ${user.email}`);
            router.replace('/(tabs)/organisations');
        } catch (error: unknown) {
            if (error instanceof FirebaseError) {
                console.error("Registration error: ", error.code, error.message)
                setErrorFlag(true)

                switch (error.code) {
                    case 'auth/email-already-in-use':
                        setErrorMessage("This email is already in use.");
                        break;
                        case 'auth/invalid-email':
                            setErrorMessage('Please enter a valid email address.');
                            break;
                        case 'auth/weak-password':
                            setErrorMessage("Password should be at least 6 characters");
                            break;
                        case 'auth/network-request-failed':
                            setErrorMessage("Network error. Please check your internet connection");
                            break;
                        default:
                            setErrorMessage(`Registration failed: ${error.message}`);
                            break;
                }
            } else {
                console.error(error);
            }
        }
        setLoading(false)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.container}>Register</Text>
            
            <TextInput 
                onChangeText={setEmail} 
                value={email}
                placeholder='Email'
                style={styles.textInput}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput 
                onChangeText={setPassword} 
                value={password}
                placeholder='Password'
                style={styles.textInput}
                secureTextEntry
            />
            <Button title={loading ? "Registering..." : "Register"}
            onPress={handleRegister}
            disabled={loading}
            />
            <Text>{errorMessage}</Text>
            {/* <Button title="Already have an account? Login"
            onPress={() => navigation.navigate('Login')}
            color="grey"
            /> */}
        </View>
    );
}

export default RegisterScreen;