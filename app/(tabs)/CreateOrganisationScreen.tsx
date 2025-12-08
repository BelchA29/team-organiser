import React from 'react';
import {useRouter} from "expo-router";
import { TextInput, View, StyleSheet, Button, Alert, Text } from 'react-native';
import { auth, db } from "../src/firebaseConfig";
import {styles} from "../styles/global";

function CreateOrganisationScreen() {
    const [orgName, setOrgName] = React.useState("");
    const [error, setError] = React.useState("")
    const router = useRouter();

    const handleCreateOrganisation = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const orgDocRef = db.collection("organisations").doc(orgName);
        try {
            const orgDoc = await orgDocRef.get()
            console.log("Got")
            if (orgDoc.exists()) {
                setError("This name is already in use")
            } else {
                setError("")
                await orgDocRef.set( {
                    name: orgName,
                    creator: user.uid,
                });
                console.log("Organisation added")
                const userDocRef = orgDocRef.collection("users").doc(user.uid)
                await userDocRef.set({
                    userId: user.uid
                })
                router.replace("/(tabs)/organisations")
            }

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            }
            console.error(error);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.container}>Create Organisation</Text>
            <TextInput 
                style={styles.textInput}
                onChangeText={setOrgName}
                value={orgName}
                placeholder='Club Name'
            />
            <Text>{error}</Text>
            <Button title="Create" onPress={handleCreateOrganisation}/>
        </View>
    )
}
export default CreateOrganisationScreen;