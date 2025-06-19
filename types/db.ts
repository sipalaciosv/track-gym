// types/db.ts

export interface Machine {
  id: string
  nombre: string
  foto_url?: string
  descripcion?: string
}

export interface Exercise {
  id: string
  nombre: string
  grupo_muscular?: string
  machine_id?: string
  foto_url?: string
  descripcion?: string
}

export interface WorkoutEntry {
  id: string
  user_id: string
  exercise_id: string
  machine_id?: string
  fecha: string       
  series_total?: number
  reps_total?: number
  tipo_peso?: string
  peso?: string
  comentario?: string
}

export interface WorkoutSet {
  id: string
  workout_entry_id: string
  numero_serie: number
  reps?: number
  peso?: string
  tipo_peso?: string
  comentario?: string
}
export interface Profile {
  id: string
  nombre?: string
   email?: string   
  created_at: string
}
