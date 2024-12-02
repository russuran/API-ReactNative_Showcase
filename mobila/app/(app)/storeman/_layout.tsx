import { Tabs, Navigator, Redirect } from "expo-router"
import { useSession } from "@/components/ctx"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect, useState } from "react"
import { AntDesign, Entypo } from "@expo/vector-icons"
import { MaterialIcons } from "@expo/vector-icons"
import { Text } from "react-native"
import fetchApi from "@/utils/api"

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
          headerTitle: "Остатки сырья",
          tabBarLabel: "Главная",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pipes"
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
          headerTitle: "Трубы на складе",
          tabBarLabel: "Трубы",
          tabBarIcon: ({ color }) => <FontAwesome name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
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
          headerTitle: "Прием сырья",
          tabBarLabel: "Прием сырья",
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="send"
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
          headerTitle: "Отправка Сырья",
          tabBarLabel: "Отправка Сырья",
          tabBarIcon: ({ color }) => <Entypo name="arrow-bold-up" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
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
          headerTitle: "История Операций",
          tabBarLabel: "История Операций",
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
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
