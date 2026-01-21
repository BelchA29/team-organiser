import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, Modal, Pressable, TextInput } from 'react-native';
import {styles} from '@/app/styles/global';
import { useFocusEffect } from '@react-navigation/native';
import {auth, db} from '@/app//src/firebaseConfig';
import { getOrgUsers, getEventUsers } from '@/app/services/firebaseData';
import { Tabs } from '@/components/Tabs';
import IconButton from '@/components/IconButton';
import Button from '@/components/Button';

function EventScreen() {
    const [openModal, setOpenModal] = React.useState(false);
    const [openNote, setOpenNote] = React.useState(false);
    const [openAddNote, setOpenAddNote] = React.useState(false);
    const [note, setNote] = React.useState("");
    const [newNote, setNewNote] = React.useState("");
    const [userList, setUserList] = React.useState<Array<UserDetails>>([])
    const [modalLoading, setModalLoading] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [selectedList, setSelectedList] = React.useState(new Set<UserDetails>())
    const [event, setEvent] = React.useState<EventDetails>()
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [members, setMembers] = React.useState<Array<UserEventStatus>>([])
    const [visibleMembers, setVisibleMembers] = React.useState<Array<UserEventStatus>>([])
    const [availibility, setAvailibility] = React.useState("")
    const [disableInOut, setDisableInOut] = React.useState(false)

    const router = useRouter();

    const params = useLocalSearchParams()
    const teamId = params.teamId
    const orgId = params.orgId
    const eventId = params.eventId
    const currentUser = auth.currentUser

    useFocusEffect(React.useCallback(() => {
        if (!currentUser) {
            router.replace('../RegisterScreen');
        }
        getEventDetails();
    }, []))

    async function getEventDetails() {
        setLoading(true)
        if (typeof orgId != "string" ||  typeof teamId != "string" || typeof eventId != "string") {
            console.error("Create Event: Invalid Id")
            return
        }
        try {
            const eventDoc = await db.collection("organisations").doc(orgId).collection("teams").doc(teamId).collection("events").doc(eventId).get()
            if (eventDoc == undefined) {
                console.error("No event found")
                return
            }
            const eventDetails = eventDoc.data() as EventDetails
            eventDetails.id = eventDoc.id
            setEvent(eventDetails)
        } catch (e) {
            console.error("Error getting event to display")
            return
        }
        try {
            setMembers(await getEventUsers(orgId, teamId, eventId));
        } catch (e) {
            console.error("Unable to get event members")
        }
        setLoading(false)
    }

    async function addEventMember() {
        setOpenModal(true)
        setModalLoading(true)
        if (typeof orgId !== "string" || typeof teamId !== "string" || typeof eventId !== "string") {
            console.error("Invalid org, team, or event ID. Id not string")
            setModalLoading(false)
            setOpenModal(false)
            return
        }
        const [orgMembers, eventMembers] = await Promise.all([getOrgUsers(orgId), getEventUsers(orgId, teamId, eventId)]) 
        setUserList(orgMembers.filter((user) => !eventMembers.some((member) => user.userId === member.id)))
        setModalLoading(false)
    }

    async function addNewMembers() {
        setModalLoading(true)
        if (typeof orgId != "string" ||  typeof teamId != "string" || typeof eventId != "string") {
            console.error("Create Event: Invalid Id")
            return
        }
        try {
            const eventDocs = db.collection("organisations").doc(orgId).collection("teams").doc(teamId).collection("events").doc(eventId)
            await eventDocs.get()
            for (const memeber of selectedList){
                const addingMembers = await eventDocs.collection("members").doc(memeber.userId).set({
                    displayName: memeber.displayName,
                    response: null,
                    note: ""
                })
            } 
            setOpenModal(false)      
        } catch (e){
            console.error("get event members error")
            console.error(e)
        }
        setModalLoading(false)
    }

    function getViewableMembers(index: number) {
        let filterParam = null
        switch (index) {
            case 1:
                filterParam = true
                break
            case 2: 
                filterParam = false
                break;
            default:
                null
        }
        const filteredMembers = members.filter((item) => item.response == filterParam)
        setVisibleMembers(filteredMembers)

    }

    async function updateUserAvalibility() {
        setDisableInOut(true)
        if (typeof orgId != "string" ||  typeof teamId != "string" || typeof eventId != "string") {
            console.error("Create Event: Invalid Id")
            return
        }
        const result = availibility == 'i'
        try {
            const userDoc = await db.collection('organisations').doc(orgId).collection('teams').doc(teamId).collection('events').doc(eventId).collection('members').doc(currentUser?.uid).update({
                response: result,
                note: newNote
            })
            const updatedMember = members.map((user) => { 
                if (user.id == currentUser?.uid) {
                    user.response = result
                }
                return user
            })
            setMembers(updatedMember)
        } catch (e) {
            console.error("Error updaing users availibility")
            console.error(e)
        }
        setOpenAddNote(false)
        setDisableInOut(false)
    }

    function getUserName(item: UserDetails) {
        const isSelected = selectedList.has(item)
        return (
            <View>
                <Pressable 
                    onPress={() =>setSelectedList(prev => {
                    const next = new Set(prev)
                    next.has(item) ? next.delete(item) : next.add(item)
                    return next
                        })
                    } 
                    style={isSelected ? styles.item: styles.listItemNotSelected}>
                    <Text>{item.displayName}</Text>
                </Pressable>
            </View>
        )
    }

    function getDetailPage() {
        if (event) {
            return (
                <View>
                    <View style={{alignItems:'center'}}>
                        <Text style={[styles.headerText, {color: "white"}]}>{event.title}</Text>
                    </View>
                    <View>
                        <Text style={styles.buttonText}>{(new Date(event.date)).toLocaleDateString(undefined, {weekday: 'short', year: 'numeric',  day:'numeric', month: 'long',})}</Text>
                        <Text style={styles.buttonText}>{(new Date(event!.date)).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}</Text>
                        <Text style={styles.buttonText}>{event.description}</Text>
                    </View>
                </View>
            )
        }
        
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
    if (!event) {
        return (
            <View>
                <Text>No event</Text>
                <Button onPress={router.back} label='Back' />
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <Tabs
                data ={[{id: 0, label:"Details"}, {id: 1, label: "In"}, {id: 2, label: "Out"}, {id: 3, label: "No Response"}]}
                onChange={(index) => {
                    setSelectedIndex(index)
                    getViewableMembers(index)
                }}
                selectedIndex={selectedIndex}
            />

            <View style={{ width: '100%'}}>
                <Pressable onPress={addEventMember} style={styles.button}><Text style={[styles.buttonText, {fontSize: 11}]}>Add Event Member</Text></Pressable>
            </View>
            {selectedIndex == 0 ? getDetailPage() : 
                <View style={{flex: 1}}>
                    <FlatList 
                        data={visibleMembers}
                        style={styles.itemList}
                        scrollEnabled
                        keyExtractor={(item) => item.id}
                        renderItem={({item, index}) => 
                            <View style={[styles.item, {flexDirection: 'row', flex: 1}]}>
                                <Text>
                                    {index + 1}: {item.displayName}
                                </Text>
                                <View style={{flex: 1}} />
                                <View style={{alignItems: 'flex-end'}}>
                                    <IconButton icon="arrow-downward" onPress={() => {
                                        setOpenNote(true)
                                        setNote(item.note)
                                        }} label=""/>
                                </View>
                            </View>
                        }
                    />
                </View>
            }
            <View style={{flex:1}} />
                        {members.some((user) => user.id == currentUser?.uid) ? 
            <View style={{flexDirection: 'row'}}>
                <Pressable style={[availibility === 'i' ? styles.buttonInverted : styles.button, 
                {borderEndEndRadius: 0, borderTopEndRadius:0, borderRightWidth: 1, borderRightColor: 'white'}]} 
                onPress={() => {
                    setAvailibility('i')
                    setNote("")
                    setOpenAddNote(true)
                    }}
                    disabled={disableInOut}
                    >
                    <Text style={[styles.buttonText, availibility === 'i' && styles.invertedButtonText]}>In</Text>
                </Pressable>
                <Pressable 
                    style={[
                        availibility === 'o' ? styles.buttonInverted :styles.button,
                        {
                            borderBottomStartRadius: 0, 
                            borderTopStartRadius:0, 
                            borderLeftWidth: 1, 
                            borderLeftColor: 'white'
                        }
                    ]} 
                    onPress={() => {
                        setAvailibility('o')
                        setOpenAddNote(true)
                        setNote("")
                        }}
                        disabled={disableInOut}
                        >
                        <Text style={[
                            styles.buttonText,
                            availibility === 'o' && styles.invertedButtonText,
                            ]}>
                                Out
                            </Text>
                </Pressable>
            </View>
            : null}

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

            <Modal visible={openNote} transparent={true}>
                <View style={styles.modalOverlay}>
                    <Text>{note}</Text>
                    <Button label='Close' onPress={()=> setOpenNote(false)} />
                </View>
                    
            </Modal>
            <Modal visible={openAddNote} transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text>Note: </Text>
                        <TextInput 
                        onChangeText={setNewNote}
                        value={newNote}
                        style={styles.textInput}
                        placeholder='Add Note...'
                        />
                        <Button label='Add' onPress={() => updateUserAvalibility()}/>
                    </View>
                </View>
            </Modal>

        </View>
    )
}
export default EventScreen