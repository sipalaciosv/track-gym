"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Exercise, Machine } from "@/types/db"

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<(Exercise & { machine: Machine | null })[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [showEditModal, setShowEditModal] = useState(false)
const [exerciseToEdit, setExerciseToEdit] = useState<Exercise & { machine: Machine | null } | null>(null)
const [editName, setEditName] = useState("")
const [editDesc, setEditDesc] = useState("")
const [editGrupo, setEditGrupo] = useState("")

function openEditModal(ex: Exercise & { machine: Machine | null }) {
  setExerciseToEdit(ex)
  setEditName(ex.nombre || "")
  setEditDesc(ex.descripcion || "")
  setEditGrupo(ex.grupo_muscular || "")
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
    })
    .eq("id", exerciseToEdit.id)
    .select()
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
  if (!confirm("¿Seguro que quieres borrar este ejercicio?")) return
  const { error } = await supabase.from("exercises").delete().eq("id", id)
  if (!error) setExercises(exercises.filter(e => e.id !== id))
  else alert("Error al borrar: " + error.message)
}

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*, machine:machines(*)") // esto trae los datos de la máquina relacionada
        .order("nombre", { ascending: true })

      if (!error && data) {
        setExercises(data)
      }
      setLoading(false)
    }
    fetchExercises()
    // eslint-disable-next-line
  }, [])

  if (loading) {
    return <div className="container mt-5">Cargando ejercicios...</div>
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Ejercicios registrados</h2>
      <div className="row">
        {exercises.length === 0 && <p>No hay ejercicios registrados.</p>}
        {exercises.map((ex) => (
          <div key={ex.id} className="col-md-4 mb-4">
            <div className="card h-100">
              {ex.foto_url && (
                <img
                  src={ex.foto_url}
                  alt={ex.nombre}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: 180 }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{ex.nombre}</h5>
                {ex.grupo_muscular && <span className="badge bg-info mb-2">{ex.grupo_muscular}</span>}
                <p className="mb-1">
                  <strong>Máquina:</strong> {ex.machine ? ex.machine.nombre : "Sin máquina"}
                </p>
                {ex.descripcion && <p className="card-text">{ex.descripcion}</p>}
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
