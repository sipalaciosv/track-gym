"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Profile, Exercise, Machine, WorkoutEntry } from "@/types/db"

type EntryRow = WorkoutEntry & {
  profiles: Profile | null
  exercises: Exercise | null
  machines: Machine | null
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("workout_entries")
        .select(`
          *,
          profiles(id, nombre),
          exercises(id, nombre),
          machines(id, nombre)
        `)
        .order("fecha", { ascending: false })

      if (!error && data) setEntries(data)
      setLoading(false)
    }
    fetchEntries()
    // eslint-disable-next-line
  }, [])

  // Filtrado de registros por fecha seleccionada
  const filteredEntries = selectedDate
    ? entries.filter(e => e.fecha && e.fecha.slice(0, 10) === selectedDate)
    : entries

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres borrar este registro?")) return
    const { error } = await supabase.from("workout_entries").delete().eq("id", id)
    if (!error) setEntries(entries.filter(e => e.id !== id))
    else alert("Error al borrar: " + error.message)
  }

  if (loading) {
    return <div className="container mt-5">Cargando registros...</div>
  }

  return (
    <div className="container mt-5">
      <h2>Historial de entrenamientos</h2>

      {/* FILTRO POR FECHA */}
      <div className="mb-3">
        <label className="form-label">Filtrar por fecha</label>
        <input
          type="date"
          className="form-control"
          style={{ maxWidth: 250 }}
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        {selectedDate && (
          <button className="btn btn-link p-0 ms-2" onClick={() => setSelectedDate("")}>
            Limpiar filtro
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Ejercicio</th>
              <th>Máquina</th>
              <th>Series</th>
              <th>Reps</th>
              <th>Peso</th>
              <th>Comentario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center">No hay registros en esta fecha.</td>
              </tr>
            )}
            {filteredEntries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.fecha?.slice(0, 10)}</td>
                <td>{entry.profiles?.nombre || entry.user_id}</td>
                <td>{entry.exercises?.nombre || "-"}</td>
                <td>{entry.machines?.nombre || "-"}</td>
                <td>{entry.series_total ?? "-"}</td>
                <td>{entry.reps_total ?? "-"}</td>
                <td>{entry.peso ? `${entry.peso} ${entry.tipo_peso || ""}` : "-"}</td>
                <td>{entry.comentario ?? ""}</td>
                <td>
                  <a href={`/entries/${entry.id}/edit`} className="btn btn-sm btn-warning me-2">Editar</a>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
