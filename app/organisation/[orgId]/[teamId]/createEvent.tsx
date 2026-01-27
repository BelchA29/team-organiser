import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Button, TextInput } from 'react-native';
import {styles} from '@/app/styles/global';
import {DateTimePickerAndroid, DateTimePickerEvent} from '@react-native-community/datetimepicker'
import { addUserToEvent, setEvent } from '@/app/services/firebaseData/eventsData';
import { getTeamMembers } from '@/app/services/firebaseData/teamData';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/src/firebaseConfig';

function CreateEventScreen() {
    const [eventTitle, setEventTitle] = React.useState("");
    const [eventDescription, setEventDescription] = React.useState("")
    const [eventDate, setEventDate] = React.useState(new Date())
    const [isLodaing, setIsLoading] = React.useState(false)
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const router = useRouter()

    const params = useLocalSearchParams()
    const teamId = params.teamId
    const orgId = params.orgId

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
            router.replace("/login");
            return;
            }

            await user.getIdToken(true)
        });
        return unsubscribe
    }, []);

    async function createEvent() {
        setIsLoading(true)
        if (typeof orgId != "string" ||  typeof teamId != "string") {
            console.error("Create Event: Invalid Id")
            return
        }
        const date: number = eventDate.getTime();
        const eventData = {
            id: eventTitle,
            title: eventTitle,
            description: eventDescription,
            date: date
        };
        const newEvent = await setEvent(orgId, teamId, eventData);
        if (typeof newEvent == "string") {
            setErrorFlag(true)
            setErrorMessage(newEvent)
            setIsLoading(false)
            return;
        }
        const teamMembers = await getTeamMembers(orgId, teamId);
        if (typeof teamMembers == "string") {
            setErrorFlag(true)
            setErrorMessage(teamMembers)
            setIsLoading(false)
            return
        }
        teamMembers.map((user) => {
            const result = addUserToEvent(orgId, teamId, newEvent.id, user.userId, {
                id: user.userId,
                displayName: user.displayName,
                response: null,
                note: ""
            })
            if (typeof result == "string") {
                setErrorFlag(true)
                setErrorMessage(result)
                return
            }
        })
        setIsLoading(false)
        router.replace(`/organisation/[orgId]/[teamId]/[eventId]/ViewEvent`)
        return
    }

    const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        if (selectedDate == undefined) {
            return
        }
        const currentDate = selectedDate;
        setEventDate(currentDate);
    };

    const showMode = (currentMode: any) => {
        DateTimePickerAndroid.open({
            value: eventDate,
            onChange,
            mode: currentMode,
            is24Hour:false,
        });
    };

    const showDatePicker = () => {
        showMode('date');
    };

    const showTimePicker = () => {
        showMode('time')
    }

    if (isLodaing) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        )
    }
    if (errorFlag) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <Button onPress={router.back} title="Back" />
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <Text style={[styles.headerText, {color: '#FFF'}]}></Text>
            <TextInput style={styles.textInput} onChangeText={setEventTitle} value={eventTitle} placeholder='Title'/>
            <TextInput style={styles.textInput} onChangeText={setEventDescription} value={eventDescription} placeholder='Description'/>
            
            <Button onPress={showDatePicker} title={"Date: " + eventDate.toLocaleDateString(undefined, {weekday: 'short', year: '2-digit', month: 'long', day:'numeric'})} />
            <Button onPress={showTimePicker} title={"Time: " + eventDate.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})} />

            <Button onPress={createEvent} title={"Create Event"} />
        </View>
    )
}

export default CreateEventScreen