import { Link, useRouter } from "expo-router";
import { View, Text} from "react-native";
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
        router.replace("./(tabs)/organisations")
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
      <View style={[styles.container, {alignItems: 'center', justifyContent:'center'}]}>
        <Text style={[styles.headerText, {color:'#FFF'}]}>Welcome</Text>

        <View style={{width: '75%'}}>
          <Link href={"/RegisterScreen"} style={styles.button}><Text style={styles.buttonText}>Register</Text></Link>
          <Link href={"/login"} style={styles.button}><Text style={styles.buttonText}>Login</Text></Link>
        </View>
      </View>
    );
  }
}
