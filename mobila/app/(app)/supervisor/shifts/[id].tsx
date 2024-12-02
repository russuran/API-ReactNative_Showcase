import { useEffect, useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Input from "@/components/Input"
import style from "@/styles/style"
import { Link, router, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import SubmitButton from "@/components/SubmitButton"
import useFetch from "@/hooks/useFetch"
import PageContainer from "@/components/PageContainer"
import fetchApi from "@/utils/api"
export default function Index() {
  const [error, setError] = useState("")
  const shiftId = useLocalSearchParams().id
  const [shift, loading, refetch] = useFetch({
    url: `/supervisor/shift/${shiftId}`,
    setError,
  })

  const handleSubmit = async () => {
    try {
      await fetchApi(`/supervisor/approve_shift/${shiftId}`, "POST")
      refetch()
    } catch (e) {
      setError("Ошибка")
    }
  }
  return (
    <PageContainer loading={loading} error={error}>
      <Link href="/supervisor/shifts" style={{ fontSize: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 32,
            gap: 4,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text>К сменам</Text>
        </View>
      </Link>
      {shift ? (
        <View style={{ gap: 8, paddingTop: 0 }}>
          <View style={{ maxWidth: 360 }}>
            <View style={style.separator} />
            <View style={{ flexDirection: "row" }}>
              <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold" }}>Линия</Text>
              <Text style={{ flex: 1, fontSize: 16 }}>{shift.line}</Text>
            </View>
            <View style={style.separator} />
            <View style={{ flexDirection: "row" }}>
              <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold" }}>время начала</Text>
              <Text style={{ flex: 1, fontSize: 16 }}>{shift.time_start}</Text>
            </View>
            <View style={style.separator} />
            <View style={{ flexDirection: "row" }}>
              <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold" }}>Время окончания</Text>
              <Text style={{ flex: 1, fontSize: 16 }}>{shift.time_end}</Text>
            </View>
            <View style={style.separator} />
          </View>
          {shift.done ? (
            <>
              <Text style={style.h2}>Трубы</Text>
              {shift.pipes?.map((pipe: any, index: number) => (
                <View key={index} style={{ marginVertical: 32 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>{pipe.name}</Text>

                  <View style={{ width: 360 }}>
                    <View style={style.separator} />
                    <View style={style.row}>
                      <Text style={{ flex: 1, fontWeight: "bold" }}>План на смену</Text>
                      <Text style={{ flex: 1 }}>{pipe.planned_amount} м</Text>
                    </View>
                    <View style={style.separator} />
                    <View style={style.row}>
                      <Text style={{ flex: 1, fontWeight: "bold" }}>Произведено метров</Text>
                      <Text style={{ flex: 1 }}>{pipe.produced} м</Text>
                    </View>
                    <View style={style.separator} />
                    <View style={style.row}>
                      <Text style={{ flex: 1, fontWeight: "bold" }}>Произведено кг</Text>
                      <Text style={{ flex: 1 }}>{pipe.producedMass} кг</Text>
                    </View>
                    <View style={style.separator} />
                    <View style={style.row}>
                      <Text style={{ flex: 1, fontWeight: "bold" }}>Масса по ГОСТу</Text>
                      <Text style={{ flex: 1 }}>{pipe.expected_mass} кг</Text>
                    </View>
                    <View style={style.separator} />
                    <View style={style.row}>
                      <Text style={{ flex: 1, fontWeight: "bold" }}>Брак</Text>
                      <Text style={{ flex: 1 }}>{pipe.defect} м</Text>
                    </View>
                    <View style={style.separator} />
                    <View style={style.row}>
                      <Text style={{ flex: 1, fontWeight: "bold" }}>Комментарий к браку</Text>
                      <Text style={{ flex: 1 }}>{pipe.defectReason}</Text>
                    </View>
                    <View style={style.separator} />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 8,
                      }}
                    >
                      Использованное сырье
                    </Text>
                    <View style={style.table}>
                      <View style={style.row}>
                        <Text style={{ flex: 1, fontWeight: "bold" }}>Наименование</Text>
                        <Text style={{ flex: 1, fontWeight: "bold" }}>Использовано (кг)</Text>
                      </View>
                      <View style={style.separator} />
                      {pipe.materials.map((material: any, index: number) => (
                        <View key={index} style={style.row}>
                          <Text style={{ flex: 1 }}>{material.name}</Text>
                          <Text style={{ flex: 1 }}>{material.amount}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
              {shift.approved ? (
                <Text>Закрытие одобрено</Text>
              ) : (
                <SubmitButton text="Одобрить закрытие" style={{ alignSelf: "flex-start" }} onPress={handleSubmit} />
              )}
            </>
          ) : (
            <View style={{ width: 360 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Трубы</Text>
              {shift.pipes?.map((pipe: any, index: number) => (
                <View key={index}>
                  <View style={style.separator} />
                  <View key={index} style={style.row}>
                    <Text style={{ flex: 1 }}>{pipe.name}</Text>
                    <Text style={{ flex: 1 }}>{pipe.planned_amount} м</Text>
                  </View>
                </View>
              ))}
              <View style={style.separator} />
            </View>
          )}
        </View>
      ) : (
        <Text>Смена не найдена</Text>
      )}
    </PageContainer>
  )
}
