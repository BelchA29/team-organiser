import React, { useCallback } from 'react'
import { useRootNavigationState, useRouter } from 'expo-router';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import {styles} from '../styles/global';
import { useFocusEffect } from '@react-navigation/native';

import {auth, db} from '../src/firebaseConfig';

function organisations() {
    const [organisations, setOrganisations] = React.useState<Organisation[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [joinCode, setJoinCode] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("")
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();

    const currentUser = auth.currentUser

    useFocusEffect(useCallback(() => {
        if (!currentUser) {
            router.replace('/RegisterScreen');
        }
        getOrganisations();
    }, []))

    async function getOrganisations() {
        setLoading(true)
        try {
            const orgsRef = db.collection("organisations")
            const userOrgs = await orgsRef.get();
            const orgs: Array<Organisation> = [];
            for (const org of userOrgs.docs) {
                const orgData = org.data() as Omit<Organisation, 'id'>;
                console.log(orgData.users)
                orgData.users = []
                const userList = await orgsRef.doc(orgData.name).collection("users").doc(currentUser?.uid).get()
                if (userList.data()) {
                    orgs.push(orgData)
                }
            }
            if (orgs.length == 0) {
                setLoading(false);
                return;
            }
            setOrganisations(orgs)
            setLoading(false)
        } catch (error) {
            console.error(error);
            setLoading(false)
        }
    }

    async function handleJoin() {
        setLoading(true)
        const orgDocRef = db.collection('organisations').doc(joinCode)
        try {
            const orgResults = await orgDocRef.get()
            if (orgResults.exists()) {
                const orgData = orgResults.data() as Organisation;
                if (currentUser) {
                    await orgDocRef.collection("users").doc(currentUser.uid).set({
                        userId: currentUser.uid
                    })                      
                }
                organisations.push(orgData)
                setOrganisations(organisations)
                setJoinCode("")
                setErrorMessage("")
                setVisible(false);
            } else {
                setErrorMessage("No such organisation")
            }
        } catch (error) {
            console.error(error)
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
            return (
                <View style={styles.container}>
                    <Text>Organisations</Text>
                    <Button title="Create Organisation" onPress={() => router.push("/(tabs)/CreateOrganisationScreen")}/>
                    <Button title="Join Organisation" onPress={() => setVisible(true)}/>
                    <Modal
                        visible={visible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text>Join</Text>
                                <TextInput style={styles.textInput} onChangeText={setJoinCode} value={joinCode} placeholder='Club Name' />
                                <Text>{errorMessage}</Text>
                                <Button title="Join" onPress={handleJoin} />
                                <Button title="Close" onPress={() => setVisible(false)} />
                            </View>
                        </View>
                    </Modal>
                    <FlatList data={organisations} style={styles.itemList}
                    renderItem={({item}) => 
                        <View style={styles.item}>
                            <TouchableOpacity style={styles.button} onPress={() => router.push(`../organisation/${item.name}`)}> 
                                <Text>{item.name}</Text>
                            </TouchableOpacity>
                        </View>} />
                </View>
            )
        }
}

export default organisations;