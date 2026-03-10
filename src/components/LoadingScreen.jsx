import "../styles/loading.css"

export default function LoadingScreen() {
  return (
    <div className="loadx">
      <div className="loadx-bg">
        <div className="loadx-blob a"/>
        <div className="loadx-blob b"/>
      </div>

      <div className="loadx-center">
        <div className="loadx-logo">
          <i className="fa-solid fa-bicycle"/>
        </div>

        <div className="loadx-title">
          Két Keréken
        </div>

        <div className="loadx-dots">
          <span/>
          <span/>
          <span/>
        </div>
      </div>
    </div>
  )
}