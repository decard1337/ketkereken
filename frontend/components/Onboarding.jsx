import { useEffect, useState } from "react"
import "../styles/onboarding.css"

const STEPS = [
  {
    icon: "fa-map",
    title: "Térkép",
    text: "Fedezd fel a helyeket, eseményeket és bringás pontokat egy nézetben."
  },
  {
    icon: "fa-route",
    title: "Útvonalak",
    text: "Jelöld ki az útvonalakat, nézd meg a részleteket és a közösségi tartalmakat."
  },
  {
    icon: "fa-calendar-days",
    title: "Események és helyek",
    text: "Találj programokat, látnivalókat és hasznos bringás pontokat a közeledben."
  }
]

export default function Onboarding() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen")
    if (!seen) setShow(true)
  }, [])

  function close() {
    localStorage.setItem("onboarding_seen", "true")
    setShow(false)
  }

  function next() {
    if (step >= STEPS.length - 1) {
      close()
      return
    }
    setStep(s => s + 1)
  }

  function prev() {
    if (step <= 0) return
    setStep(s => s - 1)
  }

  if (!show) return null

  const current = STEPS[step]

  return (
    <div className="onbx">
      <div className="onbx-overlay" onClick={close} />

      <div className="onbx-card">
        <button className="onbx-close" onClick={close}>
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="onbx-top">
          <div className="onbx-bigIcon">
            <i className={`fa-solid ${current.icon}`} />
          </div>

          <div className="onbx-stepCounter">
            {step + 1} / {STEPS.length}
          </div>
        </div>

        <h2>{current.title}</h2>
        <p>{current.text}</p>

        <div className="onbx-progress">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={"onbx-dot " + (i === step ? "active" : "")}
            />
          ))}
        </div>

        <div className="onbx-actions">
          <button className="onbx-btn ghost" onClick={close}>
            Kihagyás
          </button>

          <button className="onbx-btn ghost" onClick={prev} disabled={step === 0}>
            Vissza
          </button>

          <button className="onbx-btn primary" onClick={next}>
            {step === STEPS.length - 1 ? "Kezdjük" : "Tovább"}
          </button>
        </div>
      </div>
    </div>
  )
}