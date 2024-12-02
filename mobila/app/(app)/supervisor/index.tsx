import { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Input from "@/components/Input"
import SearchDropdown from "@/components/SearchDropdown"
import SubmitButton from "@/components/SubmitButton"
import useFetch from "@/hooks/useFetch"
import PageContainer from "@/components/PageContainer"
import fetchApi from "@/utils/api"
import style from "@/styles/style"
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons"

export default function Index() {
  const [data, setData] = useState({
    operator: "",
    line: "",
    pipes: [
      {
        id: null as number | null,
        amount: "",
      },
    ],
  })

  const handleSubmit = async () => {
    try {
      const res = await fetchApi("/supervisor/create_shift", "POST", data)
      Alert.alert("Success", "Смена создана", [{ text: "OK" }])
      setData({
        operator: "",
        line: "",
        pipes: [
          {
            id: null,
            amount: "",
          },
        ],
      })
    } catch (e) {
      setError("Неверный формат данных")
    }
  }

  const [error, setError] = useState("")
  const [operators, operatorsLoading] = useFetch({
    url: "/supervisor/operators",
    method: "GET",
    setError,
  })

  const [lines, linesLoading] = useFetch({
    url: "/supervisor/lines",
    method: "GET",
    setError,
  })
  const [pipes, pipesLoading] = useFetch({ url: "/pipes", setError })

  return (
    <PageContainer loading={pipesLoading || operatorsLoading || linesLoading} error={error}>
      <View style={{ gap: 32, flexDirection: "column", alignItems: "flex-start" }}>
        <View style={{ gap: 16, alignItems: "flex-start" }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 16, color: "#444" }}>Оператор</Text>
            <View
              style={{
                padding: 8,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: "#999",
                backgroundColor: "white",
              }}
            >
              <SearchDropdown
                placeholder="Выберите опреатора"
                items={operators ?? []}
                valueField="id"
                labelField="name"
                value={data.operator}
                setValue={(v) => setData({ ...data, operator: v! })}
                style={{ width: 240 }}
              />
            </View>
          </View>
          <View style={{ gap: 8, alignItems: "flex-start" }}>
            <Text style={{ fontSize: 16, color: "#444" }}>Линия </Text>
            <View
              style={{
                padding: 8,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: "#999",
                backgroundColor: "white",
              }}
            >
              <SearchDropdown
                placeholder="Выбрерите линию"
                items={lines ?? []}
                value={data.line}
                valueField="id"
                labelField="name"
                setValue={(v) => setData({ ...data, line: v! })}
                style={{ width: 240 }}
              />
            </View>
          </View>
          <View style={[style.table, { alignSelf: "stretch", width: 420 }]}>
            {data.pipes.map((pipe, index) => (
              <View key={index}>
                <View style={style.row}>
                  <View style={{ flex: 1 }}>
                    <SearchDropdown
                      items={pipes}
                      value={pipe.id as any}
                      valueField="id"
                      labelField="name"
                      placeholder="Наименование трубы"
                      setValue={(v) => {
                        setData({
                          ...data,
                          pipes: data.pipes.map((m, i) => (i === index ? { ...m, id: Number(v!) } : m)),
                        })
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: "row", width: 64 }}>
                    <TextInput
                      style={[style.input, { flex: 0, width: 64 }]}
                      onChangeText={(v) =>
                        setData({
                          ...data,
                          pipes: data.pipes.map((m, i) => (i === index ? { ...m, amount: v } : m)),
                        })
                      }
                      value={String(pipe.amount)}
                      placeholder="План (м)"
                      placeholderTextColor="gray"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setData({
                        ...data,
                        pipes: data.pipes.filter((_, i) => i !== index),
                      })
                    }
                    style={{ paddingLeft: 16 }}
                  >
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
                pipes: [...data.pipes, { id: null, amount: "0" }],
              })
            }
          >
            <FontAwesome6 name="add" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <SubmitButton text="Сохранить" onPress={handleSubmit} />
      </View>
    </PageContainer>
  )
}
