import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

async function save(key: string, value: string) {
  await SecureStore.setItemAsync(key, value)
}

const API_URL = Platform.OS == "web" ? "http://localhost:8000" : "https://fast-util.ru"
// const API_URL = "https://fast-util.ru"

export default async function fetchApi(url: string, method: string = "GET", body?: any): Promise<any> {
  const session_key =
    Platform.OS == "web" ? localStorage.getItem("session_key") : await SecureStore.getItemAsync("session_key")
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: session_key ?? "",
    },
  }

  if (method.toUpperCase() === "POST" && body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(API_URL + url, options)
  if (!response.ok) {
    if (response.status == 422) {
      throw new Error("Неверный формат данных")
    } else if (String(response.status)[0] == "5") {
      throw new Error("Ошибка на сервере")
    }
  }
  let res = await response.json()
  if (res?.error) {
    throw new Error(res.error)
  }
  return res
}

export async function fetchSignIn(login: string, password: string) {
  const data = await fetchApi("/auth", "POST", { login, password })
  if (data?.error) {
    console.log(data.error)
  } else {
    const { session_key } = data
    if (Platform.OS != "web") await save("session_key", session_key)
    else localStorage.setItem("session_key", session_key)
  }
  return data.user
}

export async function logOut() {
  if (Platform.OS == "web") localStorage.removeItem("session_key")
  else await SecureStore.deleteItemAsync("session_key")
}
