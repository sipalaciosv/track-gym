"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Profile } from "@/types/db"

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Cargar usuario y perfil al entrar
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user) {
        // Si no hay usuario, manda al login
        router.push("/login")
        return
      }
      setUserEmail(user.email ?? null)


      // Ahora carga el profile (nombre)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profileData || null)
      setLoading(false)
    }

    getUser()
    // eslint-disable-next-line
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return <div className="container mt-5">Cargando...</div>
  }

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>
      <p>
        <strong>Correo:</strong> {userEmail}
      </p>
      <p>
        <strong>Nombre de perfil:</strong> {profile?.nombre || "No definido"}
      </p>
      <button className="btn btn-outline-danger" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  )
}
