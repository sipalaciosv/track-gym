"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Profile, Exercise, Machine, WorkoutEntry } from "@/types/db"
import Loader from "@/components/Loader";
import "@/components/Loader.css";
const PAGE_SIZE = 10; // Cambia el tamaño de página si quieres más/menos por página

type EntryRow = WorkoutEntry & {
  profiles: Profile | null
  exercises: Exercise | null
  machines: Machine | null
}

function formatDate(fecha: string | undefined) {
  if (!fecha) return "-"
  // Soporta "2025-06-23" o "2025-06-23T12:00:00"
  const [year, month, day] = fecha.slice(0, 10).split("-")
  const mesStr = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  // Devuelve "23 Jun"
  return `${day} ${mesStr[parseInt(month, 10)]}`
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const supabase = createClient()
const [isDark, setIsDark] = useState(false);
const [page, setPage] = useState(1);

useEffect(() => {
  const checkDark = () => {
    setIsDark(document.body.classList.contains("dark"));
  };
  checkDark();
  // Escucha cambios por si cambias el modo dinámicamente
  window.addEventListener("toggle-dark-mode", checkDark);
  return () => window.removeEventListener("toggle-dark-mode", checkDark);
}, []);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase
        .from("workout_entries")
        .select(`
          *,
          profiles(id, nombre),
          exercises(id, nombre),
          machines(id, nombre)
        `)
        .order("fecha", { ascending: false })
      setEntries(data || [])
      setLoading(false)
    }
    fetchEntries()
  }, [])

  // Filtro por fecha
  const filteredEntries = selectedDate
    ? entries.filter(e => e.fecha && e.fecha.slice(0, 10) === selectedDate)
    : entries
const maxPage = Math.ceil(filteredEntries.length / PAGE_SIZE);
const paginatedEntries = filteredEntries.slice(
  (page - 1) * PAGE_SIZE,
  page * PAGE_SIZE
);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres borrar este registro?")) return
    const { error } = await supabase.from("workout_entries").delete().eq("id", id)
    if (!error) setEntries(entries.filter(e => e.id !== id))
    else alert("Error al borrar: " + error.message)
  }

  if (loading) {
    return <Loader message="Cargando entrenamientos..." />;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 1100 }}>
      <h2 className="mb-4">Historial de entrenamientos</h2>

      {/* Filtro por fecha */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <label className="form-label mb-1">Filtrar por fecha</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={e => {
  setSelectedDate(e.target.value);
  setPage(1);
}}
          />
        </div>
        <div className="col-sm-4 d-flex align-items-end gap-2">
          {selectedDate && (
            <button
              className="btn btn-outline-secondary mt-3"
              onClick={() => {
  setSelectedDate("");
  setPage(1);
}}
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      <div className="card shadow-lg">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 align-middle">
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
                
               {paginatedEntries.length === 0 ? (
  <tr>
    <td colSpan={9} className="text-center py-4 text-muted">
      No hay registros para estos filtros.
    </td>
  </tr>
) : (
  paginatedEntries.map(entry => (
    <tr key={entry.id}>
      <td>{formatDate(entry.fecha)}</td>
      <td>{entry.profiles?.nombre || entry.user_id}</td>
      <td>{entry.exercises?.nombre || "-"}</td>
      <td>{entry.machines?.nombre || "-"}</td>
      <td>{entry.series_total ?? "-"}</td>
      <td>{entry.reps_total ?? "-"}</td>
      <td>{entry.peso ? `${entry.peso} ${entry.tipo_peso || ""}` : "-"}</td>
      <td>{entry.comentario ?? ""}</td>
      <td>
        <a
          href={`/entries/${entry.id}/edit`}
          className="btn btn-sm btn-warning me-2"
        >
          Editar
        </a>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleDelete(entry.id)}
        >
          Borrar
        </button>
      </td>
    </tr>
  ))
)}

              </tbody>

            </table>
            {maxPage > 1 && (
  <nav className="d-flex justify-content-center my-4">
    <ul className="pagination mb-0">
      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
      </li>
      {[...Array(maxPage)].map((_, i) => (
        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
        </li>
      ))}
      <li className={`page-item ${page === maxPage ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => setPage(p => Math.min(maxPage, p + 1))}>Siguiente</button>
      </li>
    </ul>
  </nav>
)}
          </div>
        </div>
      </div>
    </div>
  )
}
