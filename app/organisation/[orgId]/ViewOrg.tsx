import { styles } from "@/app/styles/global";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, ScrollView, FlatList } from "react-native";
import {auth, db} from "../../src/firebaseConfig"
import { GetCreateTeam, GetViewTeam } from "@/app/services/routes";

function OrganisationScreen() {
    const [loading, setLoading] = React.useState(false);
    const [organisation, setOrganisation] = React.useState<Organisation>()
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [teamList, setTeamList] = React.useState<Array<Team>>([]);

    const currentUser = auth.currentUser

    const router = useRouter();
    const params = useLocalSearchParams();
    const orgId = params.orgId
    
    React.useEffect(() => {
        getOrganisation();
    }, [])

    async function getOrganisation() {
        setLoading(true)

        if (!currentUser) {
            router.replace('../RegisterScreen');
        }
        if (typeof orgId !== 'string') {
            setErrorFlag(true)
            setErrorMessage("No organisation found")
        } else {
            try {
                const getDocRef = db.collection('organisations').doc(orgId)
                const orgDoc = await getDocRef.get();
                const org = orgDoc.data() as Organisation;
                const getTeamRefs = getDocRef.collection("teams")
                const teamDocs =  await getTeamRefs.get()
                const teams = []
                for (const team of teamDocs.docs) {
                    const teamData = team.data() as Team;
                    teams.push(teamData)
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
                    <Text style={[styles.headerText, {color:'white'}]}>{organisation.name}</Text>
                    {currentUser?.uid === organisation.creator ? 
                        GetCreateTeam(orgId.toString(), "Add Team")
                    : null}
                        <FlatList
                            data={teamList} 
                            scrollEnabled
                            style={[styles.itemList, {flexDirection: 'row', flexWrap: 'wrap', backgroundColor:'white', borderRadius: 5}]}
                            renderItem={({item}) => 
                                <View style={styles.item}>
                                    {GetViewTeam(orgId.toString(), item.name, item.name)}
                                </View>
                            }
                        />
                </View>
            )
        }
    }
}

export default OrganisationScreen;