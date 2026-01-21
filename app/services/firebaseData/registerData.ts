import { COLLECTiON_USERS } from '@/app/src/constants';
import {auth, db} from '@/app/src/firebaseConfig';
import { FirebaseError } from '@firebase/util';
import { setDoc, doc } from '@react-native-firebase/firestore';
import { createUserWithEmailAndPassword, User } from "firebase/auth";


export async function setUser( email:string, password: string, userName:string) : Promise<string | User> {
    let user;
    try {
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
            if (!userCredentials.user) {
                return "No user Found"
            }
            user = userCredentials.user
    } catch (error) {
            console.error("Registration error: ", error)
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    return "This email is already in use.";
                case 'auth/invalid-email':
                    return 'Please enter a valid email address.';
                case 'auth/weak-password':
                    return "Password should be at least 6 characters";
                case 'auth/network-request-failed':
                    return "Network error. Please check your internet connection";
                default:
                    return `Registration failed: ${error.message}`;
            }
        } else {
            return "Something went wrong. Try again"
        }
    }

    try {
        await setDoc(doc(db, COLLECTiON_USERS, user.uid), {
            displayName: userName
        })
    } catch (error) {
        if(error instanceof Error){
            return error.message
        }
        return "There was an error adding user name"
    }
    return user
}