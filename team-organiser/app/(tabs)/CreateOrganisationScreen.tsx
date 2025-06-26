import React from 'react';
import {useRouter} from "expo-router";
import { TextInput, View, StyleSheet, Button, Alert, Text } from 'react-native';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'

import {styles} from "../styles/global";

function CreateOrganisationScreen() {
    const [orgName, setOrgName] = React.useState("");
    const router = useRouter();
    const db = getFirestore();
    const auth = getAuth();

    const handleCreateOrganisation = async () => {
        const user = auth.currentUser;
        if (!user) return;
        let data: UserDetails;
        const orgDocRef = doc(db, 'organisations', orgName)
        try {
            const orgDocs = setDoc(orgDocRef, {
                name: orgName,
                creator: user.uid,
                teams: [],
                users: [user.uid],
            }, {merge: true});
            console.log("Organisation added")
            router.replace("/(tabs)/organisations")
        } catch (error) {
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
            <Button title="Create" onPress={handleCreateOrganisation}/>
        </View>
    )
}
export default CreateOrganisationScreen;