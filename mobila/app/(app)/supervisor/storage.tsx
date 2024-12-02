import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Input from "@/components/Input"
import style from "@/styles/style"
import useFetch from "@/hooks/useFetch"
import PageContainer from "@/components/PageContainer"
export default function Index() {
  const [error, setError] = useState("")
  const [data, loading] = useFetch({
    url: "/storage",
    method: "GET",
    setError,
  })

  return (
    <PageContainer loading={loading} error={error}>
      <View style={{ gap: 8 }}>
        <View style={style.table}>
          <View style={style.row}>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Наименование сырья</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Количество</Text>
          </View>
          <View style={style.separator} />
          {data?.map((material: any, index: number) => (
            <View key={index}>
              <View style={style.row}>
                <Text style={{ flex: 1 }}>{material.name}</Text>
                <Text style={{ flex: 1 }}>{material.amount}кг</Text>
              </View>
              {index != data.length - 1 && <View style={style.separator} />}
            </View>
          ))}
        </View>
      </View>
    </PageContainer>
  )
}
