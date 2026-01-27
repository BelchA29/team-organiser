import { COLLECTiON_ORGS, COLLECTiON_USERS } from '@/app/src/constants';
import {db} from '@/app/src/firebaseConfig';
import { setDoc, doc, getDoc } from '@firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export async function getUser(userId: string) : Promise <UserDetails | string> {
    let userDetails : UserDetails;
    try {
        const userDocs = await getDoc(doc(db, COLLECTiON_USERS, userId))
        userDetails = userDocs.data() as UserDetails
        userDetails.userId = userDocs.id
    } catch (error) {
        console.error(error)
        return "Cannot get User Details"
    }
    if (userDetails) {
        return userDetails
    }
    return "No user details found"
}