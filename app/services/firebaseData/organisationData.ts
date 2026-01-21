import { COLLECTiON_ORGS, COLLECTiON_USERS } from '@/app/src/constants';
import {auth, db} from '@/app/src/firebaseConfig';
import { setDoc, doc, getDoc } from '@react-native-firebase/firestore';

export async function getOrg(orgName: string) {
    let organisation : Organisation | string = "";
    try {
        const orgDocs = await getDoc(doc(db, COLLECTiON_ORGS, orgName))
        organisation = orgDocs.data() as Organisation
    } catch (error) {
        console.error(error)
    }
    return organisation;
}

export async function setOrg(orgName: string) {
    const user = auth.currentUser;
    if (!user) return;
    try {
        await setDoc(doc(db, COLLECTiON_ORGS, orgName), {
            name: orgName,
            creator: user.uid,
        })
    } catch (error) {
        console.error(error)
        return "Error creating organisation, try again";
    }
}

export async function addUserToOrg(orgName:string, userName:string) {
    const user = auth.currentUser;
    if (!user) {
        console.error("No user")
        return "No current user authenticated"
    }
    let organisation;
    try {
        organisation = await getDoc(doc(db, COLLECTiON_ORGS, orgName))
    } catch (error) {
        console.error(error)
        return "Organisation Error"
    }

    if (organisation) {
        await setDoc(doc(db, COLLECTiON_ORGS, orgName, COLLECTiON_USERS, user.uid), {
            displayName: userName
        })
    }
}