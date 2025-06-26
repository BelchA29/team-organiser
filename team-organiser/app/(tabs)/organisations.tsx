import React from 'react'
import { useRouter } from 'expo-router';
import { View, Text, Button, FlatList } from 'react-native';
import {styles} from '../styles/global';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocs, query, where, collection } from 'firebase/firestore'

function organisations() {
    const [organisations, setOrganisations] = React.useState<Organisation[]>();
    const router = useRouter();

    React.useEffect(() => {
        getOrganisations();
    }, [])

    async function getOrganisations() {
        const db = getFirestore();
        const auth = getAuth();
        const currentUser = auth.currentUser
        if (!currentUser) {
            router.replace('/(tabs)/RegisterScreen');
            return;
        }
        const orgDocRef = collection(db, 'organisations')
        const q = query(orgDocRef, where("users", "array-contains", currentUser.uid));
        try {
            const userOrgs = await getDocs(q);
            const orgs: Organisation[] = [];
            userOrgs.forEach((org) => {
                const orgData = org.data() as Omit<Organisation, 'id'>;
                orgs.push(orgData);
            })
            console.log(orgs)
            setOrganisations(orgs)
        } catch (error) {
            console.error(error);
        }

    }

    return (
        <View style={styles.container}>
            <Text>Organisations</Text>
            <Button title="Create Organisation" onPress={() => router.push("/(tabs)/CreateOrganisationScreen")}/>
            <Button title="Join Organisation" />
            <FlatList data={organisations} style={styles.itemList}
            renderItem={({item}) => <View style={styles.item}><Text>{item.name}</Text></View>} />
        </View>
    )
}

export default organisations;