import { COLLECTiON_ORGS, COLLECTiON_TEAMS, COLLECTiON_USERS } from '@/app/src/constants';
import {auth, db} from '@/app/src/firebaseConfig';
import { setDoc, doc, getDoc, collection, getDocs } from '@react-native-firebase/firestore';

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

