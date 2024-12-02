import { Slot, Stack } from "expo-router"
import { SessionProvider } from "../components/ctx"

export default function Root() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  )
}
