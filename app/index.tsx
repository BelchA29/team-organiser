import { useRouter } from "expo-router";
import { View, Text, Button} from "react-native";
import {styles} from './styles/global'
import { onAuthStateChanged } from "firebase/auth";
import React from "react";
import {auth, db} from "./src/firebaseConfig"

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true)
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/(tabs)/organisations")
      } else {
        setLoading(false)
      }
    })
  })

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  } else {
    return (
      <View>
        <Text style={styles.container}>Home</Text>
        <Button title="Register" 
          onPress={() => router.push('/RegisterScreen')}
        />
        <Button title="Login" onPress={()=>router.push('/login')} />
      </View>
    );
  }
}
