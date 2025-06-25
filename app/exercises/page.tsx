"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Exercise, Machine } from "@/types/db"

const PAGE_SIZE = 6

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<(Exercise & { machine: Machine | null })[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedImg, setExpandedImg] = useState<string | null>(null)
  const [descExpanded, setDescExpanded] = useState<{ [key: string]: boolean }>({})
  const [page, setPage] = useState(1)

  // Para editar/borrar
  const [showEditModal, setShowEditModal] = useState(false)
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise & { machine: Machine | null } | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editGrupo, setEditGrupo] = useState("")
  const [editMachineId, setEditMachineId] = useState<string | null>("")
  const [editGifUrl, setEditGifUrl] = useState("")

  const supabase = createClient()

  // Fetch de ejercicios y máquinas
  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*, machine:machines(*)")
        .eq("activo", true)
        .order("nombre", { ascending: true })
      if (!error && data) setExercises(data)
      setLoading(false)
    }
    const fetchMachines = async () => {
      const { data, error } = await supabase.from("machines").select("*").order("nombre")
      if (!error && data) setMachines(data)
    }
    fetchExercises()
    fetchMachines()
  }, [])

  // Buscador simple (nombre, grupo muscular, máquina)
  const filtered = exercises.filter(ex =>
    ex.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    ex.grupo_muscular?.toLowerCase().includes(search.toLowerCase()) ||
    ex.machine?.nombre?.toLowerCase().includes(search.toLowerCase())
  )

  // Paginación
  const maxPage = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // --- Editar y Borrar ---
  function openEditModal(ex: Exercise & { machine: Machine | null }) {
    setExerciseToEdit(ex)
    setEditName(ex.nombre || "")
    setEditDesc(ex.descripcion || "")
    setEditGrupo(ex.grupo_muscular || "")
    setEditMachineId(ex.machine ? ex.machine.id : "")
    setEditGifUrl(ex.gif_url || "")
    setShowEditModal(true)
  }

  async function handleEditSave() {
    if (!exerciseToEdit) return
    const { error, data } = await supabase
      .from("exercises")
      .update({
        nombre: editName,
        descripcion: editDesc,
        grupo_muscular: editGrupo,
        machine_id: editMachineId || null,
        gif_url: editGifUrl,
      })
      .eq("id", exerciseToEdit.id)
      .select("*, machine:machines(*)")
      .single()
    if (!error && data) {
      setExercises(
        exercises.map(e =>
          e.id === data.id ? { ...e, ...data } : e
        )
      )
      setShowEditModal(false)
    } else {
      alert("Error al editar")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que quieres ocultar este ejercicio?")) return;
  const { error } = await supabase
    .from("exercises")
    .update({ activo: false })
    .eq("id", id);
  if (!error) setExercises(exercises => exercises.map(e => e.id === id ? { ...e, activo: false } : e));
  else alert("Error al ocultar: " + error.message);
  }

  if (loading) return <div className="container mt-5">Cargando ejercicios...</div>

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Ejercicios registrados</h2>

      {/* Buscador */}
      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Buscar nombre del ejercicio...."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      {/* Grid responsive */}
      <div className="row">
        {paginated.length === 0 && <p>No hay ejercicios.</p>}
        {paginated.map((ex) => (
          <div key={ex.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              {/* Imagen expandible */}
              {ex.gif_url && (
                <img
                  src={ex.gif_url}
                  alt={ex.nombre + " GIF"}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: 180, cursor: "pointer" }}
                  onClick={() => setExpandedImg(ex.gif_url!)}
                />
              )}
              {ex.foto_url && (
                <img
                  src={ex.foto_url}
                  alt={ex.nombre}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: 180, cursor: "pointer" }}
                  onClick={() => setExpandedImg(ex.foto_url!)}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{ex.nombre}</h5>
                {ex.grupo_muscular && <span className="badge bg-info mb-2">{ex.grupo_muscular}</span>}
                <p className="mb-1">
                  <strong>Máquina:</strong> {ex.machine ? ex.machine.nombre : "Sin máquina"}
                </p>
                {/* Descripción recortada */}
                {ex.descripcion && (
                  <p className="card-text" style={{ minHeight: 48 }}>
                    {descExpanded[ex.id]
                      ? ex.descripcion + " "
                      : ex.descripcion.length > 110
                        ? ex.descripcion.slice(0, 110) + "..."
                        : ex.descripcion}
                    {ex.descripcion.length > 110 && (
                      <button
                        className="btn btn-link btn-sm p-0 ms-1"
                        style={{ verticalAlign: "baseline" }}
                        onClick={() => setDescExpanded(d => ({ ...d, [ex.id]: !d[ex.id] }))}
                      >
                        {descExpanded[ex.id] ? "ver menos" : "ver más"}
                      </button>
                    )}
                  </p>
                )}
                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => openEditModal(ex)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(ex.id)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
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

      {/* Modal imagen expandida */}
      {expandedImg && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000
          }}
          onClick={() => setExpandedImg(null)}
        >
          <img
            src={expandedImg}
            alt="Ejercicio"
            style={{
              maxHeight: "80vh", maxWidth: "95vw", borderRadius: 15, boxShadow: "0 2px 16px #000"
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal editar ejercicio */}
      {showEditModal && exerciseToEdit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="card p-4"
            style={{ minWidth: 300, maxWidth: 400 }}
            onClick={e => e.stopPropagation()}
          >
            <h5>Editar ejercicio</h5>
            <div className="mb-2">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Grupo muscular</label>
              <input
                className="form-control"
                value={editGrupo}
                onChange={e => setEditGrupo(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">URL GIF</label>
              <input
                className="form-control"
                value={editGifUrl}
                onChange={e => setEditGifUrl(e.target.value)}
                placeholder="https://fitcron.com/ejemplo.gif"
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Máquina</label>
              <select
                className="form-select"
                value={editMachineId || ""}
                onChange={e => setEditMachineId(e.target.value)}
              >
                <option value="">Sin máquina</option>
                {machines.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={handleEditSave}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
