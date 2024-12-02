import { Text, View, TouchableOpacity, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { useSession } from "../../components/ctx"
import { router } from "expo-router"
import Input from "@/components/Input"

export default function Index() {
  const [error, setError] = useState("")
  const { signIn } = useSession()
  const [data, setData] = useState({ login: "", password: "" })
  const handleLogin = async () => {
    let { login, password } = data
    try {
      let res = await signIn(login, password)
      if (res) {
        router.replace("/")
      } else {
        setError("Неверный логин или пароль")
      }
    } catch (e: any) {
      console.log(e, "at login")

      setError(e.message)
      // setError("Ошибка соединения")
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 24 }}>Войдите в свой аккаунт</Text>
      <View style={{ gap: 16 }}>
        <Input onChangeText={(v) => setData({ ...data, login: v })} value={data.login} placeholder="Логин" />
        <Input onChangeText={(v) => setData({ ...data, password: v })} value={data.password} placeholder="Пароль" />
        <TouchableOpacity
          style={{
            backgroundColor: "#007bff",
            paddingHorizontal: 24,
            paddingVertical: 4,
          }}
          onPress={handleLogin}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 20 }}>Войти</Text>
        </TouchableOpacity>
        {!!error && <Text style={{ color: "red" }}>{error}</Text>}
      </View>
    </View>
  )
}
