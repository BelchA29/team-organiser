import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, Modal, Pressable } from 'react-native';
import {styles} from '@/app/styles/global';
import { useFocusEffect } from '@react-navigation/native';
import {auth} from '@/app//src/firebaseConfig';
import { GetCreateEvent, GetEventView } from '@/app/services/routes';
import Button from '@/components/Button'
import { addMemberToTeam, getTeam, getTeamMembers } from '@/app/services/firebaseData/teamData';
import { getAllEvents } from '@/app/services/firebaseData/eventsData';
import { getOrgUsers } from '@/app/services/firebaseData/organisationData';
import { getUser } from '@/app/services/firebaseData/userData';
import { onAuthStateChanged } from 'firebase/auth';

function TeamScreen() {
    const [openModal, setOpenModal] = React.useState(false);
    const [userList, setUserList] = React.useState<Array<UserDetails>>([])
    const [modalLoading, setModalLoading] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [selectedList, setSelectedList] = React.useState(new Set<string>())
    const [eventList, setEventList] = React.useState<Array<EventDetails>>([])
    const [teamCreator, setTeamCreator] = React.useState("")
    const [teamManager, setTeamManager] = React.useState("")
    const [viewingCurrent, setViewCurrent] = React.useState(true)
    const [errorFlag, setErrorFlag] = React.useState(true)
    const [modalErrorFlag, setModalErrorFlag] = React.useState(true)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [modalErrorMessage, setModalErrorMessage] = React.useState("")

    const router = useRouter();

    const params = useLocalSearchParams()
    const teamId = params.teamId
    const orgId = params.orgId
    const currentUser = auth.currentUser
    
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
            router.replace("/login");
            return;
            }

            await user.getIdToken(true)
            getCurrentEvents();
            getTeamDetails()
        });
        return unsubscribe
    }, []);

    async function getTeamDetails() {
        if (typeof orgId !== "string" || typeof teamId !== "string") {
            return
        }
        const teamDetails = await getTeam(orgId, teamId);
        if (typeof teamDetails == "string") {
            setErrorFlag(true);
            setErrorMessage(teamDetails);
            setLoading(false);
            return;
        }
        setTeamCreator(teamDetails.creatorId)
        if (teamDetails.managerId) {
            setTeamManager(teamDetails.managerId)
        }
    }


    async function getCurrentEvents() {
        setLoading(true)
        if (typeof orgId !== "string" || typeof teamId !== "string") {
            return
        }
        const events = await getAllEvents(orgId, teamId);
        if (typeof events == "string") {
            setErrorFlag(true)
            setErrorMessage(events)
            setLoading(false);
            return;
        }
        setEventList(events.filter((event) => event.date >= (new Date()).getTime()))
        setViewCurrent(true)
        setErrorFlag(false)
        setErrorMessage("")
        setLoading(false)
    }

    async function getPastEvents() {
        setLoading(true)
        if (typeof orgId !== "string" || typeof teamId !== "string") {
            return
        }
        const events = await getAllEvents(orgId, teamId);
        if (typeof events == "string") {
            setErrorFlag(true)
            setErrorMessage(events)
            setLoading(false);
            return;
        }
        setEventList(events.filter((event) => event.date < (new Date()).getTime()))
        setViewCurrent(false)
        setErrorFlag(false)
        setErrorMessage("")
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
        const [orgMembers, teamMembers] = await Promise.all([getOrgUsers(orgId), getTeamMembers(orgId, teamId)]);
        if (typeof orgMembers == "string") {
            setModalErrorFlag(true);
            setModalErrorMessage(orgMembers);
            setModalLoading(false);
            return;
        }
        if (typeof teamMembers == "string") {
            setModalErrorFlag(true);
            setModalErrorMessage(teamMembers)
            setModalLoading(false)
            return;
        }
        setUserList(orgMembers.filter((user) => !teamMembers.some((member) => user.userId === member.userId)))
        setModalLoading(false)
        setModalErrorFlag(false)
        setModalErrorMessage("")
    }

    async function addNewMembers() {
        setModalLoading(true)
        if (typeof orgId != "string" ||  typeof teamId != "string") {
            console.error("Add New Member: Invalid Id")
            return
        }
        for (const memeber of selectedList){
            const userDoc = await getUser(memeber);
            if (typeof userDoc == "string") {
                setErrorFlag(true)
                setErrorMessage(userDoc)
                setModalLoading(false)
                return
            }
            const addingMembers = await addMemberToTeam(orgId, teamId, memeber, {displayName: userDoc.displayName})
            if (typeof addingMembers == "string") {
                setErrorFlag(true)
                setErrorMessage(addingMembers)
                setModalLoading(false)
                return;
            }
        } 
        setOpenModal(false)      
        setModalLoading(false)
    }

    function getUserName(item: UserDetails) {
        const isSelected = selectedList.has(item.userId)
        return (
            <View>
                <Pressable 
                    onPress={() => setSelectedList(prev => {
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
            <Text style={styles.buttonText}>{teamId}</Text>
            <View style={{flexDirection:'row', gap: 5}}>
                <View style={{flex: 1}}>
                    <Button onPress={getCurrentEvents} label={"Current Events"} style={viewingCurrent ? styles.buttonInverted : null} />
                </View>
                <View style={{flex: 1}}>
                    <Button onPress={getPastEvents} label={"Past Events"} style={viewingCurrent ? null : styles.buttonInverted }/>
                </View>
            </View>
            <Text style={[styles.headerText, {color:"#FFF"}]}>{viewingCurrent ? "Current Events" : "Past Events"}</Text>
            <FlatList data={eventList} style={styles.itemList}
            renderItem={({item}) => 
                <View style={styles.item}>
                    {GetEventView(orgId.toString(), teamId.toString(), item.id, item.title)}
                </View>} />

            <Modal visible={openModal} transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalFlatlistContent}>
                        {
                        modalLoading ? <Text>Loading...</Text> : 
                        modalErrorFlag ? 
                        <View>
                            <Text style={styles.errorText}>{modalErrorMessage}</Text>
                            <Button onPress={() => setOpenModal(false)} label={'Close'}/>
                        </View>
                        :
                        <View style={{flex: 1}}>
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
            {currentUser?.uid === teamCreator || currentUser?.uid === teamManager ? <View style={{flexDirection: 'row', gap: 5}}>
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