import React from 'react';
import {useLocalSearchParams, useRouter} from "expo-router";
import { TextInput, View, Button, Text } from 'react-native';
import { auth } from "@/app//src/firebaseConfig";
import {styles} from "@/app/styles/global";
import { getTeam, setTeam } from '@/app/services/firebaseData/teamData';
import { onAuthStateChanged } from 'firebase/auth';

function CreateTeamScreen() {
    const [teamName, setTeamName] = React.useState("")
    const [minTeamMembers, setMinTeamMembers] = React.useState("")
    const [maxTeamMembers, setMaxTeamMembers] = React.useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [isLoading, setLoading] = React.useState(false)

    const router = useRouter()
    const currentUser = auth.currentUser

    const params = useLocalSearchParams()
    const orgId = params.orgId

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
            router.replace("/login");
            return;
            }

            await user.getIdToken(true)
        });
    return unsubscribe;
    }, []);

    async function handleCreateTeam() {
        setLoading(true)
        if (!currentUser) {
            setErrorFlag(true);
            setErrorMessage("No authenticated user");
            setLoading(false);
            return;
        }

        if (typeof orgId !== 'string') {
            setLoading(false);
            setErrorMessage("No such organisation");
            return;
        }

        const currentTeam = await getTeam(orgId, teamName);
        if (typeof currentTeam != "string") {
            setErrorFlag(false);
            setErrorMessage("Team already exists");
            setLoading(false);
            return;
        }
        const teamData: Team = {
            name: teamName,
            creator: currentUser.uid,
            minTeamMembers: Number(minTeamMembers),
            maxTeamMembers: Number(maxTeamMembers)
        }
        const newTeam = setTeam(orgId, teamName, teamData)
        if (typeof newTeam == "string") {
            setErrorFlag(true);
            setErrorMessage(newTeam);
            setLoading(false);
            return;
        }
        router.replace(`/organisation/${orgId}/${teamName}/ViewTeam`)
        setLoading(false)
        setErrorMessage("")
        setErrorFlag(false)
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
        if (errorFlag) {
            return (
                <View style={styles.container}>
                    <Text>Error: {errorMessage}</Text>
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

}
export default CreateTeamScreen;