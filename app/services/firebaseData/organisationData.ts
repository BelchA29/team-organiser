import { COLLECTiON_ORGS, COLLECTiON_USERS } from '@/app/src/constants';
import {auth, db} from '@/app/src/firebaseConfig';
import { setDoc, doc, getDoc, collection, getDocs } from '@react-native-firebase/firestore';


export async function getAllOrgs() {
    let orgs = []
    try {
        const orgRefs = await getDocs(collection(db, COLLECTiON_ORGS))
        for (const org of orgRefs.docs) {
            const orgData = org.data() as Organisation;
            orgs.push(orgData)
        }
    } catch (error) {
        console.error(error)
        if (error) {
            return error.toString()
        }
        return "Error getting Organisations"
    }
    return orgs
}

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

export async function getUserInOrg(orgName: string, userId: string) {
    let user;
    try {
        const userDocs = await getDoc(doc(db, COLLECTiON_ORGS, orgName, COLLECTiON_USERS, userId));
        if (!userDocs.exists()) {
            return "No user in this org";
        }
        user = userDocs.data() as UserDetails
    } catch (error) {
        console.error(error)
        if (error) {
            return error.toString()
        }
        return ""
    }
    return user;
}