import React, { FormEventHandler } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Button, TextInput } from 'react-native';
import {styles} from '../../../styles/global';
import {DateTimePickerAndroid, DateTimePickerEvent} from '@react-native-community/datetimepicker'

import {auth, db} from '../../../src/firebaseConfig';

function CreateEventScreen() {
    const [eventTitle, setEventTitle] = React.useState("");
    const [eventDescription, setEventDescription] = React.useState("")
    const [eventDate, setEventDate] = React.useState(new Date())
    const [isLodaing, setIsLoading] = React.useState(false)

    const router = useRouter()

    const params = useLocalSearchParams()
    const teamId = params.teamId
    const orgId = params.orgId

    async function createTeam() {
        if (typeof orgId != "string" ||  typeof teamId != "string") {
            console.error("Create Event: Invalid Id")
            return
        }
        const teamDocs = db.collection("organisations").doc(orgId).collection("teams").doc(teamId)
        let eventDoc = undefined
        const date: number = eventDate.getTime()
        try {
            eventDoc = await teamDocs.collection("events").add({
                title: eventTitle,
                description: eventDescription,
                date: date
            })
        } catch (e) {
            console.log("Error creating event")
            console.log(e)
        }
        if (eventDoc) {
            try {
                const usersDocs = await db.collection("organisations").doc(orgId).collection("users").get()
                for (const user of usersDocs.docs) {
                    const userData: UserDetails = user.data() as UserDetails
                    teamDocs.collection("events").doc(eventDoc.id).collection('members').doc(user.id).set({
                        response: null,
                        note: ""
                    })
                }
            } catch (e) {
                console.log("Unable to add event")
                teamDocs.collection("events").doc(eventDoc.id).delete()
            }
            router.back()
        }
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

    return (
        <View style={styles.container}>
            <Text style={[styles.headerText, {color: '#FFF'}]}></Text>
            <TextInput style={styles.textInput} onChangeText={setEventTitle} value={eventTitle} placeholder='Title'/>
            <TextInput style={styles.textInput} onChangeText={setEventDescription} value={eventDescription} placeholder='Description'/>
            
            <Button onPress={showDatePicker} title={"Date: " + eventDate.toLocaleDateString(undefined, {weekday: 'short', year: '2-digit', month: 'long', day:'numeric'})} />
            <Button onPress={showTimePicker} title={"Time: " + eventDate.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})} />

            <Button onPress={createTeam} title={"Create Event"} />
        </View>
    )
}

export default CreateEventScreen