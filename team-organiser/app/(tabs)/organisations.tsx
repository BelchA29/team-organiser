import React, { useCallback } from 'react'
import { useRootNavigationState, useRouter } from 'expo-router';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import {styles} from '../styles/global';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs, query, where, collection, doc, getDoc, updateDoc} from 'firebase/firestore'
import { useFocusEffect } from '@react-navigation/native';

function organisations() {
    const [organisations, setOrganisations] = React.useState<Organisation[]>();
    const [loading, setLoading] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [joinCode, setJoinCode] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("")
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();

    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser

    useFocusEffect(useCallback(() => {
        if (!currentUser) {
            router.replace('/RegisterScreen');
        }
        getOrganisations();
    }, []))

    async function getOrganisations() {
        setLoading(true)
        const orgDocRef = collection(db, 'organisations')
        const q = query(orgDocRef, where("users", "array-contains", currentUser?.uid));
        try {
            const userOrgs = await getDocs(q);
            const orgs: Organisation[] = [];
            userOrgs.forEach((org) => {
                const orgData = org.data() as Omit<Organisation, 'id'>;
                orgs.push(orgData);
            })
            setOrganisations(orgs)
            console.log(orgs)
            setLoading(false)
        } catch (error) {
            console.error(error);
            setLoading(false)
        }
    }

    async function handleJoin() {
        setLoading(true)
        const orgDocRef = doc(db, 'organisations', joinCode)
        try {
            const orgResults = await getDoc(orgDocRef)
            if (orgResults.exists()) {
                const orgData = orgResults.data() as Organisation;
                if (currentUser) {
                    orgData.users.push(currentUser.uid)
                }
                await updateDoc(orgDocRef, {
                    users: orgData.users
                })
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