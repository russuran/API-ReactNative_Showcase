import { Link, Redirect, useFocusEffect, useRouter } from "expo-router"
import { useEffect } from "react"
import { Text, View } from "react-native"
import { useSession } from "../../components/ctx"

export default function Index() {
  const { user, loading } = useSession()
  const router = useRouter()
  useEffect(() => {
    if (loading) return
    if (!user) setTimeout(() => router.replace("/login"), 0)
    else if (user.role === 1) setTimeout(() => router.replace("/operator"), 0)
    else if (user.role === 2) setTimeout(() => router.replace("/storeman"), 0)
    else if (user.role === 3) setTimeout(() => router.replace("/supervisor"), 0)
  }, [loading, user])
  // return <Redirect href='/login/' />

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="/login">Войти в аккаунт</Link>
    </View>
  )
}
