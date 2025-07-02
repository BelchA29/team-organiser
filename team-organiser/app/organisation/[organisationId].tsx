import { styles } from "@/app/styles/global";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";

function OrganisationScreen() {
    const [loading, setLoading] = React.useState(false);
    const [organisation, setOrganisation] = React.useState<Organisation>()
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const auth = getAuth();
    const currentUser = auth.currentUser

    const router = useRouter();
    const {organisationId} = useLocalSearchParams();
    
    React.useEffect(() => {
        getOrganisation();
    }, [])

    async function getOrganisation() {
        setLoading(true)
        const db = getFirestore();

        if (!currentUser) {
            router.replace('/RegisterScreen');
        }
        if (typeof organisationId !== 'string') {
            setErrorFlag(true)
            setErrorMessage("No organisation found")
        } else {
            console.log(organisationId)
            try {
                const getDocRef = doc(db, 'organisations', organisationId)
                const orgDoc = await getDoc(getDocRef);
                const org = orgDoc.data() as Organisation;
                setOrganisation(org);
                setErrorFlag(false);
                setErrorMessage("");
                console.log("Got got")
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
                        <TouchableOpacity style={styles.button} onPress={() => {}}>
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