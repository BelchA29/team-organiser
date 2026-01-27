import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, Modal, Pressable, TextInput } from 'react-native';
import {styles} from '@/app/styles/global';
import { useFocusEffect } from '@react-navigation/native';
import {auth} from '@/app//src/firebaseConfig';
import { Tabs } from '@/components/Tabs';
import IconButton from '@/components/IconButton';
import Button from '@/components/Button';
import { addUserToEvent, getEvent, getEventMembers, updateEventMemberStatus } from '@/app/services/firebaseData/eventsData';
import { getOrgUsers } from '@/app/services/firebaseData/organisationData';
import { onAuthStateChanged } from 'firebase/auth';

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
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const router = useRouter();

    const params = useLocalSearchParams()
    const teamId = params.teamId
    const orgId = params.orgId
    const eventId = params.eventId
    const currentUser = auth.currentUser

        React.useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (!user) {
                router.replace("/login");
                return;
                }
    
                await user.getIdToken(true)
                await getEventDetails()
        });
        return unsubscribe
    }, []);

    async function getEventDetails() {
        setLoading(true)
        if (typeof orgId != "string" ||  typeof teamId != "string" || typeof eventId != "string") {
            console.error("Get Event: Invalid Id")
            return
        }
        const newEvent = await getEvent(orgId, teamId, eventId);
        if (typeof newEvent == "string") {
            setErrorFlag(true)
            setErrorMessage(newEvent)
            setLoading(false)
            return;
        }
        setEvent(newEvent)
        const eventMembers = await getEventMembers(orgId, teamId, eventId);
        if (typeof eventMembers == "string") {
            setErrorFlag(true)
            setErrorMessage(eventMembers)
            setLoading(false)
            return;
        }
        setMembers(eventMembers)
        setErrorFlag(false)
        setErrorMessage("")
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
        const [orgMembers, eventMembers] = await Promise.all([getOrgUsers(orgId), getEventMembers(orgId, teamId, eventId)]) 
        if (typeof orgMembers == "string" || typeof eventMembers == "string") {
            console.error("Error getting org and/or event members")
            setModalLoading(false)
            setOpenModal(false)
            return
        }
        setUserList(orgMembers.filter((user) => !eventMembers.some((member) => user.userId === member.id)))
        setModalLoading(false)
    }

    async function addNewMembers() {
        setModalLoading(true)
        if (typeof orgId != "string" ||  typeof teamId != "string" || typeof eventId != "string") {
            console.error("Add new member: Invalid Id")
            return
        }
        for (const member of selectedList){
            const memberData = {
                id: member.userId,
                displayName: member.displayName,
                response: null,
                note: ""
            }
            const addingMembers = await addUserToEvent(orgId, teamId, eventId, member.userId, memberData)
        } 
        setOpenModal(false)      
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
        setLoading(true)
        setDisableInOut(true)
        if (typeof orgId != "string" ||  typeof teamId != "string" || typeof eventId != "string") {
            console.error("User Availibility: Invalid Id")
            setErrorFlag
            return
        }
        if (!currentUser) {
            setErrorFlag(true)
            setErrorMessage("No authorised user")
            setLoading(false)
            return
        }
        const result = availibility == 'i'
        const updatedUser = await updateEventMemberStatus(orgId, teamId,eventId, currentUser?.uid, {response: result, note: newNote});
        if (typeof updatedUser == "string") {
            setErrorFlag(true)
            setErrorMessage(updatedUser)
            setLoading(false)
            return
        }
        await getEventDetails();
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
    if (errorFlag) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{errorMessage}</Text>
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