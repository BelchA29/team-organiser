import React from 'react';
import {useRouter} from "expo-router";
import { TextInput, View, StyleSheet, Button, Alert, Text } from 'react-native';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'

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
        const userDocRef = doc(db, 'users', user.uid)
        try {
            const userDocs = await getDoc(userDocRef);
            data = userDocs.data() as UserDetails;
            if (data.defaultOrganisation === null) {
                data.defaultOrganisation = 0;
            }
            const newOrg: Organisation = {name: orgName, teams:[], creator: user.uid}
            data.organisations.push(newOrg)
            await updateDoc(userDocRef, {
                defaultOrganisation: data.defaultOrganisation,
                organisations: data.organisations
            });
            console.log("Organisation added")
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