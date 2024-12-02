import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import style from "@/styles/style"
import { Link, router } from "expo-router"
import PageContainer from "@/components/PageContainer"
import useFetch from "@/hooks/useFetch"
export default function Index() {
  const [error, setError] = useState("")
  const [data, setData] = useState([
    {
      time_start: "27.07 12:34",
      time_end: "27.07 12:34",
      line: "Линия 213",
      operator: "Ваилий Пупкин",
    },
    {
      time_start: "27.07 12:34",
      time_end: "27.07 12:34",
      line: "Линия 213",
      operator: "Ваилий Пупкин",
    },
    {
      time_start: "27.07 12:34",
      time_end: "27.07 12:34",
      line: "Линия 213",
      operator: "Ваилий Пупкин",
    },
    {
      time_start: "27.07 12:34",
      time_end: "27.07 12:34",
      line: "Линия 213",
      operator: "Ваилий Пупкин",
    },
  ])

  const [shifts, loading] = useFetch({ url: "/supervisor/shifts", setError })

  return (
    <PageContainer loading={loading} error={error}>
      <View style={style.table}>
        <View style={style.row}>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Время начала</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Время окончания</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Линия</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Оператор</Text>
        </View>
        <View style={style.separator} />
        {shifts?.map((shift: any, index: number) => (
          <View key={index}>
            <TouchableOpacity onPressOut={() => router.push(`supervisor/shifts/${shift.id}`)}>
              <View style={style.row}>
                <Text style={{ flex: 1 }}>{shift.time_start}</Text>
                <Text style={{ flex: 1 }}>{shift.time_end}</Text>
                <Text style={{ flex: 1 }}>{shift.line}</Text>
                <Text style={{ flex: 1 }}>{shift.operator}</Text>
              </View>
            </TouchableOpacity>
            {index != shifts.length - 1 && <View style={style.separator} />}
          </View>
        ))}
      </View>
    </PageContainer>
  )
}
