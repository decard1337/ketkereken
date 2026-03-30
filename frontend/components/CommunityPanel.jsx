import { useEffect, useState } from "react"
import { api } from "../lib/api"

export default function CommunityPanel({ tipus, id }) {
  const [kedvelt, setKedvelt] = useState(false)
  const [ertekelesek, setErtekelesek] = useState([])
  const [atlag, setAtlag] = useState(null)
  const [kepek, setKepek] = useState([])

  const [rating, setRating] = useState(0)
  const [szoveg, setSzoveg] = useState("")
  const [file, setFile] = useState(null)

  useEffect(() => {
    load()
  }, [tipus, id])

  async function load() {
    try {
      const k = await api.kedvencStatusz(tipus, id)
      setKedvelt(k.kedvelt)

      const r = await api.ertekelesek(tipus, id)
      setErtekelesek(r.adatok || [])
      setAtlag(r.atlag)

      const p = await api.kepek(tipus, id)
      setKepek(p || [])
    } catch {}
  }

  async function toggleFav() {
    const r = await api.toggleKedvenc(tipus, id)
    setKedvelt(r.kedvelt)
  }

  async function submitRating() {
    await api.kuldErtekeles(tipus, id, rating, szoveg)
    setRating(0)
    setSzoveg("")
    load()
  }

  async function upload() {
    if (!file) return
    await api.kuldKep(tipus, id, file)
    setFile(null)
    load()
  }

  return (
    <div className="community">

      <button className="favbtn" onClick={toggleFav}>
        <i className={"fa-solid fa-heart"} style={{color: kedvelt ? "#ff3b30" : "#aaa"}} />
      </button>

      <div className="ratingblock">
        <div className="ratingavg">
          Átlag: {atlag || "-"} ⭐
        </div>

        <div className="stars">
          {[1,2,3,4,5].map(i => (
            <i
              key={i}
              className="fa-solid fa-star"
              style={{color: i <= rating ? "#ffd60a" : "#555"}}
              onClick={()=>setRating(i)}
            />
          ))}
        </div>

        <textarea
          placeholder="Írj véleményt..."
          value={szoveg}
          onChange={e=>setSzoveg(e.target.value)}
        />

        <button onClick={submitRating}>
          Értékelés küldése
        </button>
      </div>

      <div className="ratinglist">
        {ertekelesek.map(r=>(
          <div key={r.id} className="ratingitem">
            <div>{r.username} • {r.pontszam}⭐</div>
            <div>{r.szoveg}</div>
          </div>
        ))}
      </div>

      <div className="upload">
        <input
          type="file"
          onChange={e=>setFile(e.target.files[0])}
        />

        <button onClick={upload}>
          Kép feltöltése
        </button>
      </div>

      <div className="gallery">
        {kepek.map(k=>(
          <img
            key={k.id}
            src={`http://localhost:3001${k.fajl_utvonal}`}
          />
        ))}
      </div>

    </div>
  )
}