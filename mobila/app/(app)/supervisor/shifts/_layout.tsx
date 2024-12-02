import { Tabs, Navigator, Redirect, Stack } from "expo-router"
import { useEffect, useState } from "react"
import { Text } from "react-native"

export default function RootLayout() {
  const [title, setTitle] = useState("Главная")
  useEffect(() => {
    setTitle("Склад №1337 Казань")
  }, [])

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: title,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "title",
          headerShown: false,
        }}
      />
    </Stack>
  )
}
