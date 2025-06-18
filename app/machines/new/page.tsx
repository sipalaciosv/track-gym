"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function NewMachinePage() {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    let foto_url = null

    // 1. Si hay foto, súbela a Supabase Storage
    if (fotoFile) {
      const fileExt = fotoFile.name.split(".").pop()
      const fileName = `${nombre.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`
      const { data, error: storageError } = await supabase.storage
        .from("maquinas")
        .upload(fileName, fotoFile)
      if (storageError) {
        setError("Error subiendo imagen: " + storageError.message)
        setLoading(false)
        return
      }
      // Obtén la URL pública de la imagen
      const { data: publicUrlData } = supabase
        .storage
        .from("maquinas")
        .getPublicUrl(fileName)
      foto_url = publicUrlData?.publicUrl
    }

    // 2. Inserta la máquina en la base de datos
    const { error: dbError } = await supabase.from("machines").insert([
      {
        nombre,
        descripcion,
        foto_url,
      },
    ])

    setLoading(false)

    if (dbError) {
      setError(dbError.message)
    } else {
      router.push("/machines")
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2>Agregar nueva máquina</h2>
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
          {loading ? "Guardando..." : "Agregar máquina"}
        </button>
      </form>
    </div>
  )
}
