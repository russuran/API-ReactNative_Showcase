import { useState } from "react"
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Input from "@/components/Input"
import SubmitButton from "@/components/SubmitButton"
import { AntDesign } from "@expo/vector-icons"
import { FontAwesome6 } from "@expo/vector-icons"
import { Dropdown } from "react-native-element-dropdown"
import { FontAwesome } from "@expo/vector-icons"
import SearchDropdown from "@/components/SearchDropdown"
import style from "@/styles/style"
import PageContainer from "@/components/PageContainer"
import useFetch from "@/hooks/useFetch"
import fetchApi from "@/utils/api"

export default function Index() {
  const [error, setError] = useState("")
  const [data, setData] = useState({
    pipes: [{ id: "", amount: "" }],
  })

  const [pipes, loading] = useFetch({ url: "/pipes", setError })

  const handleSubmit = async () => {
    try {
      for (const pipe of data.pipes) {
        if (isNaN(Number(pipe.amount))) {
          setError("Количество должно быть целым числом")
          return
        }
      }
      const res = await fetchApi("/supervisor/send-pipes", "POST", data)
      Alert.alert("Success", "Трубы отправлены", [{ text: "OK" }])
      setData({
        pipes: [{ id: "", amount: "" }],
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  const deleteMaterial = (index: number) => {
    setData({ ...data, pipes: data.pipes.filter((_, i) => i !== index) })
  }
  return (
    <PageContainer loading={loading} error={error}>
      <View style={{ gap: 24 }}>
        <View style={{ padding: 8 }}>
          <Text style={{ fontSize: 20, marginBottom: 8 }}>Трубы</Text>

          <View style={style.table}>
            {data.pipes.map((pipe, index) => (
              <View key={index}>
                <View style={style.row}>
                  <View style={{ flex: 1 }}>
                    <SearchDropdown
                      items={pipes ?? []}
                      valueField="id"
                      labelField="name"
                      value={pipe.id}
                      placeholder="Наименование трубы"
                      setValue={(v) => {
                        setData({
                          ...data,
                          pipes: data.pipes.map((m, i) => (i === index ? { ...m!, id: v! } : m)),
                        })
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      style={[style.input, { flex: 0, width: 88 }]}
                      onChangeText={(v) =>
                        setData({
                          ...data,
                          pipes: data.pipes.map((m, i) => (i === index ? { ...m, amount: v } : m)),
                        })
                      }
                      value={pipe.amount}
                      placeholder="Количество"
                      placeholderTextColor="gray"
                    />
                    <Text>м</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteMaterial(index)} style={{ paddingLeft: 16 }}>
                    <FontAwesome name="remove" size={24} color="black" />
                  </TouchableOpacity>
                </View>
                {index != data.pipes.length - 1 && <View style={style.separator} />}
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={{ alignSelf: "center" }}
            onPress={() =>
              setData({
                ...data,
                pipes: [...data.pipes, { id: "", amount: "" }],
              })
            }
          >
            <FontAwesome6 name="add" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <SubmitButton text="Сохранить" style={{ alignSelf: "flex-start" }} onPress={handleSubmit} />
      </View>
    </PageContainer>
  )
}
