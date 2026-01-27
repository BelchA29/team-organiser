import { COLLECTiON_EVENTS, COLLECTiON_MEMEBERS, COLLECTiON_ORGS, COLLECTiON_TEAMS, COLLECTiON_USERS } from '@/app/src/constants';
import {auth, db} from '@/app/src/firebaseConfig';
import { setDoc, doc, getDoc, collection, getDocs, addDoc, updateDoc } from '@firebase/firestore';

export async function getAllEvents(orgId:string, teamId:string) : Promise<Array<EventDetails> | string> {
    const events = []
    try {
        const eventRefs = await getDocs(collection(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_EVENTS));
        for (const event of eventRefs.docs) {
            const eventData = event.data() as EventDetails;
            eventData.id = event.id
            events.push(eventData);
        }
    } catch (error) {
        console.error("Get All Events Error: ", error);
        if (error) {
            return error.toString();
        }
        return "Error getting all events";
    }
    return events;
}

export async function getEvent(orgId: string, teamId: string, eventId: string) : Promise<EventDetails | string> {
    let event: EventDetails | string = "No Event";
    try {
        const eventRef = await getDoc(doc(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_EVENTS, eventId));
        if (eventRef.exists()) {
            event = eventRef.data() as EventDetails;
            event.id = eventRef.id
        }
    } catch (error) {
        console.error(`Get Event ${eventId} Error: `, error)
        if (error) {
            return error.toString();
        }
    }
    return event
}

export async function setEvent(orgId:string, teamName: string, eventData:EventDetails) {
    const user = auth.currentUser;
    if (!user) {
        return "No user authenticated"
    }
    try {
        const newEvent = await addDoc(collection(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamName, COLLECTiON_EVENTS), eventData);
        return {id: newEvent.id}
    } catch (error) {
        console.error("Set Event Error: ", error)
        if (error) {
            return error.toString();
        }
        return "Error creating event"
    }
}

export async function addUserToEvent(orgId:string, teamId: string, eventId: string, userId: string, userData: UserEventStatus) {
    try {
        await setDoc(doc(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_EVENTS, eventId, COLLECTiON_MEMEBERS, userId), userData)
    } catch (error) {
        console.error("Add User To Event Error: ", error)
        if (error) {
            return error.toString()
        }
        return "Error adding user to event"
    }
}

export async function getEventMembers(orgId:string, teamId:string, eventId: string) : Promise<Array<UserEventStatus> | string > {
    let users : string | Array<UserEventStatus> = []
    try {
        const userDocs = await getDocs(collection(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_EVENTS, eventId, COLLECTiON_MEMEBERS));
        for (const user of userDocs.docs) {
            const userData = user.data() as UserEventStatus 
            userData.id = user.id
            users.push(userData)
        }
    } catch (error) {
        console.error("Get Event Members Error: ", error)
        if (error) {
            return error.toString()
        }
        return "Error getting users"
    }
    return users
}

export async function updateEventMemberStatus(orgId:string, teamId: string, eventId: string, userId:string, userUpdates : object) {
    const eventDoc = await getEvent(orgId, teamId, eventId);
    if (typeof eventDoc == "string") {
        return "Error finding event"
    }
    try {
        await updateDoc(doc(db, COLLECTiON_ORGS, orgId, COLLECTiON_TEAMS, teamId, COLLECTiON_EVENTS, eventId, COLLECTiON_MEMEBERS, userId), userUpdates)
    } catch (error) {
        console.error("Update Member Status Error: ", error)
        if (error) {
            return error.toString()
        }
        return "Error updating user status"
    }
    
}