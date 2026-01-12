import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        padding: 20,
    },
    textInput: {
        backgroundColor: '#fff',
        color: '#25292e',
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
    },
    inputLabel: {
        color: '#FFF',
        fontWeight: 'condensedBold',
        paddingTop: 10,    
    },
    button: {
        backgroundColor: '#1e90ff',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    buttonInverted: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },
    invertedButtonText: {
        color: '#25292e',
        // fontWeight: 'bold',
        // fontSize: 16,
        // textAlign: 'center'
    },
    itemList: {
        flex: 1,
        marginTop: 1, 
        width: '100%',
    },
    item: {
        backgroundColor:'#1e90ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderStyle: 'solid',
        borderColor:'#1e90ff',
        borderWidth: 5,
        borderRadius: 10
    },
        listItemNotSelected: {
        backgroundColor:'#FFFFFF',
        borderStyle: 'solid',
        borderColor:'#1e90ff',
        borderWidth: 5,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    modalOverlay: {
        flex:1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        width: '80%',
    },
    modalFlatlistContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        height: '70%'   
    },
    errorText: {
        color:"red",
        fontStyle: 'italic',
        fontWeight: 'bold',
        padding: 20
    },
    headerText:{
        fontWeight: 'bold',
        fontSize: 18,
        padding: 20,
    },
});