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
const [selectedExercise, setSelectedExercise] = useState("");
const [selectedMachine, setSelectedMachine] = useState("");
const [search, setSearch] = useState("");


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
    // Primero, obten el usuario autenticado
    const { data: userData } = await supabase.auth.getUser()
    const userEmail = userData?.user?.email
    const userId = userData?.user?.id

    // Haz el query de entries
    let query = supabase
      .from("workout_entries")
      .select(`
        *,
        profiles(id, nombre),
        exercises(id, nombre),
        machines(id, nombre)
      `)
      .order("fecha", { ascending: false })

    // Si NO es admin, solo busca por su user_id
    if (userEmail !== "thexzebagb@live.com" && userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query
    setEntries(data || [])
    setLoading(false)
  }
  fetchEntries()
}, [])

// Opciones únicas, solo ejercicios/maquinas que existen en registros
const exerciseOptions = Array.from(
  new Set(entries.map(e => e.exercises?.nombre).filter(Boolean))
);
const machineOptions = Array.from(
  new Set(entries.map(e => e.machines?.nombre).filter(Boolean))
);

  // FILTRO COMBINADO 🟢
 const filteredEntries = entries.filter(e => {
  const fechaOk = !selectedDate || (e.fecha && e.fecha.slice(0, 10) === selectedDate);
  const exOk = !selectedExercise || e.exercises?.nombre === selectedExercise;
  const mOk = !selectedMachine || e.machines?.nombre === selectedMachine;

  // Filtro por texto (busca en ejercicio, máquina y usuario)
  const searchLower = search.trim().toLowerCase();
  const matchesSearch =
    !searchLower ||
    (e.exercises?.nombre?.toLowerCase().includes(searchLower)) ||
    (e.machines?.nombre?.toLowerCase().includes(searchLower)) ||
    (e.profiles?.nombre?.toLowerCase().includes(searchLower)) ||
    (e.user_id?.toLowerCase().includes(searchLower));
  return fechaOk && exOk && mOk && matchesSearch;
});


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
      {/* Buscador global */}
      <div className="mb-3" style={{ maxWidth: 400 }}>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar ejercicio, máquina o usuario..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      {/* Filtros combinados 🟢 */}
      <div className="row g-3 mb-4">
        <div className="col-sm-3">
          <label className="form-label mb-1">Filtrar por fecha</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setPage(1); }}
          />
        </div>
        <div className="col-sm-3">
          <label className="form-label mb-1">Filtrar por ejercicio</label>
          <select
            className="form-select"
            value={selectedExercise}
            onChange={e => { setSelectedExercise(e.target.value); setPage(1); }}
          >
            <option value="">Todos</option>
            {exerciseOptions.map(name => (
              <option value={name!} key={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-3">
          <label className="form-label mb-1">Filtrar por máquina</label>
          <select
            className="form-select"
            value={selectedMachine}
            onChange={e => { setSelectedMachine(e.target.value); setPage(1); }}
          >
            <option value="">Todas</option>
            {machineOptions.map(name => (
              <option value={name!} key={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-3 d-flex align-items-end gap-2">
          {(selectedDate || selectedExercise || selectedMachine) && (
            <button
              className="btn btn-outline-secondary mt-3"
              onClick={() => {
                setSelectedDate("");
                setSelectedExercise("");
                setSelectedMachine("");
                setPage(1);
              }}
            >
              Limpiar filtros
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
