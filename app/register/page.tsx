// components/RegisterForm.tsx
"use client"

import React, { useState } from "react"
import { createClient } from "@/utils/supabase/client"

export default function RegisterForm() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // 1. Registrar usuario en Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const user_id = data?.user?.id

    if (!user_id) {
      setError("No se pudo obtener el usuario. Intenta de nuevo.")
      return
    }

    // 2. Crear perfil en la tabla "profiles"
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user_id,
        nombre,
        // Puedes agregar otros campos si quieres
        // email: email, // solo si lo necesitas
      }
    ])

    if (profileError) {
      setError(profileError.message)
      return
    }

    setSuccess("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.")
    setEmail("")
    setPassword("")
    setNombre("")
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h3>Registro</h3>
      <div className="mb-3">
        <label>Email</label>
        <input
          className="form-control"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Contraseña</label>
        <input
          className="form-control"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Nombre</label>
        <input
          className="form-control"
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <button className="btn btn-primary" type="submit">
        Registrarse
      </button>
    </form>
  )
}
