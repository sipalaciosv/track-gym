"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <button onClick={handleLogout} className="btn btn-outline-light btn-sm ms-3">
      Cerrar sesión
    </button>
  )
}
