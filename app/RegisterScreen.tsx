import React from 'react';
import { TextInput, View, Button, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { setUser } from "@/app/services/firebaseData/registerData" 

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
        const user = await setUser(email, password, firstName + ' ' + lastName)
        if (typeof user == "string") {
            setErrorFlag(true)
            setErrorMessage(user)
            setLoading(false)
            return
        }

        Alert.alert("Success", `Welcome, ${firstName} ${lastName}`);
        router.replace('./(tabs)/organisations');
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