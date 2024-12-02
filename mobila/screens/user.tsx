import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import style from "@/styles/style"
import PageContainer from "@/components/PageContainer"
import useFetch from "@/hooks/useFetch"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useSession } from "@/components/ctx"

export default function Index() {
  const [error, setError] = useState("")
  const { user, loading, signOut } = useSession()

  return (
    <PageContainer loading={loading} error={error}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{user?.name}</Text>
      <Text>Логин: {user?.login}</Text>
      <TouchableOpacity
        onPress={signOut}
        style={{ marginTop: 20, alignSelf: "flex-start", padding: 10, borderRadius: 10, backgroundColor: "#fa667c" }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </PageContainer>
  )
}
