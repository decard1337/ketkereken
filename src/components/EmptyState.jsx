export default function EmptyState({
icon="fa-route",
title="Nincs adat",
text="Itt még nincs semmi."
}) {
  return (
    <div className="emptyx">
      <i className={`fa-solid ${icon}`}/>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}