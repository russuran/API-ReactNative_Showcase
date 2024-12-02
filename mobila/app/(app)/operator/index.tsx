import React, { useEffect, useState } from "react"
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native"
import Input from "@/components/Input"
import style from "@/styles/style"
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons"
import SearchDropdown from "@/components/SearchDropdown"
import UnitDropdown from "@/components/UnitDropdown"
import SubmitButton from "@/components/SubmitButton"
import fetchApi from "@/utils/api"
import useFetch from "@/hooks/useFetch"
import PageContainer from "@/components/PageContainer"

export default function Index() {
  const [error, setError] = useState("")
  const [shift, loading, refetch] = useFetch({
    url: "/operator/shift",
    method: "GET",
    setError,
  })

  const [data, setData] = useState<
    {
      id: number
      name: string
      produced: string
      producedMass: string
      planned_amount: number
      defect: string
      defectReason: string
      materials: { id?: number | null; amount: string; unit: number }[]
    }[]
  >([])
  // const [data, setData] = useState([{
  //   pipe_id:
  //   produced: "",
  //   defect: "",
  //   defectReason: "",
  //   materials: [{ id: null as number | null, amount: "0" as string, unit: 1 }],
  // }])
  const [materialTypes, materialLoading] = useFetch({
    url: "/materials",
    setError,
  })
  useEffect(() => {
    if (!shift) return
    setData(
      shift?.pipes.map((pipe: any) => {
        return {
          id: pipe.id,
          name: pipe.name,
          planned_amount: pipe.planned_amount,
          produced: "",
          producedMass: "",
          defect: "",
          defectReason: "",
          materials: [{ id: null, amount: "0", unit: 1 }],
        }
      }),
    )
  }, [shift])

  const handleStart = async () => {
    try {
      const res = await fetchApi("/operator/start_shift", "POST")
      refetch()
      Alert.alert("Success", "Смена начата", [{ text: "OK" }])
    } catch (e) {
      setError("Неверный формат данных")
    }
  }
  const handleEnd = async () => {
    for (const pipe of data) {
      for (const material of pipe.materials) {
        if (isNaN(Number(material.amount))) {
          setError("Количество материала должно быть целым числом")
          return
        }
      }
      if (isNaN(Number(pipe.produced))) {
        setError("Количество произведенного должно быть целым числом")
        return
      }
      if (isNaN(Number(pipe.producedMass))) {
        setError("Количество произведенного должно быть целым числом")
        return
      }
      if (isNaN(Number(pipe.defect))) {
        setError("Количество брака должно быть целым числом")
        return
      }
    }

    const newData = data.map((pipe) => {
      return {
        produced: Number(pipe.produced),
        producedMass: Number(pipe.producedMass),
        defect: Number(pipe.defect),
        defectReason: pipe.defectReason,
        pipe_id: pipe.id,
        materials: pipe.materials.map((material) => {
          const amount = Number(material.amount)
          const unit = material.unit
          if (isNaN(amount) || isNaN(unit)) {
            return material
          }
          return { id: material.id, amount: amount * unit }
        }),
      }
    })
    // const newData = {
    //   ...data,

    //   materials: data.materials.map((material) => {
    //     const amount = Number(material.amount)
    //     const unit = material.unit
    //     if (isNaN(amount) || isNaN(unit)) {
    //       return material
    //     }
    //     return { id: material.id, amount: amount * unit }
    //   }),
    // }
    console.log(newData)
    try {
      const res = await fetchApi("/operator/end_shift", "POST", newData)
      console.log(res)
      if (res?.error) {
        setError(res?.error)
      } else {
        setError("")
        refetch()
        Alert.alert("Success", "Смена завершена", [{ text: "OK" }])
      }
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <PageContainer loading={loading || materialLoading} error={error}>
      <View style={{ gap: 8 }}>
        {shift ? (
          <View>
            <View style={{ maxWidth: 320 }}>
              <View style={style.separator} />
              <View style={{ flexDirection: "row" }}>
                <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold" }}>Линия</Text>
                <Text style={{ flex: 1, fontSize: 16 }}>{shift.line}</Text>
              </View>
              <View style={style.separator} />
              {/* <View style={{ flexDirection: "row" }}>
                <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold" }}>План по производству</Text>
                <Text style={{ flex: 1, fontSize: 16 }}>{shift.planned_amount} м</Text>
              </View>
              <View style={style.separator} />
              <View style={{ flexDirection: "row" }}>
                <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold" }}>{shift.pipe}</Text>
                <Text style={{ flex: 1, fontSize: 16 }}>{shift.pipe}</Text>
              </View> */}
              {/* <View style={style.separator} /> */}
            </View>

            {shift.time_start ? (
              <>
                <Text style={{ fontSize: 20, marginTop: 24, fontWeight: "bold" }}>Трубы</Text>
                <View style={{ gap: 16 }}>
                  {data?.map((pipe, index) => (
                    <View key={pipe.id}>
                      <View style={style.separator} />
                      <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{pipe.name}</Text>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                          План: <Text style={{ fontWeight: "normal" }}>{pipe.planned_amount} м</Text>
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 16,
                            marginBottom: 16,
                          }}
                        >
                          <Input
                            keyboardType="numeric"
                            onChangeText={(v) => setData(data.map((p, i) => (i === index ? { ...p, produced: v } : p)))}
                            value={data[index].produced}
                            label="Прозведено метров"
                          />
                          <Input
                            keyboardType="numeric"
                            onChangeText={(v) =>
                              setData(data.map((p, i) => (i === index ? { ...p, producedMass: v } : p)))
                            }
                            value={data[index].producedMass}
                            label="Произведенный объем в кг"
                          />
                          <Input
                            onChangeText={(v) => setData(data.map((p, i) => (i === index ? { ...p, defect: v } : p)))}
                            value={data[index].defect}
                            label="Брак"
                          />
                          <Input
                            onChangeText={(v) =>
                              setData(data.map((p, i) => (i === index ? { ...p, defectReason: v } : p)))
                            }
                            value={data[index].defectReason}
                            label="Причина брака"
                          />
                        </View>
                        <View style={style.table}>
                          {data[index].materials.map((material, materialIndex) => (
                            <View key={materialIndex}>
                              {materialIndex != 0 && <View style={style.separator} />}
                              <View style={style.row}>
                                <View style={{ flex: 1 }}>
                                  <SearchDropdown
                                    items={materialTypes}
                                    value={material.id as any}
                                    valueField="id"
                                    labelField="name"
                                    placeholder="Наименование сырья"
                                    setValue={(v) => {
                                      setData(
                                        data.map((p, i) =>
                                          i === index
                                            ? {
                                                ...p,
                                                materials: p.materials.map((m, j) =>
                                                  j === materialIndex
                                                    ? {
                                                        ...m,
                                                        id: Number(v),
                                                      }
                                                    : m,
                                                ),
                                              }
                                            : p,
                                        ),
                                      )
                                    }}
                                  />
                                </View>
                                <View style={{ flexDirection: "row", flex: 1 }}>
                                  <TextInput
                                    style={[style.input, { flex: 0 }]}
                                    onChangeText={(v) =>
                                      setData(
                                        data.map((p, i) =>
                                          i === index
                                            ? {
                                                ...p,
                                                materials: p.materials.map((m, j) =>
                                                  j === materialIndex
                                                    ? {
                                                        ...m,
                                                        amount: v,
                                                      }
                                                    : m,
                                                ),
                                              }
                                            : p,
                                        ),
                                      )
                                    }
                                    value={String(material.amount)}
                                    placeholder="Количество"
                                    placeholderTextColor="gray"
                                  />
                                  <UnitDropdown
                                    setUnit={(v) => {
                                      setData(
                                        data.map((p, i) =>
                                          i === index
                                            ? {
                                                ...p,
                                                materials: p.materials.map((m, j) =>
                                                  j === materialIndex
                                                    ? {
                                                        ...m,
                                                        unit: Number(v),
                                                      }
                                                    : m,
                                                ),
                                              }
                                            : p,
                                        ),
                                      )
                                    }}
                                  />
                                </View>
                                <TouchableOpacity
                                  onPress={() =>
                                    setData(
                                      data.map((p, i) =>
                                        i === index
                                          ? {
                                              ...p,
                                              materials: p.materials.filter((m, j) => j !== materialIndex),
                                            }
                                          : p,
                                      ),
                                    )
                                  }
                                  style={{ paddingLeft: 16 }}
                                >
                                  <FontAwesome name="remove" size={24} color="black" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>
                        <TouchableOpacity
                          style={{ alignSelf: "center" }}
                          onPress={() =>
                            setData(
                              data.map((p, i) =>
                                i === index
                                  ? {
                                      ...p,
                                      materials: [...p.materials, { id: null, amount: "", unit: 1 }],
                                    }
                                  : p,
                              ),
                            )
                          }
                        >
                          <FontAwesome6 name="add" size={28} color="black" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
                {!shift.done && (
                  <SubmitButton text="Закончить смену" style={{ alignSelf: "flex-start" }} onPress={handleEnd} />
                )}
              </>
            ) : (
              <>
                <Text style={{ fontSize: 20, marginVertical: 24 }}>Трубы</Text>
                <View style={style.table}>
                  <View style={style.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold" }}>Труба</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold" }}>План на смену (м)</Text>
                    </View>
                  </View>
                  {shift.pipes?.map((pipe: any) => (
                    <React.Fragment key={pipe.id}>
                      <View style={style.separator} />
                      <View style={style.row}>
                        <View style={{ flex: 1 }}>
                          <Text>{pipe.name}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text>{pipe.planned_amount}</Text>
                        </View>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
                <SubmitButton
                  text="Начать смену"
                  style={{ alignSelf: "flex-start", marginTop: 16 }}
                  onPress={handleStart}
                />
              </>
            )}
          </View>
        ) : (
          <Text>Назначенная смена отсутствует</Text>
        )}
      </View>
    </PageContainer>
  )
}
