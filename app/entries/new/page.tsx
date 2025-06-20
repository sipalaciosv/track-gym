"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Profile, Exercise, Machine } from "@/types/db"
import Select from "react-select"

export default function NewEntryPage() {
  const USUARIOS_ESPECIALES = ["25f3ef1e-4f7f-4da0-acdd-0ae9d47a22f2", "f769f136-ba9d-4f14-a9bd-b5eaab8d973c"]
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [ejercicios, setEjercicios] = useState<Exercise[]>([])
  const [maquinas, setMaquinas] = useState<Machine[]>([])
const [lastEntry, setLastEntry] = useState<any>(null)  // Puedes tipar mejor si tienes tu tipo WorkoutEntry

  // Estados para nueva entrada
  const [userId, setUserId] = useState<string>("")
  const [exerciseId, setExerciseId] = useState<string>("")
  const [machineId, setMachineId] = useState<string>("")
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10))
  const [seriesTotal, setSeriesTotal] = useState<number>(4)
  const [repsTotal, setRepsTotal] = useState<number>(12)
  const [tipoPeso, setTipoPeso] = useState<string>("total")
  const [peso, setPeso] = useState<string>("")
  const [comentario, setComentario] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()
const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Para agregar ejercicio/máquina en línea
  const [showNewExercise, setShowNewExercise] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState("")
  const [showNewMachine, setShowNewMachine] = useState(false)
  const [newMachineName, setNewMachineName] = useState("")
  const [miniError, setMiniError] = useState("")

  useEffect(() => {
    // Obtener usuario autenticado
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserEmail(data?.user?.email ?? null)
      setCurrentUserId(data?.user?.id ?? null)
      // Si no es admin, selecciona su propio usuario por defecto
      if (data?.user?.email !== "thexzebagb@live.com" && data?.user?.id) {
        setUserId(data.user.id)
      }
    })
  }, [])
  useEffect(() => {
    supabase.from("profiles").select("*").then(({ data }) => setUsuarios(data ?? []))
    supabase.from("exercises").select("*").then(({ data }) => setEjercicios(data ?? []))
    supabase.from("machines").select("*").then(({ data }) => setMaquinas(data ?? []))
    // eslint-disable-next-line
  }, [])
    useEffect(() => {
  if (!userId || !exerciseId) {
    setLastEntry(null)
    return
  }
  supabase
    .from("workout_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .order("fecha", { ascending: false })
    .limit(1)
    .then(({ data }) => {
      if (data && data.length > 0) setLastEntry(data[0])
      else setLastEntry(null)
    })
}, [userId, exerciseId])

  // Nuevo ejercicio en línea (NO usa form, usa div y botón)
  const handleAddNewExercise = async () => {
    setMiniError("")
    if (!newExerciseName.trim()) {
      setMiniError("Debes poner un nombre")
      return
    }
    const { data, error } = await supabase.from("exercises").insert([{ nombre: newExerciseName }]).select().single()
    if (!error && data) {
      setEjercicios([...ejercicios, data])
      setExerciseId(data.id)
      setShowNewExercise(false)
      setNewExerciseName("")
    } else if (error) {
      setMiniError(error.message)
    }
  }

  // Nueva máquina en línea (igual que arriba)
  const handleAddNewMachine = async () => {
    setMiniError("")
    if (!newMachineName.trim()) {
      setMiniError("Debes poner un nombre")
      return
    }
    const { data, error } = await supabase.from("machines").insert([{ nombre: newMachineName }]).select().single()
    if (!error && data) {
      setMaquinas([...maquinas, data])
      setMachineId(data.id)
      setShowNewMachine(false)
      setNewMachineName("")
    } else if (error) {
      setMiniError(error.message)
    }
  }
const getCurrentUserName = () => {
  const user = usuarios.find(u => u.id === currentUserId)
  return user?.nombre || user?.id || ""
}
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: dbError } = await supabase.from("workout_entries").insert([
      {
        user_id: userId,
        exercise_id: exerciseId,
        machine_id: machineId || null,
        fecha,
        series_total: seriesTotal,
        reps_total: repsTotal,
        tipo_peso: tipoPeso,
        peso,
        comentario,
      },
    ])

    setLoading(false)

    if (dbError) setError(dbError.message)
    else {
      alert('¡Entrada creada exitosamente!');
    }   
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2>Registrar entrenamiento</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="mb-3">
  <label className="form-label">Usuario *</label>
  {currentUserEmail === "thexzebagb@live.com" ? (
    <select
      className="form-select"
      value={userId}
      onChange={e => setUserId(e.target.value)}
      required
    >
      <option value="">Seleccione usuario</option>
      {usuarios
        .filter(u => USUARIOS_ESPECIALES.includes(u.id)) // SOLO estos dos
        .map(u => (
          <option key={u.id} value={u.id}>{u.nombre || u.id}</option>
        ))
      }
    </select>
  ) : (
    <input
      type="text"
      className="form-control"
      value={getCurrentUserName()}
      disabled
      readOnly
    />
  )}
</div>
        <div className="mb-3">
          <label className="form-label">Fecha *</label>
          <input
            type="date"
            className="form-control"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            required
          />
        </div>
        {/* ----------- EJERCICIO ------------ */}
        <div className="mb-3">
          {lastEntry && (
          <div className="alert alert-info mt-2">
            <strong>Última vez:</strong>{" "}
            {lastEntry.fecha?.slice(0,10)} — 
            {lastEntry.series_total || "-"} series de {lastEntry.reps_total || "-"} reps, 
            {lastEntry.peso ? `${lastEntry.peso} ${lastEntry.tipo_peso || ""}` : "-"}
          </div>
        )}

          <label className="form-label">Ejercicio *</label>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select"
              style={{ flex: 1 }}
              value={exerciseId}
              onChange={e => setExerciseId(e.target.value)}
              required
            >
              <option value="">Seleccione ejercicio</option>
              {ejercicios.map(ej => (
                <option key={ej.id} value={ej.id}>{ej.nombre}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setShowNewExercise(!showNewExercise)
                setMiniError("")
              }}
            >
              + Nuevo
            </button>
          </div>
          {showNewExercise && (
            <div className="mt-2 d-flex gap-2 align-items-center">
              <input
                className="form-control"
                placeholder="Nombre ejercicio"
                value={newExerciseName}
                onChange={e => setNewExerciseName(e.target.value)}
                required
                autoFocus
              />
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleAddNewExercise}
              >
                Guardar
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setShowNewExercise(false); setMiniError("") }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
        {/* ----------- MÁQUINA ------------ */}
        <div className="mb-3">
          <label className="form-label">Máquina</label>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select"
              style={{ flex: 1 }}
              value={machineId}
              onChange={e => setMachineId(e.target.value)}
            >
              <option value="">(Ninguna)</option>
              {maquinas.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setShowNewMachine(!showNewMachine)
                setMiniError("")
              }}
            >
              + Nueva
            </button>
          </div>
          {showNewMachine && (
            <div className="mt-2 d-flex gap-2 align-items-center">
              <input
                className="form-control"
                placeholder="Nombre máquina"
                value={newMachineName}
                onChange={e => setNewMachineName(e.target.value)}
                required
                autoFocus
              />
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleAddNewMachine}
              >
                Guardar
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setShowNewMachine(false); setMiniError("") }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
        {/* ----------- Series, reps, peso, comentario ------------ */}
        <div className="mb-3 row">
          <div className="col">
            <label className="form-label">Series totales *</label>
            <input
              type="number"
              min={1}
              className="form-control"
              value={seriesTotal}
              onChange={e => setSeriesTotal(Number(e.target.value))}
              required
            />
          </div>
          <div className="col">
            <label className="form-label">Reps totales *</label>
            <input
              type="number"
              min={1}
              className="form-control"
              value={repsTotal}
              onChange={e => setRepsTotal(Number(e.target.value))}
              required
            />
          </div>
        </div>
        <div className="mb-3 row">
          <div className="col">
            <label className="form-label">Tipo de peso</label>
            <select
              className="form-select"
              value={tipoPeso}
              onChange={e => setTipoPeso(e.target.value)}
            >
              <option value="total">Total</option>
              <option value="por lado">Por lado</option>
              <option value="mancuerna">Por mancuerna</option>
              <option value="ladrillos">Ladrillos</option>
              <option value="">Otro / No aplica</option>
            </select>
          </div>
          <div className="col">
            <label className="form-label">Peso</label>
            <input
              type="text"
              className="form-control"
              value={peso}
              onChange={e => setPeso(e.target.value)}
              placeholder="Ej: 40, 15+15, 3 ladrillos"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Comentario</label>
          <input
            type="text"
            className="form-control"
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            placeholder="Opcional (ej: sentí más fuerza, fallé, etc)"
          />
        </div>
        {miniError && <div className="alert alert-danger">{miniError}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Guardando..." : "Registrar"}
        </button>
      </form>
    </div>
  )
}
