import { useRouter } from "expo-router";
import { View, Text, Button} from "react-native";
import {styles} from './styles/global'
export default function Index() {
  const router = useRouter();

  return (
    <View>
      <Text style={styles.container}>Home</Text>
      <Button title="Register" 
        onPress={() => router.push('/RegisterScreen')}
      />
    </View>
  );
}
