import { COLLECTiON_EVENTS, COLLECTiON_ORGS, COLLECTiON_TEAMS, COLLECTiON_USERS } from '@/app/src/constants';
import {auth, db} from '@/app/src/firebaseConfig';
import { setDoc, doc, getDoc, collection, getDocs } from '@react-native-firebase/firestore';

export async function getAllEvents(orgId:string, teamId:string) : Promise<Array<EventDetails> | string> {
    const events = []
    try {
        const eventRefs = await getDocs(collection(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_EVENTS));
        for (const event of eventRefs.docs) {
            const eventData = event.data() as EventDetails;
            events.push(eventData);
        }
    } catch (error) {
        console.error(error);
        if (error) {
            return error.toString();
        }
        return "Error getting all events";
    }
    return events;
}

export async function getEventDetails(orgId: string, teamId: string, eventId: string) : Promise<EventDetails | string> {
    let event: EventDetails | string = "No Event";
    try {
        const eventRef = await getDoc(doc(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_EVENTS, eventId));
        if (eventRef.exists()) {
            event = eventRef.data() as EventDetails;
        }
    } catch (error) {
        console.error(error)
        if (error) {
            return error.toString();
        }
    }
    return event
}

export async function setEvent(orgId:string, teamName: string, eventId: string, eventData:Team) {
    const user = auth.currentUser;
    if (!user) {
        return "No user authenticated"
    }
    try {
        await setDoc(doc(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamName, COLLECTiON_EVENTS, eventId), eventData);
    } catch (error) {
        console.error(error)
        if (error) {
            return error.toString();
        }
        return "Error creating event"
    }
}