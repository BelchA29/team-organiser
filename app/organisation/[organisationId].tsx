import { styles } from "@/app/styles/global";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import {auth, db} from "../src/firebaseConfig"

function OrganisationScreen() {
    const [loading, setLoading] = React.useState(false);
    const [organisation, setOrganisation] = React.useState<Organisation>()
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const currentUser = auth.currentUser

    const router = useRouter();
    const {organisationId} = useLocalSearchParams();
    
    React.useEffect(() => {
        getOrganisation();
    }, [])

    async function getOrganisation() {
        setLoading(true)

        if (!currentUser) {
            router.replace('/RegisterScreen');
        }
        if (typeof organisationId !== 'string') {
            setErrorFlag(true)
            setErrorMessage("No organisation found")
        } else {
            console.log(organisationId)
            try {
                const getDocRef = db.collection('organisations').doc(organisationId)
                const orgDoc = await getDocRef.get();
                const org = orgDoc.data() as Organisation;
                const getTeamRefs = getDocRef.collection("teams")
                const teamDocs =  await getTeamRefs.get()
                org.teams = []
                for (const team of teamDocs.docs) {
                    const teamData = team.data() as Team;
                    org.teams.push(teamData)
                }
                setOrganisation(org);
                setErrorFlag(false);
                setErrorMessage("");
            } catch (error) {
                    setErrorFlag(true);
                    if (error instanceof Error) {
                        setErrorMessage(error.message)
                    } else {
                        setErrorMessage("Unknown Error when retriving organisation")
                    }
            }
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.buttonText}>
                    Loading...
                </Text>
            </View>
        )
    } else {
        if (errorFlag || ! organisation) {
                    return (
            <View style={styles.container}>
                <Text>Error: {errorMessage}</Text>
            </View>
        )
        } else {
            return (
                <View style={styles.container}>
                    <Text style={styles.buttonText}>{organisation.name}</Text>
                    {currentUser?.uid === organisation.creator ? 
                        <TouchableOpacity style={styles.button} onPress={() => router.push(`../teams/createTeam/${organisationId}`)}>
                            <Text style={styles.buttonText}>
                                Add Team
                            </Text>
                        </TouchableOpacity>
                    : null}
                    <FlatList
                        data={organisation.teams} 
                        style={styles.itemList}
                        renderItem={({item}) => 
                            <View style={styles.item}>
                                <TouchableOpacity style={styles.button} onPress={() => {}}>
                                    <Text style={styles.buttonText}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                </View>
            )
        }
    }
}

export default OrganisationScreen;