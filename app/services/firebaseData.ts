import {db} from '../src/firebaseConfig';

export async function getEventUsers(orgId: string, teamId:string, eventId : string) : Promise<Array<UserEventStatus>> {
    const usersDocs = await db.collection("organisations").doc(orgId).collection("teams").doc(teamId).collection("events").doc(eventId).collection("members").get()
    const users = []
    for (const user of usersDocs.docs) {
        const userData: UserEventStatus = user.data() as UserEventStatus
        userData.id = user.id
        users.push(userData)
    }
    return users
}

export async function getEvents(orgId: string, teamId:string) : Promise<Array<EventDetails>> {
    const eventDocs = await db.collection("organisations").doc(orgId).collection("teams").doc(teamId).collection("events").get()
    const events = []
    for (const event of eventDocs.docs) {
        const eventData: EventDetails = event.data() as EventDetails
        eventData.id = event.id
        events.push(eventData)
    }
    return events
}