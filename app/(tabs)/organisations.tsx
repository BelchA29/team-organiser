import React, { useCallback } from 'react'
import { useRouter } from 'expo-router';
import { View, Text, Button, FlatList, Modal, TextInput } from 'react-native';
import {styles} from '../styles/global';
import {auth} from '../src/firebaseConfig';
import { GetOrganisation } from '@/app/services/routes';
import { addUserToOrg, getAllOrgs, getOrg, getUserInOrg } from '../services/firebaseData/organisationData';
import { getUser } from '../services/firebaseData/userData';
import { onAuthStateChanged, User } from 'firebase/auth';

function organisations() {
    const [organisations, setOrganisations] = React.useState<Organisation[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [joinCode, setJoinCode] = React.useState("");
    const [modalErrorMessage, setModalErrorMessage] = React.useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const [errorFlag, setErrorFlag] = React.useState(false)
    const router = useRouter();

    React.useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
        router.replace("/login");
        return;
        }

        await user.getIdToken(true)
        await getOrganisations();
        setLoading(false);
    });

    return unsubscribe;
    }, []);

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
        const currentUser = auth.currentUser
        if (currentUser == null) {
            setErrorFlag(true)
            setErrorMessage("No authenticated user")
            setLoading(false)
            return
        }
        for (const org of allOrgs) {
            const userDocs = await getUserInOrg(org.name, currentUser.uid);
            if (typeof userDocs != "string") {
                userInOrg.push(org);
            }
        }
        setErrorFlag(false)
        setErrorMessage("")
        setOrganisations(userInOrg)
        setLoading(false)
    }

    async function handleJoin() {
        setLoading(true)
        const currentUser = auth.currentUser
        if (currentUser == null) {
            setModalErrorMessage("No authenticated user")
            setLoading(false)
            return
        }

        const [org, userDetails] = await Promise.all([getOrg(joinCode), getUser(currentUser.uid)]);
        if (!org || typeof org == "string") {
            setModalErrorMessage("Error finding organisation");
            setLoading(false);
            return;
        }
        if (typeof userDetails == "string") {
            setModalErrorMessage("No current user")
            setLoading(false);
            return
        } 

        const userAdded = await addUserToOrg(joinCode, userDetails.displayName);
        if (typeof userAdded == "string") {
            setModalErrorMessage(userAdded);
            setLoading(false);
            return;
        }

        setOrganisations(prevOrgs => [...prevOrgs, org])
        setJoinCode("")
        setModalErrorMessage("")
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
    } 
    if (errorFlag) {
        <View style={styles.container}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Button onPress={router.back} title='Back' />
        </View>
    }
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
                        <Text style={styles.errorText}>{modalErrorMessage}</Text>
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

export default organisations;