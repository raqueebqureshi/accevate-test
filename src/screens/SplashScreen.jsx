"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkAuth()
    
  }, [])

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")

      setTimeout(() => {
        if (token) {
          navigation.replace("Dashboard")
        } else {
          navigation.replace("Login")
        }
      }, 2000)
    } catch (error) {
      console.error("Auth check failed:", error)
      setTimeout(() => {
        navigation.replace("Login")
      }, 2000)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/splash.jpg")} style={styles.logoImage} resizeMode="contain" />
        
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 0,
  },
  
})
