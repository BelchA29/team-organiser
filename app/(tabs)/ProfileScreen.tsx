import { useRouter } from 'expo-router';
import {styles} from '../styles/global';
import {View, Button, Alert} from 'react-native'
import { signOut } from 'firebase/auth';
import { auth, db } from '../src/firebaseConfig';

function ProfileScreen(){
    const router = useRouter();

    async function handleLogout() {
        try {
            await signOut(auth);
            Alert.alert('Logged out')
            router.replace('/')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={styles.container}>
            <Button title="Logout" onPress={handleLogout}/>
        </View>
    )
}

export default ProfileScreen