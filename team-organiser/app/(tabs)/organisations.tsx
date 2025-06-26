import React from 'react'
import { useRouter } from 'expo-router';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import {styles} from '../styles/global';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs, query, where, collection } from 'firebase/firestore'

function organisations() {
    const [organisations, setOrganisations] = React.useState<Organisation[]>();
    const [loading, setLoading] = React.useState(false)
    const router = useRouter();

    React.useEffect(() => {
        getOrganisations();
    }, [])

    async function getOrganisations() {
        setLoading(true)
        const db = getFirestore();
        const auth = getAuth();
        const currentUser = auth.currentUser
        if (!currentUser) {
            router.replace('/RegisterScreen');
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
            setOrganisations(orgs)
            console.log(orgs)
            setLoading(false)
        } catch (error) {
            console.error(error);
            setLoading(false)
        }
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
                    <Button title="Join Organisation" />
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