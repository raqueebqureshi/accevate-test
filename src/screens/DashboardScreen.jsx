
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { RefreshControl } from "react-native"


const { width } = Dimensions.get("window")

export default function DashboardScreen({ navigation }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSlide, setActiveSlide] = useState(0)
  const [refreshing, setRefreshing] = useState(false)


  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const token = await AsyncStorage.getItem("authToken")

      if (!token) {
        navigation.replace("Login")
        return
      }

      const response = await fetch("https://aapsuj.accevate.co/flutter-api/dashboard.php", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.status) {
        setDashboardData(data)
      } else {
        Alert.alert("Error", data.msg || "Failed to load dashboard.")

        if (!token) {
        navigation.replace("Login")
      }
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.")
      console.error("Dashboard fetch error:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("authToken")
          await AsyncStorage.removeItem("userid")
          navigation.replace("Login")
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AA4948" />
        <Text style={styles.loadingText}>Loading Dashboard..</Text>
      </View>
    )
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <View style={styles.buttonRow}>
  <TouchableOpacity
    style={styles.retryButton}
    onPress={fetchDashboardData}
  >
    <Text style={styles.retryButtonText}>Retry</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.errorlogoutButton}
    onPress={handleLogout}
  >
    <Text style={styles.errorlogoutButtonText}>Log out</Text>
  </TouchableOpacity>
</View>

      </View>
    )
  }

  const themeColor = dashboardData.dashboard?.color?.dynamic_color || "#AA4948"
  const user = dashboardData.user || {}
  const dashboard = dashboardData.dashboard || {}
  const carousel = dashboard.carousel || []
  const student = dashboard.student || {}
  const amount = dashboard.amount || {}

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || "U"}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>Welcome</Text>
              <Text style={styles.userName}>{user.name || "User"}</Text>
              <Text style={styles.userMobile}>{user.mobile || "N/A"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: themeColor }]} showsVerticalScrollIndicator={false}
       refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={fetchDashboardData}
      colors={["#AA4948"]}     
      tintColor="#AA4948" 
    />
  }
      >
        {carousel.length > 0 && (
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 48))
                setActiveSlide(slide)
              }}
              scrollEventThrottle={16}
            >
              {carousel.map((banner, index) => (
                <View key={index} style={styles.carouselSlide}>
                  <Image source={{ uri: banner }} style={styles.carouselImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
            <View style={styles.pagination}>
              {carousel.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    activeSlide === index && [styles.paginationDotActive, { backgroundColor: "#ffffff" }],
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#E3F2FD" }]}>
                <Text style={styles.statIconLarge}>👦</Text>
              </View>
              <Text style={styles.statValue}>{student.Boy || 0}</Text>
              <Text style={styles.statLabel}>Boys</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#FCE4EC" }]}>
                <Text style={styles.statIconLarge}>👧</Text>
              </View>
              <Text style={styles.statValue}>{student.Girl || 0}</Text>
              <Text style={styles.statLabel}>Girls</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#F3E5F5" }]}>
                <Text style={styles.statIconLarge}>👥</Text>
              </View>
              <Text style={styles.statValue}>{(student.Boy || 0) + (student.Girl || 0)}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fee Overview</Text>

          <View style={styles.feeCard}>
            <View style={[styles.feeHeader, { backgroundColor: `${themeColor}15` }]}>
              <Text style={styles.feeHeaderText}>Financial Summary</Text>
            </View>

            <View style={styles.feeBody}>
              <View style={styles.feeRow}>
                <View style={styles.feeLeftSection}>
                  <View style={[styles.feeIcon, { backgroundColor: "#E8F5E9" }]}>
                    <Text style={styles.feeIconText}>💵</Text>
                  </View>
                  <View>
                    <Text style={styles.feeLabel}>Total Fee</Text>
                    <Text style={styles.feeSubLabel}>Academic Year 2024-25</Text>
                  </View>
                </View>
                <Text style={styles.feeValue}>₹{(amount.Total || 0).toLocaleString()}</Text>
              </View>

              <View style={styles.feeDivider} />

              <View style={styles.feeRow}>
                <View style={styles.feeLeftSection}>
                  <View style={[styles.feeIcon, { backgroundColor: "#E8F5E9" }]}>
                    <Text style={styles.feeIconText}>✅</Text>
                  </View>
                  <View>
                    <Text style={styles.feeLabel}>Paid Fee</Text>
                    <Text style={styles.feeSubLabel}>
                      {amount.Total ? Math.round((amount.Paid / amount.Total) * 100) : 0}% completed
                    </Text>
                  </View>
                </View>
                <Text style={[styles.feeValue, { color: "#4CAF50" }]}>₹{(amount.Paid || 0).toLocaleString()}</Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${amount.Total ? (amount.Paid / amount.Total) * 100 : 0}%`,
                      backgroundColor: "#4CAF50",
                    },
                  ]}
                />
              </View>

              <View style={styles.feeDivider} />

              <View style={styles.feeRow}>
                <View style={styles.feeLeftSection}>
                  <View style={[styles.feeIcon, { backgroundColor: "#FFEBEE" }]}>
                    <Text style={styles.feeIconText}>⏰</Text>
                  </View>
                  <View>
                    <Text style={styles.feeLabel}>Due Fee</Text>
                    <Text style={styles.feeSubLabel}>Payment pending</Text>
                  </View>
                </View>
                <Text style={[styles.feeValue, { color: "#F44336" }]}>₹{(amount.due || 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>👤</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>{user.userid || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>👨‍💼</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user.name || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>📞</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>{user.mobile || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    gap: 12, 
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1E3D95",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorlogoutButton: {
    backgroundColor: "#AA4948",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorlogoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  userMobile: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.85,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoutText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  carouselContainer: {
    marginBottom: 24,
  },
  carouselSlide: {
    width: width - 40,
    height: 180,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    // color: "#1F2937",
    color: "#ffffff",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statIconLarge: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  feeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  feeHeader: {
    padding: 16,
    alignItems: "center",
  },
  feeHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  feeBody: {
    padding: 20,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feeLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  feeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  feeIconText: {
    fontSize: 20,
  },
  feeLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  feeSubLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  feeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  feeDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
})
