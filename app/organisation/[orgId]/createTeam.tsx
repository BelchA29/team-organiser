import React from 'react';
import {useLocalSearchParams, useRouter} from "expo-router";
import { TextInput, View, Button, Text } from 'react-native';
import { auth, db } from "@/app//src/firebaseConfig";
import {styles} from "@/app/styles/global";

function CreateTeamScreen() {
    const [teamName, setTeamName] = React.useState("")
    const [minTeamMembers, setMinTeamMembers] = React.useState("")
    const [maxTeamMembers, setMaxTeamMembers] = React.useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const [isLoading, setLoading] = React.useState(false)

    const router = useRouter()
    const currentUser = auth.currentUser

    const params = useLocalSearchParams()
    const orgId = params.orgId

    async function handleCreateTeam() {
        setLoading(true)

        if (typeof orgId !== 'string') {
            setLoading(false)
            setErrorMessage("No such organisation")
            return;
        }
        try 
        { const orgRef = db.collection("organisations").doc(orgId).collection("teams").doc(teamName)
            const teams = await orgRef.get()
            if (teams.exists()) {
                setErrorMessage("Team already exists")
                return
            }
            await orgRef.set( {
                name: teamName,
                creator: currentUser?.uid,
                minTeamMembers: minTeamMembers,
                maxTeamMembers: maxTeamMembers
            })
            router.replace(`/organisation/${orgId}/${teamName}/ViewTeam`)
            setLoading(false)
            setErrorMessage("")
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message)
                setLoading(false)
            }
            console.error(error);
        }
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.buttonText}>
                    Loading...
                </Text>
            </View>
        )
    } else {
        return (
        <View style = {styles.container}>
            <Text></Text>
            <TextInput 
                style={styles.textInput}
                onChangeText={setTeamName}
                value={teamName}
                placeholder='Team Name'
            />
            <TextInput 
                style={styles.textInput}
                keyboardType='numeric'
                onChangeText={setMinTeamMembers}
                value={minTeamMembers}
                placeholder='Min Team members'
            /> 
            <TextInput 
                style={styles.textInput}
                keyboardType='numeric'
                onChangeText={setMaxTeamMembers}
                value={maxTeamMembers}
                placeholder='Max Team members'
            />
            <Button title="Add" onPress={handleCreateTeam}/>
        </View>
        )
    }

}
export default CreateTeamScreen;