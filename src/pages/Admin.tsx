import { useState, useEffect } from "react"
import Icon from "@/components/ui/icon"

const RSVP_URL = "https://functions.poehali.dev/f4f76b0e-0668-4734-a16e-c7b3d1529d27"
const PASSWORD = "kirill-polina-2026"

interface RSVP {
  id: number
  name: string
  attendance: string
  guests_count: number
  dietary: string
  message: string
  created_at: string
}

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState("")
  const [pwdError, setPwdError] = useState(false)
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(false)

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (pwd === PASSWORD) { setAuth(true); setPwdError(false) }
    else setPwdError(true)
  }

  useEffect(() => {
    if (!auth) return
    setLoading(true)
    fetch(RSVP_URL)
      .then(r => r.json())
      .then(data => setRsvps(data))
      .finally(() => setLoading(false))
  }, [auth])

  const yes = rsvps.filter(r => r.attendance === "yes")
  const no = rsvps.filter(r => r.attendance === "no")
  const totalGuests = yes.reduce((s, r) => s + (r.guests_count || 1), 0)

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf9f7", fontFamily: "Montserrat, sans-serif" }}>
        <div className="w-full max-w-sm px-8">
          <h1 className="text-2xl font-light text-center mb-2" style={{ fontFamily: "Cormorant Garamond, Georgia, serif", color: "#2c2420" }}>
            Кирилл &amp; Полина
          </h1>
          <p className="text-xs tracking-widest uppercase text-center mb-10 opacity-40" style={{ color: "#2c2420" }}>Панель администратора</p>
          <form onSubmit={login} className="space-y-6">
            <div>
              <input
                type="password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-0 py-3 border-0 border-b text-base outline-none bg-transparent"
                style={{ borderColor: pwdError ? "#c0392b" : "#c9bfb0", color: "#2c2420" }}
                autoFocus
              />
              {pwdError && <p className="text-xs mt-2" style={{ color: "#c0392b" }}>Неверный пароль</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 text-xs tracking-widest uppercase"
              style={{ background: "#2c2420", color: "#f5f0ea" }}
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf9f7", fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div className="border-b px-8 py-5 flex items-center justify-between" style={{ borderColor: "#e5ddd5", background: "#fff" }}>
        <div>
          <h1 className="text-lg font-light" style={{ fontFamily: "Cormorant Garamond, Georgia, serif", color: "#2c2420" }}>
            Кирилл &amp; Полина · 12.06.2026
          </h1>
          <p className="text-xs opacity-40 mt-0.5" style={{ color: "#2c2420" }}>Ответы гостей</p>
        </div>
        <button onClick={() => { setAuth(false); setPwd("") }} className="text-xs opacity-40 hover:opacity-70 transition-opacity" style={{ color: "#2c2420" }}>
          Выйти
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: "Users", label: "Всего ответов", value: rsvps.length },
            { icon: "CheckCircle", label: "Придут", value: `${yes.length} чел. (${totalGuests} гостей)` },
            { icon: "XCircle", label: "Не придут", value: no.length },
          ].map(({ icon, label, value }) => (
            <div key={label} className="rounded-xl p-6 border" style={{ background: "#fff", borderColor: "#e5ddd5" }}>
              <Icon name={icon as "Users"} size={18} className="mb-3 opacity-40" />
              <p className="text-2xl font-light mb-1" style={{ fontFamily: "Cormorant Garamond, Georgia, serif", color: "#2c2420" }}>{value}</p>
              <p className="text-xs opacity-40" style={{ color: "#2c2420" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 opacity-30 text-sm" style={{ color: "#2c2420" }}>Загрузка...</div>
        ) : rsvps.length === 0 ? (
          <div className="text-center py-20 opacity-30 text-sm" style={{ color: "#2c2420" }}>Пока нет ответов</div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#e5ddd5" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f2ede6" }}>
                  {["Имя", "Ответ", "Гостей", "Питание", "Пожелание", "Дата"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs tracking-widest uppercase font-normal opacity-50" style={{ color: "#2c2420" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#faf9f7", borderTop: "1px solid #e5ddd5" }}>
                    <td className="px-5 py-4 font-medium" style={{ color: "#2c2420" }}>{r.name}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: r.attendance === "yes" ? "#e8f5e9" : "#fdecea",
                          color: r.attendance === "yes" ? "#2e7d32" : "#c0392b",
                        }}>
                        <Icon name={r.attendance === "yes" ? "Check" : "X"} size={10} />
                        {r.attendance === "yes" ? "Придёт" : "Не придёт"}
                      </span>
                    </td>
                    <td className="px-5 py-4 opacity-60" style={{ color: "#2c2420" }}>{r.attendance === "yes" ? r.guests_count : "—"}</td>
                    <td className="px-5 py-4 opacity-60 max-w-[140px] truncate" style={{ color: "#2c2420" }}>{r.dietary || "—"}</td>
                    <td className="px-5 py-4 opacity-60 max-w-[180px] truncate" style={{ color: "#2c2420" }}>{r.message || "—"}</td>
                    <td className="px-5 py-4 opacity-40 text-xs whitespace-nowrap" style={{ color: "#2c2420" }}>
                      {new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
