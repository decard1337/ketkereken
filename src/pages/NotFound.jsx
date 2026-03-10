import { Link } from "react-router-dom"
import "../styles/notfound.css"
export default function NotFound() {
  return (
    <div className="nf">

      <div className="nf-card">

        <div className="nf-icon">
          <i className="fa-solid fa-compass"/>
        </div>

        <h1>404</h1>

        <p>
          Ez az útvonal nem létezik.
        </p>

        <Link to="/terkep" className="nf-btn">
          Térkép megnyitása
        </Link>

      </div>

    </div>
  )
}