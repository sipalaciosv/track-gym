"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Machine } from "@/types/db"

export default function NewExercisePage() {
  const [nombre, setNombre] = useState("")
  const [grupoMuscular, setGrupoMuscular] = useState("")
  const [machineId, setMachineId] = useState<string | null>(null)
  const [descripcion, setDescripcion] = useState("")
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [machines, setMachines] = useState<Machine[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Cargar máquinas disponibles para el select
    const fetchMachines = async () => {
      const { data, error } = await supabase.from("machines").select("*").order("nombre", { ascending: true })
      if (!error && data) setMachines(data)
    }
    fetchMachines()
    // eslint-disable-next-line
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    let foto_url = null

    // 1. Subir foto si hay
    if (fotoFile) {
      const fileExt = fotoFile.name.split(".").pop()
      const fileName = `${nombre.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`
      const { data, error: storageError } = await supabase.storage
        .from("ejercicios")
        .upload(fileName, fotoFile)
      if (storageError) {
        setError("Error subiendo imagen: " + storageError.message)
        setLoading(false)
        return
      }
      // Obtén URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from("ejercicios")
        .getPublicUrl(fileName)
      foto_url = publicUrlData?.publicUrl
    }

    // 2. Insertar en tabla exercises
    const { error: dbError } = await supabase.from("exercises").insert([
      {
        nombre,
        grupo_muscular: grupoMuscular,
        machine_id: machineId,
        descripcion,
        foto_url,
      },
    ])

    setLoading(false)

    if (dbError) {
      setError(dbError.message)
    } else {
      router.push("/exercises")
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2>Agregar nuevo ejercicio</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Grupo muscular</label>
          <input
            type="text"
            className="form-control"
            value={grupoMuscular}
            onChange={e => setGrupoMuscular(e.target.value)}
            placeholder="Ej: pecho, espalda, pierna, etc"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Máquina asociada</label>
          <select
            className="form-select"
            value={machineId ?? ""}
            onChange={e => setMachineId(e.target.value || null)}
          >
            <option value="">(Ninguna)</option>
            {machines.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-control"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={2}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Foto</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={e => setFotoFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Guardando..." : "Agregar ejercicio"}
        </button>
      </form>
    </div>
  )
}
