import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    textInput: {
        backgroundColor: '#fff',
        color: '#25292e',
        width: '100%',
        height: 40,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
    },
    button: {
        backgroundColor: '#1e90ff',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 12,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
    }
});