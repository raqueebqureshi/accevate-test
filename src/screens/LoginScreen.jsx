"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"

export default function LoginScreen({ navigation }) {
  const [userid, setUserid] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!userid || !password) {
      Alert.alert("Error", "Please enter both userid and password")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("https://aapsuj.accevate.co/flutter-api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userid,
          password: password,
        }),
      })

      const data = await response.json()

      if (data.status) {
        Alert.alert("Success", data.msg)
        navigation.replace("OTP", { userid: data.userid })
      } else {
        Alert.alert("Error", data.msg || "Login failed")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            
                    <Image source={require("../../assets/splash.jpg")} style={styles.logoImage} resizeMode="contain" />
                    
                 
          </View>
          
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.instructionText}>Login to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>User ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your user ID"
              placeholderTextColor="#999"
              value={userid}
              onChangeText={setUserid}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Login</Text>}
          </TouchableOpacity>

          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#1E3D95",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoCircle: {
    // width: 80,/
    paddingHorizontal: 30,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 0,
  },
  
  formContainer: {
    flex: 1,
    padding: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    marginTop: 20,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#1E3D95",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
})
