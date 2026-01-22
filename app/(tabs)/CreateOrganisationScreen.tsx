import React from 'react';
import {useRouter} from "expo-router";
import { TextInput, View, StyleSheet, Button, Alert, Text } from 'react-native';
import { auth } from "../src/firebaseConfig";
import {styles} from "../styles/global";
import { addUserToOrg, getOrg, setOrg } from '@/app/services/firebaseData/organisationData';
import { getUser } from '../services/firebaseData/userData';

function CreateOrganisationScreen() {
    const [orgName, setOrgName] = React.useState("");
    const [error, setError] = React.useState("")
    const router = useRouter();

    const handleCreateOrganisation = async () => {
        const user = auth.currentUser
        if (!user) {
            setError("No authenticated user");
            return;
        }
        const orgDoc = await getOrg(orgName)
        if (orgDoc) {
            setError("This name is already in use")
            return
        } 
        const newOrg = setOrg(orgName)
        if (typeof newOrg == 'string') {
            setError(newOrg)
            return
        }
        
        const userDetails = await getUser(user.uid)
        if (typeof userDetails == "string") {
            console.error(userDetails)
            setError(userDetails)
            return 
        }
        const addedUser = addUserToOrg(orgName, userDetails.displayName)
        if (typeof addedUser == 'string') {
            setError(addedUser)
            return
        }
        setError("")
        router.replace("/")
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.headerText, {color:"#FFF"}]}>Create Organisation</Text>
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