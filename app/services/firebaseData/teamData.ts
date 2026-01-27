import { COLLECTiON_MEMEBERS, COLLECTiON_ORGS, COLLECTiON_TEAMS } from '@/app/src/constants';
import {auth, db} from '@/app/src/firebaseConfig';
import { setDoc, doc, getDoc, collection, getDocs } from '@firebase/firestore';

export async function getAllTeams(orgId:string) {
    const teams = []
    try {
        const teamRefs = await getDocs(collection(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS));
        for (const team of teamRefs.docs) {
            const teamData = team.data() as Team;
            teams.push(teamData);
        }
    } catch (error) {
        console.error(error);
        if (error) {
            return error.toString();
        }
        return "Error getting all teams";
    }
    return teams;
}

export async function getTeam(orgId: string, teamId: string) : Promise<Team | string> {
    let team: Team | string = "No Team";
    try {
        const teamRef = await getDoc(doc(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId));
        if (teamRef.exists()) {
            team = teamRef.data() as Team;
        }
    } catch (error) {
        console.error(error)
        if (error) {
            return error.toString();
        }
    }
    return team
}

export async function setTeam(orgId:string, teamName: string, teamData:Team) {
    const user = auth.currentUser;
    if (!user) {
        return "No user authenticated"
    }
    try {
        await setDoc(doc(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamName), teamData);
    } catch (error) {
        console.error(error)
        if (error) {
            return error.toString();
        }
        return "Error creating team"
    }
}

export async function getTeamMembers(orgId:string, teamId:string) : Promise<Array<UserDetails> | string > {
    let users : string | Array<UserDetails> = []
    try {
        const userDocs = await getDocs(collection(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_MEMEBERS));
        for (const user of userDocs.docs) {
            const userData: UserDetails = user.data() as UserDetails
            userData.userId = user.id
            users.push(userData)
        }
    } catch (error) {
        console.error(error)
        if (error) {
            return error.toString()
        }
        return "Error getting users"
    }
    return users
}

export async function addMemberToTeam(orgId:string, teamId:string, userId:string, userData:object) {
    try {
        await setDoc(doc(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_MEMEBERS, userId), userData)
    } catch (error) {
        console.error(error)
        if (error) {
            return error.toString()
        }
        return "Error adding user to team"
    }
}