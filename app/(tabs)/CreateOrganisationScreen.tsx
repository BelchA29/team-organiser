import React from 'react';
import {useRouter} from "expo-router";
import { TextInput, View, Button, Text } from 'react-native';
import { auth } from "@/app/src/firebaseConfig";
import {styles} from "@/app/styles/global";
import { addUserToOrg, getOrg, setOrg } from '@/app/services/firebaseData/organisationData';
import { getUser } from '@/app/services/firebaseData/userData';
import { onAuthStateChanged, User } from 'firebase/auth';

function CreateOrganisationScreen() {
    const [orgName, setOrgName] = React.useState("");
    const [error, setError] = React.useState("")
    const [currentUser, setCurrentUser] = React.useState<User | null>(null)
    const router = useRouter();

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
            router.replace("/login");
            return;
            }

            await user.getIdToken(true)
            setCurrentUser(user)
    });

    return unsubscribe;
    }, []);

    const handleCreateOrganisation = async () => {
        if (!currentUser) {
            setError("No authenticated user");
            return;
        }
        const orgDoc = await getOrg(orgName);
        if (typeof orgDoc != "string") {
            setError("This name is already in use")
            return
        } 
        if (orgDoc != "No Organisation") {
            setError(orgDoc)
            return
        }
        const newOrg = await setOrg(orgName);
        if (typeof newOrg == 'string') {
            setError(newOrg)
            return
        }
        
        const userDetails = await getUser(currentUser.uid);
        if (typeof userDetails == "string") {
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
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Create" onPress={handleCreateOrganisation}/>
        </View>
    )
}
export default CreateOrganisationScreen;