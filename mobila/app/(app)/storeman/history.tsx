import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import style from "@/styles/style"
import PageContainer from "@/components/PageContainer"
import useFetch from "@/hooks/useFetch"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function Index() {
  const [error, setError] = useState("")
  const [history, loading] = useFetch({
    url: "/storage-history",
    method: "GET",
    setError,
  })

  return (
    <PageContainer loading={loading} error={error}>
      <View style={style.table}>
        <View style={style.row}>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Тип операции</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Дата</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Наименование сырья/трубы</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Количество</Text>
        </View>
        <View style={style.separator} />
        {history?.map((event: any, index: number) => (
          <View key={index}>
            <View style={style.row}>
              <Text style={{ flex: 1 }}>{event.type}</Text>
              <Text style={{ flex: 1 }}>{event.date}</Text>
              <Text style={{ flex: 1 }}>{event.item}</Text>
              <Text style={{ flex: 1 }}>{event.amount}</Text>
            </View>
            {index != history.length - 1 && <View style={style.separator} />}
          </View>
        ))}
      </View>
    </PageContainer>
  )
}
