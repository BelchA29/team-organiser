import React, { useCallback } from 'react'
import { useRouter } from 'expo-router';
import { View, Text, Button, FlatList, Modal, TextInput } from 'react-native';
import {styles} from '../styles/global';
import { useFocusEffect } from '@react-navigation/native';

import {auth} from '../src/firebaseConfig';
import { GetOrganisation } from '@/app/services/routes';
import { addUserToOrg, getAllOrgs, getOrg, getUserInOrg } from '../services/firebaseData/organisationData';
import { getUser } from '../services/firebaseData/userData';

function organisations() {
    const [organisations, setOrganisations] = React.useState<Organisation[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [joinCode, setJoinCode] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("")
    const [errorFlag, setErrorFlag] = React.useState(false)
    const router = useRouter();

    const currentUser = auth.currentUser

    useFocusEffect(useCallback(() => {
        if (!currentUser) {
            router.replace('../RegisterScreen');
        }
        getOrganisations();
    }, []))

    async function getOrganisations() {
        console.log("Getting orgs")
        setLoading(true)
        const allOrgs = await getAllOrgs();
        if (typeof allOrgs == "string") {
            setErrorFlag(true);
            setErrorMessage(allOrgs);
            setLoading(false);
            return;
        }
        
        const userInOrg = []
        for (const org of allOrgs) {
            const userDocs = await getUserInOrg(org.name, currentUser!.uid);
            if (typeof userDocs != "string") {
                userInOrg.push(org);
            }
        }
        setOrganisations(userInOrg)
        setLoading(false)
    }

    async function handleJoin() {
        setLoading(true)
        const user = auth.currentUser
        if (!user) {
            setErrorFlag(true);
            setErrorMessage("No authenticated user")
            setLoading(false)
            return;
        }

        const [org, userDetails] = await Promise.all([getOrg(joinCode), getUser(user.uid)]);
        if (!org || typeof org == "string") {
            setErrorFlag(true);
            setErrorMessage("Error finding organisation");
            setLoading(false);
            return;
        }
        if (typeof userDetails == "string") {
            setErrorFlag(true)
            setErrorMessage("No current user")
            setLoading(false);
            return
        } 

        const userAdded = await addUserToOrg(joinCode, userDetails.displayName);
        if (typeof userAdded == "string") {
            setErrorFlag(true);
            setErrorMessage(userAdded);
            setLoading(false);
            return;
        }

        setOrganisations(prevOrgs => [...prevOrgs, org])
        setJoinCode("")
        setErrorMessage("")
        setVisible(false);
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
            return (
                <View style={styles.container}>
                    <View style={{flexDirection:'row', gap: 5, justifyContent: 'center', paddingVertical: 15}}>
                        <Button title="Create Organisation" onPress={() => router.push("./CreateOrganisationScreen")}/>
                        <Button title="Join Organisation" onPress={() => setVisible(true)} />
                    </View>
                    <Modal
                        visible={visible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.headerText}>Join</Text>
                                <TextInput style={styles.textInput} onChangeText={setJoinCode} value={joinCode} placeholder='Club Name' />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                                <View style={{flexDirection: 'row', gap: 10, justifyContent:'flex-end'}}>
                                    <Button title="Join" onPress={handleJoin} />
                                    <Button title="Close" onPress={() => setVisible(false)} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <FlatList data={organisations} style={styles.itemList} scrollEnabled
                    renderItem={({item}) => 
                        <View style={styles.item}>
                            {GetOrganisation(item.name, item.name)}
                        </View>} />
                </View>
            )
        }
}

export default organisations;