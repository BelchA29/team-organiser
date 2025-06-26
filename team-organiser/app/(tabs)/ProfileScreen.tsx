import { useRouter } from 'expo-router';
import {styles} from '../styles/global';
import {View, Button, Alert} from 'react-native'
import { signOut, getAuth } from 'firebase/auth';

function ProfileScreen(){
    const router = useRouter();

    async function handleLogout() {
        try {
            await signOut(getAuth());
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