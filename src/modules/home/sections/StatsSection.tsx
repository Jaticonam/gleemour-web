import HomeSectionHeader from "../components/HomeSectionHeader";

const metrics = [
  {
    value: "+1,500",
    label: "Clientes atendidos",
    text: "Cada uno con una historia que quiso expresar.",
  },
  {
    value: "+3,000",
    label: "Detalles entregados",
    text: "Momentos que llegaron justo cuando importaban.",
  },
  {
    value: "99%",
    label: "Entregas a tiempo",
    text: "Porque sorprender también es cumplir.",
  },
  {
    value: "+200",
    label: "Empresas atendidas",
    text: "Marcas que eligieron conectar mejor.",
  },
];

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[var(--w-bg)] to-white py-16 md:py-20">
      
      {/* Glow fondo */}
      <div className="pointer-events-none absolute left-0 top-10 h-72 w-72 rounded-full bg-[var(--w-secondary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[var(--w-highlight)]/10 blur-3xl" />

      <div className="home-container relative z-10">
        
        {/* HEADER */}
        <div className="mb-12 text-center">
          <HomeSectionHeader
            kicker="Resultados"
            title="Resultados que se sienten"
            description="Cada número representa un momento que alguien decidió hacer especial."
            align="center"
          />

          <div className="mx-auto mt-7 h-1.5 w-24 rounded-full bg-gradient-to-r from-[var(--w-highlight)] via-[var(--w-secondary)] to-[var(--w-primary)]" />
        </div>

        {/* GRID */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {metrics.map((item) => (
            <div
              key={item.label}
              className="group rounded-[28px] border border-[var(--w-border)] bg-white/90 p-6 text-center shadow-[var(--w-shadow-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--w-shadow-medium)]"
            >
              {/* Número */}
              <div className="mb-3 text-4xl font-black tracking-tight text-[var(--w-primary)] md:text-5xl">
                {item.value}
              </div>

              {/* Label */}
              <div className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--w-heading)]">
                {item.label}
              </div>

              {/* Texto */}
              <p className="text-sm text-[var(--w-muted)] leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



