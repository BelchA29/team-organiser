import { styles } from "./styles/global";
import {View, Text, Button, TextInput } from "react-native";
import React from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import {auth, db} from "./src/firebaseConfig";

export default function login() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const router = useRouter();

    async function handleLogin() {
        setLoading(true)
            signInWithEmailAndPassword(auth, email, password).then(() => {
                console.log("Signed in")
                router.replace("/(tabs)/organisations");
            }).catch((error) => {
                if (error instanceof FirebaseError) {
                    console.log(error.code)
                    switch (error.code) {
                        case "auth/invalid-credential":
                            setErrorMessage("Invalid email or password");
                            break;
                        case "auth/missing-password":
                            setErrorMessage("Invalid password entry");
                            break;
                        case "auth/invalid-email":
                            setErrorMessage("Please enter a valid email")
                            break;
                        default:
                            setErrorMessage("Error when logging in");
                            break;

                    }
                } else if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage("Unknown error");
                }
            })

        setLoading(false);
    } 

    return (
        <View style={styles.container}>
            <Text style={styles.container}>Login</Text>
            
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
            <Button title={loading ? "Loading..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
            />
            <Text>{errorMessage}</Text>
        </View>
    );
};