import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import style from "@/styles/style"
import useFetch from "@/hooks/useFetch"
import PageContainer from "@/components/PageContainer"
export default function Index() {
  const [error, setError] = useState("")

  const [pipes, loading] = useFetch({ url: "/storage-pipes", setError })

  return (
    <PageContainer loading={loading} error={error}>
      <View style={{ gap: 8 }}>
        <View style={style.table}>
          <View style={style.row}>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Наименование трубы</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Количество</Text>
          </View>
          <View style={style.separator} />
          {pipes?.map((material: any, index: any) => (
            <View key={index}>
              <View style={style.row}>
                <Text style={{ flex: 1 }}>{material.name}</Text>
                <Text style={{ flex: 1 }}>{material.amount} м</Text>
              </View>
              {index != pipes.length - 1 && <View style={style.separator} />}
            </View>
          ))}
        </View>
      </View>
    </PageContainer>
  )
}
