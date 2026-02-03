import React from 'react';
import {useLocalSearchParams, useRouter} from "expo-router";
import { TextInput, View, Button, Text } from 'react-native';
import { auth } from "@/app//src/firebaseConfig";
import {styles} from "@/app/styles/global";
import { getTeam, setTeam } from '@/app/services/firebaseData/teamData';
import { onAuthStateChanged } from 'firebase/auth';
import {Picker} from '@react-native-picker/picker'
import { getOrgUsers } from '@/app/services/firebaseData/organisationData';

function CreateTeamScreen() {
    const [teamName, setTeamName] = React.useState("")
    const [minTeamMembers, setMinTeamMembers] = React.useState("")
    const [maxTeamMembers, setMaxTeamMembers] = React.useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [isLoading, setLoading] = React.useState(false)
    const [teamManager, setTeamManager] = React.useState<UserDetails>()
    const [teamManagerOptions, setTeamManagerOptions] = React.useState<Array<UserDetails>>([])

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
            await getOrgMembers()
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
            creatorId: currentUser.uid,
            minTeamMembers: Number(minTeamMembers),
            maxTeamMembers: Number(maxTeamMembers),
            managerId: teamManager ? teamManager.userId : null
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

    async function getOrgMembers() {
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
        const userList = await getOrgUsers(orgId);
        if (typeof userList == "string") {
            setErrorFlag(true)
            setErrorMessage(userList)
            setLoading(false)
            return
        }
        const nullUser = {displayName: "None", userId: ""}
        userList.sort((a, b) => a.displayName.localeCompare(b.displayName))
        setTeamManagerOptions([nullUser, ...userList])
        setErrorFlag(false)
        setErrorMessage("")
        setLoading(false)
        return
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
                <Text style={[styles.inputLabel, {color:'#FFF'}]}>Team Name</Text>
                <TextInput 
                    style={styles.textInput}
                    onChangeText={setTeamName}
                    value={teamName}
                    placeholder='Seahawks'
                />
                <Text style={[styles.inputLabel, {color:'#FFF'}]}>Minimum Team Players</Text>
                <TextInput 
                    style={styles.textInput}
                    keyboardType='numeric'
                    onChangeText={setMinTeamMembers}
                    value={minTeamMembers}
                    placeholder='Required number for event to go ahead'
                /> 
                <Text style={[styles.inputLabel, {color:'#FFF'}]}>Maximum Team Players</Text>
                <TextInput 
                    style={styles.textInput}
                    keyboardType='numeric'
                    onChangeText={setMaxTeamMembers}
                    value={maxTeamMembers}
                    placeholder='Max amount avalible to attened'
                />
                <Text style={[styles.inputLabel, {color:'#FFF'}]}>Team Manager</Text>
                <Picker prompt={"Select Team Manager"} style={styles.pickerDisplay} selectedValue={teamManager} onValueChange={(itemValue, itemIndex) => setTeamManager(itemValue)}>
                    {teamManagerOptions.map((item) => {
                        return <Picker.Item key={item.userId} label={item.displayName} value={item} />
                    })}
                </Picker>
                <Button title="Add" onPress={handleCreateTeam} disabled={isLoading}/>
            </View>
            )
        }
    }

}
export default CreateTeamScreen;