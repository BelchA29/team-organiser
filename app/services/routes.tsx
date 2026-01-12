import { useRouter, Link, router } from "expo-router";
import { styles } from "../styles/global";
import { Text } from "react-native";

const ROUTER = useRouter();

export function GetOrganisation(orgId: string, label: string) {
    return (
        <Link
            href={{
                pathname: "/organisation/[orgId]/ViewOrg",
                params: {orgId: orgId}
            }}
            style={styles.button}
            ><Text style={styles.buttonText}>{label}</Text></Link>
    )
}

export function GetCreateTeam(orgId:string, label:string) {
     return (
        <Link
            href={{
                pathname: "/organisation/[orgId]/CreateTeam",
                params: {orgId: orgId}
            }}
            style={styles.button}
            ><Text style={styles.buttonText}>{label}</Text></Link>
    )   
}

export function GetViewTeam(orgId:string, teamId: string, label:string) {
     return (
        <Link
            href={{
                pathname: "/organisation/[orgId]/[teamId]/ViewTeam",
                params: {orgId: orgId, teamId: teamId}
            }}
            style={styles.button}
            ><Text style={styles.buttonText}>{label}</Text></Link>
    )   
}

export function GetCreateEvent(orgId:string, teamId: string, label:string) {
     return (
        <Link
            href={{
                pathname: "/organisation/[orgId]/[teamId]/createEvent",
                params: {orgId: orgId, teamId: teamId}
            }}
            style={styles.button}
            ><Text style={styles.buttonText}>{label}</Text></Link>
    )   
}
export function GetEventView(orgId:string, teamId: string, eventId:string, label:string) {
     return (
        <Link
            href={{
                pathname: "/organisation/[orgId]/[teamId]/[eventId]/ViewEvent",
                params: {orgId: orgId, teamId: teamId, eventId: eventId}
            }}
            style={styles.button}
            ><Text style={styles.buttonText}>{label}</Text></Link>
    )   
}
