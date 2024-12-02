import { useState } from "react"
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Input from "@/components/Input"
import SubmitButton from "@/components/SubmitButton"
import { FontAwesome6 } from "@expo/vector-icons"
import { FontAwesome } from "@expo/vector-icons"
import SearchDropdown from "@/components/SearchDropdown"
import style from "@/styles/style"
import UnitDropdown from "@/components/UnitDropdown"
import PageContainer from "@/components/PageContainer"
import useFetch from "@/hooks/useFetch"
import fetchApi from "@/utils/api"

export default function Index() {
  const [error, setError] = useState("")
  const [data, setData] = useState({
    car_num: "",
    details: "",
    materials: [{ id: null as number | null, amount: "0" as string, unit: 1 }],
  })

  const [materialTypes, loading] = useFetch({ url: "/materials", setError })

  const handleSubmit = async () => {
    for (const material of data.materials) {
      if (isNaN(Number(material.amount))) {
        setError("Количество материала должно быть целым числом")
        return
      }
    }
    const newData = {
      ...data,
      materials: data.materials.map((material) => {
        const amount = Number(material.amount)
        const unit = material.unit
        if (isNaN(amount) || isNaN(unit)) {
          return material
        }
        return { id: material.id, amount: amount * unit }
      }),
    }
    // console.log(newData)
    try {
      const res = await fetchApi("/stock/materials-supply", "POST", newData)
      Alert.alert("Success", "Сохранено", [{ text: "OK" }])
      setData({
        car_num: "",
        details: "",
        materials: [{ id: null as number | null, amount: "0" as string, unit: 1 }],
      })
    } catch (e) {
      setError("Неверный формат данных")
    }
  }

  const deleteMaterial = (index: number) => {
    setData({
      ...data,
      materials: data.materials.filter((_, i) => i !== index),
    })
  }
  return (
    <PageContainer loading={loading} error={error}>
      <View style={{ gap: 24 }}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Input
            onChangeText={(v) => setData({ ...data, car_num: v })}
            value={data.car_num}
            label="Госномер транспорта"
          />
        </View>
        <View style={{ padding: 8 }}>
          <Text style={{ fontSize: 20, marginBottom: 8 }}>Сырьё</Text>
          <View style={style.table}>
            {data.materials.map((material, index) => (
              <View key={index}>
                <View style={style.row}>
                  <View style={{ flex: 1 }}>
                    <SearchDropdown
                      items={materialTypes}
                      value={material.id as any}
                      valueField="id"
                      labelField="name"
                      placeholder="Наименование сырья"
                      setValue={(v) => {
                        setData({
                          ...data,
                          materials: data.materials.map((m, i) => (i === index ? { ...m, id: Number(v!) } : m)),
                        })
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: "row", flex: 1 }}>
                    <TextInput
                      style={[style.input, { flex: 0 }]}
                      onChangeText={(v) =>
                        setData({
                          ...data,
                          materials: data.materials.map((m, i) => (i === index ? { ...m, amount: v } : m)),
                        })
                      }
                      value={material.amount}
                      placeholder="Количество"
                      placeholderTextColor="gray"
                    />
                    <UnitDropdown
                      setUnit={(v) => {
                        setData({
                          ...data,
                          materials: data.materials.map((m, i) => (i === index ? { ...m, unit: Number(v) } : m)),
                        })
                      }}
                    />
                  </View>
                  <TouchableOpacity onPress={() => deleteMaterial(index)} style={{ paddingLeft: 16 }}>
                    <FontAwesome name="remove" size={24} color="#444" />
                  </TouchableOpacity>
                </View>
                {index != data.materials.length - 1 && <View style={style.separator} />}
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={{ alignSelf: "center" }}
            onPress={() =>
              setData({
                ...data,
                materials: [...data.materials, { id: null, amount: "0", unit: 1 }],
              })
            }
          >
            <FontAwesome6 name="add" size={28} color="#444" />
          </TouchableOpacity>
        </View>
        <SubmitButton text="Сохранить" style={{ alignSelf: "flex-start" }} onPress={handleSubmit} />
      </View>
    </PageContainer>
  )
}
