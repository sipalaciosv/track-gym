"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Profile, Exercise, Machine, WorkoutEntry } from "@/types/db"

export default function EditEntryPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const id = params.id as string

  // Estados para el formulario (igual que en /entries/new)
  const [entry, setEntry] = useState<WorkoutEntry | null>(null)
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [ejercicios, setEjercicios] = useState<Exercise[]>([])
  const [maquinas, setMaquinas] = useState<Machine[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [lastEntry, setLastEntry] = useState<any>(null) 

  useEffect(() => {
    // Traer la entrada actual
    supabase.from("workout_entries").select("*").eq("id", id).single()
      .then(({ data }) => setEntry(data))
    // Traer opciones
    supabase.from("profiles").select("*").then(({ data }) => setUsuarios(data ?? []))
    supabase.from("exercises").select("*").then(({ data }) => setEjercicios(data ?? []))
    supabase.from("machines").select("*").then(({ data }) => setMaquinas(data ?? []))
    setLoading(false)
    // eslint-disable-next-line
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!entry) return
    setEntry({ ...entry, [e.target.name]: e.target.value })
  }
  useEffect(() => {
  // Solo busca si hay usuario y ejercicio seleccionados
  if (!entry?.user_id || !entry?.exercise_id) {
    setLastEntry(null)
    return
  }
  // Busca la última entrada del usuario para ese ejercicio, *excluyendo* la actual
  supabase
    .from("workout_entries")
    .select("*")
    .eq("user_id", entry.user_id)
    .eq("exercise_id", entry.exercise_id)
    .neq("id", id)
    .order("fecha", { ascending: false })
    .limit(1)
    .then(({ data }) => {
      if (data && data.length > 0) setLastEntry(data[0])
      else setLastEntry(null)
    })
}, [entry?.user_id, entry?.exercise_id, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry) return
    setError("")
    const { error } = await supabase
      .from("workout_entries")
      .update(entry)
      .eq("id", id)
    if (error) setError(error.message)
    else router.push("/entries")
  }

  if (loading || !entry) return <div className="container mt-5">Cargando...</div>

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2>Editar registro</h2>
      <form onSubmit={handleSubmit}>
        {/* Usuario */}
        <div className="mb-3">
          <label className="form-label">Usuario</label>
          <select
            className="form-select"
            name="user_id"
            value={entry.user_id}
            onChange={handleChange}
            required
          >
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
        {/* Fecha */}
        <div className="mb-3">
          <label className="form-label">Fecha</label>
          <input
            className="form-control"
            name="fecha"
            type="date"
            value={entry.fecha ? entry.fecha.slice(0, 10) : ""}
            onChange={handleChange}
            required
          />
        </div>
        {/* Ejercicio */}
        <div className="mb-3">
          <label className="form-label">Ejercicio</label>
          
          <select
            className="form-select"
            name="exercise_id"
            value={entry.exercise_id}
            onChange={handleChange}
            required
          >
            {ejercicios.map(ej => (
              <option key={ej.id} value={ej.id}>{ej.nombre}</option>
            ))}
          </select>
          {lastEntry && (
  <div className="alert alert-info mt-2">
    <strong>Última vez:</strong>{" "}
    {lastEntry.fecha?.slice(0,10)} — 
    {lastEntry.series_total || "-"} series de {lastEntry.reps_total || "-"} reps, 
    {lastEntry.peso ? `${lastEntry.peso} ${lastEntry.tipo_peso || ""}` : "-"}
  </div>
)}

        </div>
        {/* Máquina */}
        <div className="mb-3">
          <label className="form-label">Máquina</label>
          <select
            className="form-select"
            name="machine_id"
            value={entry.machine_id || ""}
            onChange={handleChange}
          >
            <option value="">(Ninguna)</option>
            {maquinas.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
        {/* Series, reps, peso, comentario */}
        <div className="mb-3">
          <label className="form-label">Series totales</label>
          <input
            className="form-control"
            name="series_total"
            type="number"
            value={entry.series_total || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Repeticiones totales</label>
          <input
            className="form-control"
            name="reps_total"
            type="number"
            value={entry.reps_total || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Peso</label>
          <input
            className="form-control"
            name="peso"
            type="text"
            value={entry.peso || ""}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Tipo de peso</label>
          <input
            className="form-control"
            name="tipo_peso"
            type="text"
            value={entry.tipo_peso || ""}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Comentario</label>
          <input
            className="form-control"
            name="comentario"
            type="text"
            value={entry.comentario || ""}
            onChange={handleChange}
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-success">Guardar cambios</button>
      </form>
    </div>
  )
}
