"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Profile } from "@/types/db"
import { LogOut, User, Dumbbell, FileText } from "lucide-react"

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUserEmail(user.email ?? null)

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
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Cargando...</span></div>
      </div>
    )
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "95vh",
        background: "linear-gradient(135deg, #f2f2f7 0%, #fff 100%)",
      }}
    >
      <div className="card shadow-lg p-4" style={{ minWidth: 350, borderRadius: 20, background: "#fff" }}>
        <div className="mb-3 d-flex align-items-center gap-3">
          <User size={38} color="#990300" strokeWidth={2.2} />
          <div>
            <h2 className="mb-0" style={{ fontWeight: 700 }}>¡Hola, {profile?.nombre || "Atleta"}!</h2>
            <small className="text-muted">{userEmail}</small>
          </div>
        </div>

        <hr />

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <a href="/entries" className="text-decoration-none">
              <div className="card shadow-sm h-100 p-3 d-flex flex-row align-items-center gap-3 hover-shadow" style={{ borderRadius: 15 }}>
                <FileText size={30} color="#990300" />
                <div>
                  <div style={{ fontWeight: 600 }}>Historial</div>
                  <small className="text-muted">Ver todos tus registros</small>
                </div>
              </div>
            </a>
          </div>
          <div className="col-12 col-md-6">
            <a href="/exercises" className="text-decoration-none">
              <div className="card shadow-sm h-100 p-3 d-flex flex-row align-items-center gap-3 hover-shadow" style={{ borderRadius: 15 }}>
                <Dumbbell size={30} color="#990300" />
                <div>
                  <div style={{ fontWeight: 600 }}>Ejercicios</div>
                  <small className="text-muted">Gestiona tus ejercicios</small>
                </div>
              </div>
            </a>
          </div>
        </div>

        <button className="btn btn-outline-danger mt-3 w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}
