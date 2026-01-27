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
                router.replace("/");
            }).catch((error) => {
                if (error instanceof FirebaseError) {
                    console.error("Login error: ", error.code)
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
        <View style={[styles.container, {alignItems:'center', justifyContent:'center', paddingTop:50}]}>
            <Text style={[styles.headerText, {color:'#FFF'}]}>Login</Text>
            
            <View style={{width: '100%'}}>
            <Text style={styles.inputLabel}>Email: </Text>
                <TextInput 
                    onChangeText={setEmail} 
                    value={email}
                    placeholder='abc@mail.com'
                    style={styles.textInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            <View style={{width: '100%'}}>
                <Text style={styles.inputLabel}>Password: </Text>
                <TextInput 
                    onChangeText={setPassword}
                    placeholder="********" 
                    value={password}
                    style={styles.textInput}
                    secureTextEntry
                />
            </View>
            <Button title={loading ? "Loading..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
            />
            <Text style={styles.errorText}>{errorMessage}</Text>

            <View style={{flex:1}}></View>
            <View style={{paddingBottom: 50}}>
                <Button title="Don't have an account? Register"
                onPress={() => router.push('/RegisterScreen')}
                color="grey"
                disabled={loading}
                />
            </View>
        </View>
    );
};