import { useState, useEffect, useRef } from "react"
import Icon from "@/components/ui/icon"

const RSVP_URL = "https://functions.poehali.dev/f4f76b0e-0668-4734-a16e-c7b3d1529d27"
const COUPLE_PHOTO = "https://cdn.poehali.dev/projects/353bfe77-18be-4e07-a944-63e4f4bde468/files/9d478b45-2f30-48e8-9e33-c64b1d74b210.jpg"

const WEDDING_DATE = new Date("2026-06-12T16:00:00")

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])
  return timeLeft
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function Wedding() {
  const countdown = useCountdown(WEDDING_DATE)
  const [form, setForm] = useState({ name: "", attendance: "yes", guests_count: "1", dietary: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError("Пожалуйста, введите своё имя"); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(RSVP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, guests_count: parseInt(form.guests_count) }),
      })
      if (res.ok) setSubmitted(true)
      else setError("Что-то пошло не так. Попробуйте ещё раз.")
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.")
    } finally {
      setLoading(false)
    }
  }

  const program = [
    { time: "16:00", title: "Сбор гостей", desc: "Велком-зона, фуршет и живое общение" },
    { time: "17:00", title: "Выездная церемония", desc: "Торжественное бракосочетание" },
    { time: "18:00", title: "Банкет", desc: "Праздничный ужин и поздравления" },
    { time: "21:00", title: "Торт", desc: "Сладкий момент вечера" },
    { time: "23:00", title: "Завершение", desc: "До новых встреч!" },
  ]

  return (
    <div className="wedding-page min-h-screen" style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", background: "#faf9f7" }}>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={COUPLE_PHOTO} alt="Кирилл и Полина" className="w-full h-full object-cover object-center" style={{ filter: "grayscale(100%) brightness(0.55)" }} />
        </div>
        <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.7) 100%)" }} />

        <div className="relative z-20 text-center px-6 text-white">
          <p className="text-xs tracking-[0.4em] uppercase mb-6 opacity-80" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300 }}>
            Приглашение на свадьбу
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light leading-[1.1] mb-4" style={{ letterSpacing: "-0.02em" }}>
            Кирилл
            <br />
            <span style={{ fontStyle: "italic", color: "#e8d5c4" }}>&amp; Полина</span>
          </h1>
          <div className="w-16 h-px bg-white/50 mx-auto my-8" />
          <p className="text-xl md:text-2xl font-light tracking-widest opacity-90">12 · 06 · 2026</p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <Icon name="ChevronDown" size={28} className="text-white/60" />
        </div>
      </section>

      {/* Countdown */}
      <section className="py-20 px-6" style={{ background: "#1a1714", color: "#f5f0ea" }}>
        <FadeIn className="text-center">
          <p className="text-xs tracking-[0.4em] uppercase mb-10 opacity-50" style={{ fontFamily: "Montserrat, sans-serif" }}>До нашего дня</p>
          <div className="flex justify-center gap-8 md:gap-16">
            {[
              { v: countdown.days, l: "дней" },
              { v: countdown.hours, l: "часов" },
              { v: countdown.minutes, l: "минут" },
              { v: countdown.seconds, l: "секунд" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <span className="block text-5xl md:text-7xl font-light" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {String(v).padStart(2, "0")}
                </span>
                <span className="text-xs tracking-widest uppercase opacity-40 mt-2 block" style={{ fontFamily: "Montserrat, sans-serif" }}>{l}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Couple quote */}
      <section className="py-24 px-6 text-center" style={{ background: "#faf9f7" }}>
        <FadeIn className="max-w-2xl mx-auto">
          <p className="text-3xl md:text-4xl font-light leading-relaxed" style={{ color: "#2c2420", fontStyle: "italic" }}>
            «Мы нашли друг друга — теперь хотим разделить этот день с теми, кто нам дорог»
          </p>
          <div className="w-8 h-px bg-stone-300 mx-auto mt-10" />
        </FadeIn>
      </section>

      {/* Details */}
      <section className="py-20 px-6" style={{ background: "#f2ede6" }}>
        <FadeIn className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-center mb-16 opacity-50" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
            Детали торжества
          </p>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#2c2420" }}>
                <Icon name="Calendar" size={20} className="text-stone-100" />
              </div>
              <h3 className="text-lg font-light mb-2" style={{ color: "#2c2420" }}>Дата</h3>
              <p className="text-sm leading-relaxed opacity-70" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                12 июня 2026 года<br />Пятница
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#2c2420" }}>
                <Icon name="Clock" size={20} className="text-stone-100" />
              </div>
              <h3 className="text-lg font-light mb-2" style={{ color: "#2c2420" }}>Начало</h3>
              <p className="text-sm leading-relaxed opacity-70" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                Сбор гостей в 16:00<br />Церемония в 17:00
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#2c2420" }}>
                <Icon name="MapPin" size={20} className="text-stone-100" />
              </div>
              <h3 className="text-lg font-light mb-2" style={{ color: "#2c2420" }}>Место</h3>
              <p className="text-sm leading-relaxed opacity-70" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                Кафе «Династия»<br />ул. Московское ш., 27<br />посёлок Солнечный
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Program */}
      <section className="py-24 px-6" style={{ background: "#faf9f7" }}>
        <FadeIn className="max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-center mb-16 opacity-40" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
            Программа вечера
          </p>
          <div className="relative">
            <div className="absolute left-[68px] top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, transparent, #c9bfb0 10%, #c9bfb0 90%, transparent)" }} />
            {program.map((item, i) => (
              <FadeIn key={item.time} delay={i * 100} className="flex gap-8 mb-10 last:mb-0 items-start relative">
                <div className="text-right w-12 shrink-0">
                  <span className="text-sm font-light" style={{ fontFamily: "Montserrat, sans-serif", color: "#8a7d72" }}>{item.time}</span>
                </div>
                <div className="w-3 h-3 rounded-full shrink-0 mt-1 relative z-10" style={{ background: "#2c2420", marginLeft: "2px" }} />
                <div className="flex-1">
                  <h4 className="text-lg font-light mb-1" style={{ color: "#2c2420" }}>{item.title}</h4>
                  <p className="text-sm opacity-60" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Dress code */}
      <section className="py-20 px-6 text-center" style={{ background: "#2c2420", color: "#f5f0ea" }}>
        <FadeIn className="max-w-xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase mb-8 opacity-40" style={{ fontFamily: "Montserrat, sans-serif" }}>Дресс-код</p>
          <h2 className="text-4xl md:text-5xl font-light mb-6">Elegant / Formal</h2>
          <p className="text-sm leading-relaxed opacity-60" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Приветствуются светлые пастельные оттенки —<br />
            айвори, пудровый, лаванда, шампань, мятный
          </p>
          <div className="flex justify-center gap-3 mt-10 flex-wrap">
            {["#f5f0ea", "#e8d5c4", "#d4c5b0", "#c9b8c0", "#b8c8b8", "#d4cce0"].map((color) => (
              <div key={color} className="w-10 h-10 rounded-full border border-white/20" style={{ background: color }} />
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Map */}
      <section className="py-20 px-6" style={{ background: "#faf9f7" }}>
        <FadeIn className="max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-center mb-10 opacity-40" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
            Как добраться
          </p>
          <div className="rounded-2xl overflow-hidden shadow-lg mb-6" style={{ height: 360 }}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src="https://maps.google.com/maps?q=51.777351,39.194275&z=15&output=embed"
              allowFullScreen
              title="Место проведения свадьбы"
            />
          </div>
          <div className="text-center">
            <p className="text-sm opacity-60 mb-4" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
              Кафе «Династия» · ул. Московское ш., 27, посёлок Солнечный
            </p>
            <a
              href="https://maps.google.com/?q=51.777351,39.194275"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm px-6 py-3 rounded-full transition-all duration-300"
              style={{ background: "#2c2420", color: "#f5f0ea", fontFamily: "Montserrat, sans-serif" }}
            >
              <Icon name="Navigation" size={16} />
              Проложить маршрут
            </a>
          </div>
        </FadeIn>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="py-24 px-6" style={{ background: "#f2ede6" }}>
        <FadeIn className="max-w-xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-center mb-4 opacity-40" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
            Подтверждение участия
          </p>
          <h2 className="text-4xl font-light text-center mb-4" style={{ color: "#2c2420" }}>Вы придёте?</h2>
          <p className="text-sm text-center opacity-60 mb-12" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
            Просим подтвердить до 1 июня 2026
          </p>

          {submitted ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#2c2420" }}>
                <Icon name="Heart" size={28} className="text-stone-100" />
              </div>
              <h3 className="text-2xl font-light mb-3" style={{ color: "#2c2420" }}>Спасибо!</h3>
              <p className="text-sm opacity-60" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                Мы получили ваш ответ и очень рады вас видеть!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2 opacity-50" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                  Ваше имя *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Иван Иванов"
                  className="w-full px-0 py-3 border-0 border-b text-lg font-light outline-none bg-transparent transition-colors"
                  style={{ borderColor: "#c9bfb0", color: "#2c2420", fontFamily: "Cormorant Garamond, Georgia, serif" }}
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-3 opacity-50" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                  Вы придёте?
                </label>
                <div className="flex gap-4">
                  {[{ v: "yes", l: "Да, буду!" }, { v: "no", l: "К сожалению, нет" }].map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, attendance: v })}
                      className="flex-1 py-3 text-sm transition-all duration-300 border"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        background: form.attendance === v ? "#2c2420" : "transparent",
                        color: form.attendance === v ? "#f5f0ea" : "#2c2420",
                        borderColor: "#2c2420",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {form.attendance === "yes" && (
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2 opacity-50" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                    Сколько человек (включая вас)
                  </label>
                  <select
                    value={form.guests_count}
                    onChange={(e) => setForm({ ...form, guests_count: e.target.value })}
                    className="w-full px-0 py-3 border-0 border-b text-lg font-light outline-none bg-transparent"
                    style={{ borderColor: "#c9bfb0", color: "#2c2420", fontFamily: "Cormorant Garamond, Georgia, serif" }}
                  >
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs tracking-widest uppercase mb-2 opacity-50" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                  Пожелания по питанию
                </label>
                <input
                  type="text"
                  value={form.dietary}
                  onChange={(e) => setForm({ ...form, dietary: e.target.value })}
                  placeholder="Вегетарианское меню, аллергия и т.д."
                  className="w-full px-0 py-3 border-0 border-b text-lg font-light outline-none bg-transparent"
                  style={{ borderColor: "#c9bfb0", color: "#2c2420", fontFamily: "Cormorant Garamond, Georgia, serif" }}
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-2 opacity-50" style={{ fontFamily: "Montserrat, sans-serif", color: "#2c2420" }}>
                  Пожелания молодожёнам
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Ваши слова для нас..."
                  rows={3}
                  className="w-full px-0 py-3 border-0 border-b text-lg font-light outline-none bg-transparent resize-none"
                  style={{ borderColor: "#c9bfb0", color: "#2c2420", fontFamily: "Cormorant Garamond, Georgia, serif" }}
                />
              </div>

              {error && <p className="text-red-500 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50"
                style={{ background: "#2c2420", color: "#f5f0ea", fontFamily: "Montserrat, sans-serif" }}
              >
                {loading ? "Отправляю..." : "Подтвердить"}
              </button>
            </form>
          )}
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center" style={{ background: "#2c2420", color: "#f5f0ea" }}>
        <p className="text-2xl font-light mb-2">Кирилл &amp; Полина</p>
        <p className="text-xs tracking-widest uppercase opacity-40" style={{ fontFamily: "Montserrat, sans-serif" }}>12 · 06 · 2026</p>
        <p className="text-xs opacity-30 mt-6" style={{ fontFamily: "Montserrat, sans-serif" }}>С любовью ждём вас ♡</p>
      </footer>
    </div>
  )
}
