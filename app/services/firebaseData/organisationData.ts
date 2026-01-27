import { COLLECTiON_ORGS, COLLECTiON_USERS } from '@/app/src/constants';
import {auth, db} from '@/app/src/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { setDoc, doc, getDoc, collection, getDocs } from 'firebase/firestore';

export async function getAllOrgs() {
    let orgs = []
    try {
        const orgRefs = await getDocs(collection(db, COLLECTiON_ORGS))
        for (const org of orgRefs.docs) {
            const orgData = org.data() as Organisation;
            orgs.push(orgData)
        }
    } catch (error) {
        console.error("Get All Orgs Error: ",error)
        if (error) {
            return error.toString()
        }
        return "Error getting Organisations"
    }
    return orgs
}

export async function getOrg(orgName: string) {
    let organisation : Organisation | string = "No Organisation";
    try {
        const orgDocs = await getDoc(doc(db, COLLECTiON_ORGS, orgName))
        if (orgDocs.exists()) {
            organisation = orgDocs.data() as Organisation
        }
    } catch (error) {
        console.error(`Get Org ${orgName} Error: `, error)
    }
    return organisation;
}

export async function setOrg(orgName: string) {
    const user = auth.currentUser;
    if (!user) return "No user authenticated";
    try {
        await setDoc(doc(db, COLLECTiON_ORGS, orgName), {
            name: orgName,
            creator: user.uid,
        })
    } catch (error) {
        console.error("Set Org Error: ", error)
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
        console.error("Add User to Org Error: Get Org - ", error)
        return "Organisation Error"
    }

    if (organisation) {
        try {
            await setDoc(doc(db, COLLECTiON_ORGS, orgName, COLLECTiON_USERS, user.uid), {
                displayName: userName
            }) 
        } catch (error) {
            console.error("Add User to Org Error: Add User - ", error)
            if (error) {
                return error.toString()
            }
            return "Error adding user to org"
        }
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
        user.userId = userDocs.id
    } catch (error) {
        console.error("Get Org User Error: ", error)
        if (error) {
            return error.toString()
        }
        return ""
    }
    return user;
}

export async function getOrgUsers(orgId:string) : Promise<Array<UserDetails> | string > {
    let users : string | Array<UserDetails> = []
    try {
        const userDocs = await getDocs(collection(db, COLLECTiON_ORGS, orgId, COLLECTiON_USERS));
        for (const user of userDocs.docs) {
            const userData: UserDetails = user.data() as UserDetails
            userData.userId = user.id
            users.push(userData)
        } 
    } catch (error) {
        console.error("Get org Users Error: ", error)
        if (error) {
            return error.toString()
        }
        return "Error getting users"
    }
    return users
}