import { StyleSheet, View, Pressable, Text, StyleProp, ViewStyle } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {styles} from '@/app/styles/global'

type Props = {
    label: string;
    theme?: 'primary';
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
};

export default function Button({ label, theme, onPress, style } : Props) {
    if (theme === 'primary') {
        return (
        <View 
        style={[
            buttonStyles.buttonContainer,
            {borderWidth: 4, borderColor: '##ffd33d', borderRadius: 18 },
        ]}>
        <Pressable 
        style={[styles.button, { backgroundColor: '#fff' }]} onPress={onPress}>
        <FontAwesome name="picture-o" size={18} color="#25292e" style={buttonStyles.buttonIcon} />
        <Text style={[styles.buttonText, { color: '#25292e' }]}>{label}</Text>
        </Pressable>
        </View>
    );}
    return (
        <View>
            <Pressable style={style ? style : styles.button} onPress={onPress}>
                <Text style={style ? styles.invertedButtonText: styles.buttonText}>{label}</Text>
            </Pressable>
        </View>
    )
}

const buttonStyles =StyleSheet.create({
    buttonContainer: {
     width:320,
     height:68,
     marginHorizontal: 20,
     alignItems: 'center',
     justifyContent: 'center',
     padding: 3,   
    },
    buttonIcon: {
        paddingRight: 8,
    },
});