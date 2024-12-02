import { useContext, createContext, type PropsWithChildren, useState, useEffect } from "react"
import fetchApi, { fetchSignIn, logOut } from "@/utils/api"
import { router } from "expo-router"

const AuthContext = createContext<{
  signIn: (a: string, b: string) => Promise<boolean>
  signOut: () => void
  user?: any
  loading: boolean
}>({
  signIn: async () => false,
  signOut: () => null,
  user: null,
  loading: true,
})

export function useSession() {
  const value = useContext(AuthContext)

  return value
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApi("/current-user")
      .then((data) => {
        if (data) setUser(data)
        setLoading(false)
      })
      .catch((e) => {
        setLoading(false)
        console.log(e)
      })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        signIn: async (login: string, password: string) => {
          // setSession('xxx');
          let user = await fetchSignIn(login, password)
          setUser(user)
          return !!user
        },
        signOut: () => {
          logOut()
          setUser(null)
          router.replace("/login")
        },
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
