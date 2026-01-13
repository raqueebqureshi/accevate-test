"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function OTPScreen({ navigation, route }) {
  const { userid } = route.params
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      Alert.alert("Error", "Please enter complete 6-digit OTP")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("https://aapsuj.accevate.co/flutter-api/verify_otp.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userid.toString(),
          otp: otpString,
        }),
      })

      const data = await response.json()

      if (data.status) {
        await AsyncStorage.setItem("authToken", data.token)
        await AsyncStorage.setItem("userid", userid.toString())
        Alert.alert("Success", data.msg)
        navigation.replace("Dashboard")
      } else {
        Alert.alert("Error", data.msg || "OTP verification failed")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.")
      console.error("OTP verification error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to your registered mobile number</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify OTP</Text>}
        </TouchableOpacity>

        

        <TouchableOpacity style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#1E3D95",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 40,
    gap: 10,
  },
  otpInput: {
    width: 50,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  verifyButton: {
    backgroundColor: "#1E3D95",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  testInfo: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffc107",
    width: "100%",
    alignItems: "center",
  },
 
  resendContainer: {
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    color: "#1E3D95",
    fontWeight: "600",
  },
})
