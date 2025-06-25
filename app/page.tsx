"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Dumbbell } from "lucide-react";
import type { User } from "@supabase/supabase-js"; 
export default function Home() {
    const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  // Si ya está logeado, puedes redirigir, o mostrar menú distinto
  if (user) {
    // OPCIÓN 1: Redirigir a entries directamente
    if (typeof window !== "undefined") {
      window.location.href = "/entries";
    }
    return null;
    // OPCIÓN 2: Mostrar bienvenida (y el navbar sale normal arriba)
    /*
    return (
      <div className="container mt-5">
        <h2>¡Hola, {user.email}!</h2>
        <p>Ya estás logueado. Usa el menú para navegar.</p>
      </div>
    );
    */
  }

  // Si NO está logeado, muestra landing page de bienvenida
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #151416 0%, #990300 100%)",
      }}
    >
      <div
        className="card shadow-lg p-4 text-center"
        style={{ minWidth: 340, background: "rgba(255,255,255,0.92)", borderRadius: 18 }}
      >
        <div className="mb-3 d-flex justify-content-center">
          <Dumbbell size={48} color="#990300" strokeWidth={2.5} />
        </div>
        <h1 style={{ fontWeight: 700 }} className="mb-2 text-dark">
          Mi Gimnasio
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: "1.1em" }}>
          Lleva tu progreso <span style={{ color: "#990300", fontWeight: 600 }}>al siguiente nivel</span>
        </p>
        <div className="d-grid gap-2">
          <a href="/login" className="btn btn-primary btn-lg" style={{ borderRadius: 12 }}>
            Iniciar sesión
          </a>
          <a href="/register" className="btn btn-outline-dark btn-lg" style={{ borderRadius: 12 }}>
            Crear cuenta
          </a>
        </div>
        <div className="mt-4">
          <small className="text-muted">Desarrollado para atletas de todos los niveles</small>
        </div>
      </div>
    </div>
  );
}
