import React from "react"
import { Text } from "react-native"
import { ScrollView } from "react-native"

function PageContainer({
  children,
  loading = false,
  error = "",
}: {
  children: React.ReactNode
  loading?: boolean
  error?: string
}) {
  return (
    <ScrollView
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 32,
        gap: 16,
      }}
    >
      {loading ? <Text>Загрузка...</Text> : children}
      {!!error && <Text style={{ color: "red" }}>{error}</Text>}
    </ScrollView>
  )
}

export default PageContainer
