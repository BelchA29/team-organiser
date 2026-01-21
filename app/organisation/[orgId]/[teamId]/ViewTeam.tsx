import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, Modal, Pressable } from 'react-native';
import {styles} from '@/app/styles/global';
import { useFocusEffect } from '@react-navigation/native';
import {auth, db} from '@/app//src/firebaseConfig';
import { GetCreateEvent, GetEventView } from '@/app/services/routes';
import { getEvents, getOrgUsers, getTeamUsers, getTeam } from '@/app/services/firebaseData';
import Button from '@/components/Button'

function TeamScreen() {
    const [openModal, setOpenModal] = React.useState(false);
    const [userList, setUserList] = React.useState<Array<UserDetails>>([])
    const [modalLoading, setModalLoading] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [selectedList, setSelectedList] = React.useState(new Set<string>())
    const [eventList, setEventList] = React.useState<Array<EventDetails>>([])
    const [teamCreator, setTeamCreator] = React.useState("")
    const [viewingCurrent, setViewCurrent] = React.useState(true)

    const router = useRouter();

    const params = useLocalSearchParams()
    const teamId = params.teamId
    const orgId = params.orgId
    const currentUser = auth.currentUser

    useFocusEffect(React.useCallback(() => {
        if (!currentUser) {
            router.replace('../RegisterScreen');
        }
        getCurrentEvents();
        getTeamDetails()
    }, []))

    async function getTeamDetails() {
        if (typeof orgId !== "string" || typeof teamId !== "string") {
            return
        }
        try {
            const teamDetails =  await getTeam(orgId, teamId)
            setTeamCreator(teamDetails.creator)
        } catch (e) {
            console.error("Error getting team details")
            console.error(e)
        }
    }


    async function getCurrentEvents() {
        setLoading(true)
        let events = []
        if (typeof orgId !== "string" || typeof teamId !== "string") {
            return
        }
        try {
            events = await getEvents(orgId, teamId)
        } catch (e) {
            console.error("Unable to get events")
            return
        }
        setEventList(events.filter((event) => event.date >= (new Date()).getTime()))
        setViewCurrent(true)
        setLoading(false)
    }

    async function getPastEvents() {
        setLoading(true)
        let events = []
        if (typeof orgId !== "string" || typeof teamId !== "string") {
            return
        }
        try {
            events = await getEvents(orgId, teamId)
        } catch (e) {
            console.error("Unable to get events")
            return
        }
        setEventList(events.filter((event) => event.date < (new Date()).getTime()))
        setViewCurrent(false)
        setLoading(false)
    }

    async function addTeamMember() {
        setOpenModal(true)
        setModalLoading(true)
        if (typeof orgId !== "string" || typeof teamId !== "string") {
            setModalLoading(false)
            setOpenModal(false)
            return
        }
        const [orgMembers, teamMembers] = await Promise.all([getOrgUsers(orgId), getTeamUsers(orgId, teamId)])
        console.log(orgMembers)
        console.log(teamMembers)
        console.log(orgMembers.filter((user) => !teamMembers.some((member) => user.userId === member.userId)))
        setUserList(orgMembers.filter((user) => !teamMembers.some((member) => user.userId === member.userId)))
        setModalLoading(false)
    }

    async function addNewMembers() {
        setModalLoading(true)
        if (typeof orgId != "string" ||  typeof teamId != "string") {
            console.error("Create Event: Invalid Id")
            return
        }
        try {
            const teamDocs = db.collection("organisations").doc(orgId).collection("teams").doc(teamId)
            await teamDocs.get()
            for (const memeber of selectedList){
                const userDoc = await db.collection("users").doc(currentUser?.uid).get()
                const userName = userDoc.data() as UserDetails
                const addingMembers = await teamDocs.collection("members").doc(memeber).set({
                    displayName: userName.displayName
                })
            } 
            setOpenModal(false)      
        } catch (e){
            console.error("Get team members error")
            console.error(e)
        }
        setModalLoading(false)
    }

    function getUserName(item: UserDetails) {
        const isSelected = selectedList.has(item.userId)
        console.log(item)
        return (
            <View>
                <Pressable 
                    onPress={() =>setSelectedList(prev => {
                    const next = new Set(prev)
                    next.has(item.userId) ? next.delete(item.userId) : next.add(item.userId)
                    return next
                        })
                    } 
                    style={isSelected ? styles.item: styles.listItemNotSelected}>
                    <Text>{item.displayName}</Text>
                </Pressable>
            </View>
        )
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.buttonText}>
                    Loading...
                </Text>
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <Text style={styles.buttonText}>{teamId}</Text>
            <View style={{flexDirection:'row', gap: 5}}>
                <View style={{flex: 1}}>
                    <Button onPress={getCurrentEvents} label={"Current Events"} style={viewingCurrent ? styles.buttonInverted : null} />
                </View>
                <View style={{flex: 1}}>
                    <Button onPress={getPastEvents} label={"Past Events"} style={viewingCurrent ? null : styles.buttonInverted }/>
                </View>
            </View>
            <FlatList data={eventList} style={styles.itemList}
            renderItem={({item}) => 
                <View style={styles.item}>
                    {GetEventView(orgId.toString(), teamId.toString(), item.id, item.title)}
                </View>} />

            <Modal visible={openModal} transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalFlatlistContent}>
                        {
                        modalLoading ? <Text>Loading...</Text> : <View style={{flex: 1}}>
                            <Text style={styles.headerText}>Select Members To Add</Text>
                            <FlatList data = {userList} style={styles.itemList} 
                                renderItem={({item}) => getUserName(item)}
                                keyExtractor={item => item.userId}
                                ListEmptyComponent={<Text>No Members to add</Text>}
                                extraData={selectedList}
                            />
                        </View>
                        }
                    <View style={{padding:10}}>
                        <Button label="Add Members" onPress={addNewMembers}/>
                        <Button label='Cancel' onPress={() => setOpenModal(false)} />
                    </View>
                    </View>
                </View>
            </Modal>
            <View style={{flex:1}}/>
            {currentUser?.uid === teamCreator ? <View style={{flexDirection: 'row', gap: 5}}>
                <View style={{flex: 1}}>
                    <Button onPress={addTeamMember} label='Add Team Member' />
                </View>
                <View style={{flex:1}}>
                    {GetCreateEvent(orgId.toString(), teamId.toString(), "Add Event")}
                </View>
            </View> : null}
        </View>
    )
}
export default TeamScreen