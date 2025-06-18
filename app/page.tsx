export default function Home() {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Bienvenido a tu App de Gimnasio</h1>
      <p>
        Usa el menú superior para registrar tus entrenamientos, ver el historial, o gestionar ejercicios y máquinas.
      </p>
      <ul>
        <li>
          <a href="/entries" className="link-primary">Historial de registros</a>
        </li>
        <li>
          <a href="/entries/new" className="link-primary">Nuevo registro</a>
        </li>
        <li>
          <a href="/exercises" className="link-primary">Ejercicios</a>
        </li>
        <li>
          <a href="/machines" className="link-primary">Máquinas</a>
        </li>
      </ul>
      <p className="mt-4 text-muted" style={{ fontSize: "0.9em" }}>
        Hecho con Next.js, Supabase y Bootstrap. Solo para uso personal/familiar 🚀
      </p>
    </div>
  )
}
