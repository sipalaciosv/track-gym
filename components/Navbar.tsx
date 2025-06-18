"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import LogoutButton from "./LogoutButton"
import Link from "next/link"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
    // Opcional: Suscríbete a cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
    return () => { listener?.subscription.unsubscribe() }
    // eslint-disable-next-line
  }, [])

  if (!user) return null // ¡No hay sesión, no renderices el Navbar!
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container">
        <Link href="/dashboard" className="navbar-brand">
          Mi Gimnasio
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-navbar"
          aria-controls="main-navbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="main-navbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/entries" className="nav-link">
                Registros
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/entries/new" className="nav-link">
                Nuevo registro
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/exercises" className="nav-link">
                Ejercicios
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/machines" className="nav-link">
                Máquinas
              </Link>
            </li>
            {/* Agrega más enlaces si quieres */}
          </ul>
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}
