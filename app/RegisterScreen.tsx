import React from 'react';
import { TextInput, View, Button, Alert, Text } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import {auth, db} from "./src/firebaseConfig";

import {styles} from './styles/global'

function RegisterScreen() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [loading, setLoading] = React.useState(false)
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("")
    const router = useRouter()

    const handleRegister = async () => {
        setLoading(true);
        if (password != confirmPassword) {
            setErrorMessage("Passwords do not match")
            setLoading(false)
            return
        }
        try {
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

            const user = userCredentials.user;
            console.log("User registreed: ", user.email);

            const userRef = db.collection("users").doc(user.uid)
            userRef.set( {
                displayName: firstName + ' ' + lastName
            })
            
            Alert.alert("Success", `Welcome, ${firstName} ${lastName}`);
            router.replace('./(tabs)/organisations');
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
            <View style={{paddingTop:50, alignItems: 'center'}}>
                <Text style={[styles.headerText, {color: '#FFF'}]}>Register</Text>
            </View>

            <Text style={styles.inputLabel}>Email: </Text>
            <TextInput 
                onChangeText={setEmail} 
                value={email}
                placeholder='abe@mail.com'
                style={styles.textInput}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>First Name: </Text>
            <TextInput 
                onChangeText={setFirstName}
                value={firstName}
                placeholder='John'
                style={styles.textInput}
                autoCapitalize='words'
            />

            <Text style={styles.inputLabel}>Surname: </Text>
            <TextInput 
                onChangeText={setLastName}
                value={lastName}
                placeholder='Doe'
                style={styles.textInput}
                autoCapitalize='words'
            />

            <Text style={styles.inputLabel}>Password: </Text>
            <TextInput 
                onChangeText={setPassword} 
                value={password}
                placeholder='********'
                style={styles.textInput}
                secureTextEntry
            />
            <Text style={styles.inputLabel}>Confirm Password: </Text>
            <TextInput 
                onChangeText={setConfirmPassword} 
                value={confirmPassword}
                placeholder='********'
                style={styles.textInput}
                secureTextEntry
            />
            <Button title={loading ? "Registering..." : "Register"}
            onPress={handleRegister}
            disabled={loading}
            />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <View style={{flex:1}}></View>
            <View style={{paddingBottom: 50}}>
                <Button title="Already have an account? Login"
                onPress={() => router.push('./login')}
                color="grey"
                />
            </View>
        </View>
    );
}

export default RegisterScreen;