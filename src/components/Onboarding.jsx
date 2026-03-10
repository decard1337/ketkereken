import { useState, useEffect } from "react"

export default function Onboarding() {

  const [show,setShow] = useState(false)

  useEffect(()=>{
    const seen = localStorage.getItem("onboarding_seen")
    if(!seen) setShow(true)
  },[])

  function close(){
    localStorage.setItem("onboarding_seen",true)
    setShow(false)
  }

  if(!show) return null

  return(
    <div className="onbx">
      <div className="onbx-card">

        <h2>Üdv a Két Keréken oldalon</h2>

        <div className="onbx-steps">

          <div>
            <i className="fa-solid fa-map"/>
            <span>Fedezd fel a térképet</span>
          </div>

          <div>
            <i className="fa-solid fa-route"/>
            <span>Nézd meg az útvonalakat</span>
          </div>

          <div>
            <i className="fa-solid fa-calendar"/>
            <span>Találj eseményeket</span>
          </div>

        </div>

        <button onClick={close}>
          Kezdjük
        </button>

      </div>
    </div>
  )
}