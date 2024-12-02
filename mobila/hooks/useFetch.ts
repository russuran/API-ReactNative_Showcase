import fetchApi from "@/utils/api"
import { useFocusEffect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
export default function useFetch({
  url,
  method = "GET",
  body,
  setError,
}: {
  url: string
  method?: string
  body?: any
  setError: (error: string) => void
}) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const func = () => {
    fetchApi(url, method, body)
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }
  useFocusEffect(
    useCallback(() => {
      func()
    }, [])
  )

  return [data, loading, func]
}
