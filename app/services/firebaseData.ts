import {auth, db} from '../src/firebaseConfig';

export async function getOrgUsers(orgId: string) : Promise<Array<UserDetails>> {
    try {
    const usersDocs = await db.collection("organisations").doc(orgId).collection("users").get()
    const users = []
    for (const user of usersDocs.docs) {
        const userData: UserDetails = user.data() as UserDetails
        users.push(userData)
    }
    return users
    } catch (e) {
        console.error("Error getting org users")
        console.error(e)
        return []
    }
}

export async function getTeamUsers(orgId: string, teamId: string) : Promise<Array<UserDetails>> {
    try {
        const usersDocs = await db.collection("organisations").doc(orgId).collection("teams").doc(teamId).collection("members").get()
        const users = []
        for (const user of usersDocs.docs) {
            const userData: UserDetails = user.data() as UserDetails
            users.push(userData)
        }
        return users
    } catch (e) {
        console.error("Error getting team users")
        console.error(e)
        return []
    }
}

export async function getTeam(orgId: string, teamId: string) : Promise<Team> {
    const teamDoc = await db.collection("organisations").doc(orgId).collection("teams").doc(teamId).get()
    const team: Team = teamDoc.data() as Team
    return team
}

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