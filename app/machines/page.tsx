"use client"

import React, { useEffect, useState, ChangeEvent } from "react"
import { createClient } from "@/utils/supabase/client"
import { Machine } from "@/types/db"

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [machineToEdit, setMachineToEdit] = useState<Machine | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editFotoUrl, setEditFotoUrl] = useState("")
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editUploading, setEditUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchMachines = async () => {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("nombre", { ascending: true })
      if (!error && data) {
        setMachines(data)
      }
      setLoading(false)
    }
    fetchMachines()
    // eslint-disable-next-line
  }, [])

  function openEditModal(machine: Machine) {
    setMachineToEdit(machine)
    setEditName(machine.nombre || "")
    setEditDesc(machine.descripcion || "")
    setEditFotoUrl(machine.foto_url || "")
    setEditImageFile(null)
    setShowEditModal(true)
  }

  // Handle file select
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0]
    if (file) setEditImageFile(file)
  }

  async function handleEditSave() {
    if (!machineToEdit) return
    setEditUploading(true)

    let finalFotoUrl = editFotoUrl

    // Si el usuario sube un archivo, súbelo al bucket y usa esa url
    if (editImageFile) {
      const ext = editImageFile.name.split('.').pop()
      const fileName = `maquinas/${editName.replace(/\s+/g, '_')}_${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("maquinas") // Asegúrate que el bucket se llama así
        .upload(fileName, editImageFile, {
          cacheControl: "3600",
          upsert: true,
        })
      if (uploadError) {
        alert("Error subiendo imagen: " + uploadError.message)
        setEditUploading(false)
        return
      }
      // El path público
      const { data: publicUrl } = supabase.storage
        .from("maquinas")
        .getPublicUrl(fileName)
      finalFotoUrl = publicUrl.publicUrl
    }

    // Actualiza la máquina en la base de datos
    const { error, data } = await supabase
      .from("machines")
      .update({
        nombre: editName,
        descripcion: editDesc,
        foto_url: finalFotoUrl,
      })
      .eq("id", machineToEdit.id)
      .select()
      .single()
    setEditUploading(false)

    if (!error && data) {
      setMachines(
        machines.map(m =>
          m.id === data.id ? { ...m, ...data } : m
        )
      )
      setShowEditModal(false)
    } else {
      alert("Error al editar")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que quieres borrar esta máquina?")) return
    const { error } = await supabase.from("machines").delete().eq("id", id)
    if (!error) setMachines(machines.filter(m => m.id !== id))
    else alert("Error al borrar: " + error.message)
  }

  if (loading) {
    return <div className="container mt-5">Cargando máquinas...</div>
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Máquinas del gimnasio</h2>
      <div className="row">
        {machines.length === 0 && <p>No hay máquinas registradas.</p>}
        {machines.map((machine) => (
          <div key={machine.id} className="col-md-4 mb-4">
            <div className="card h-100">
              {machine.foto_url && (
                <img
                  src={machine.foto_url}
                  alt={machine.nombre}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: 180 }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{machine.nombre}</h5>
                {machine.descripcion && <p className="card-text">{machine.descripcion}</p>}
                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => openEditModal(machine)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(machine.id)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN */}
      {showEditModal && machineToEdit && (
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
            <h5>Editar máquina</h5>
            <div className="mb-2">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={editName}
                onChange={e => setEditName(e.target.value)}
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
              <label className="form-label">Foto</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
              />
              {editFotoUrl && (
                <img src={editFotoUrl} alt="actual" style={{ maxHeight: 100, marginTop: 8 }} />
              )}
            </div>
            <div className="d-flex gap-2 justify-content-end mt-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowEditModal(false)}
                disabled={editUploading}
              >
                Cancelar
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={handleEditSave}
                disabled={editUploading}
              >
                {editUploading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
