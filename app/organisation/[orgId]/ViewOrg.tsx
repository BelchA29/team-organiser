import { styles } from "@/app/styles/global";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, FlatList } from "react-native";
import {auth} from "@/app/src/firebaseConfig"
import { GetCreateTeam, GetViewTeam } from "@/app/services/routes";
import { getOrg } from "@/app/services/firebaseData/organisationData";
import { getAllTeams } from "@/app/services/firebaseData/teamData";
import { onAuthStateChanged } from "firebase/auth";

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
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (!user) {
                router.replace("/login");
                return;
                }
    
                await user.getIdToken(true)
                getOrganisation()
            });
    
        return unsubscribe;
        }, []);

    async function getOrganisation() {
        setLoading(true)

        if (!currentUser) {
            router.replace('../RegisterScreen');
        }
        if (typeof orgId !== 'string') {
            setErrorFlag(true);
            setErrorMessage("No organisation found");
        } else {
            const org = await getOrg(orgId);
            if (typeof org == "string") {
                setErrorFlag(true);
                setErrorMessage(org);
                setLoading(false);
                return;
            }
            setOrganisation(org);
            const teams = await getAllTeams(orgId);
            if (typeof teams == "string") {
                setErrorFlag(true);
                setErrorMessage(teams);
                setLoading(false);
                return;
            }
            setTeamList(teams)
            setErrorFlag(false);
            setErrorMessage("");
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