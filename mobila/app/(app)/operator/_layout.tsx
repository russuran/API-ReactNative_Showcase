import { Tabs, Navigator, Redirect } from "expo-router"
import { useSession } from "@/components/ctx"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useEffect, useState } from "react"
import { Text } from "react-native"
import fetchApi from "@/utils/api"
import AntDesign from "@expo/vector-icons/AntDesign"

export default function RootLayout() {
  // return <Redirect href='/login/' />
  const [title, setTitle] = useState("Главная")
  const { user } = useSession()
  useEffect(() => {
    fetchApi("/manufacture").then((manufacture) => {
      setTitle(manufacture.name)
    })
  }, [user])

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerRight: () => (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "semibold",
                marginRight: 16,
                color: "#666",
              }}
            >
              {title}
            </Text>
          ),
          headerTitle: "Текущая смена",
          tabBarLabel: "Главная",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          headerRight: () => (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "semibold",
                marginRight: 16,
                color: "#666",
              }}
            >
              {title}
            </Text>
          ),
          headerTitle: "Пользователь",
          tabBarLabel: "Пользователь",
          tabBarIcon: ({ color }) => <AntDesign name="user" size={28} color={color} />,
        }}
      />
    </Tabs>
  )
}
