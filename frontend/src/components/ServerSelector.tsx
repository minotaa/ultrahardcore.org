
export default function(props) {
  const { text } = props

  return (
    <div className="server-selector">
      <p className="server-selector-label">Server Address</p>
      <input type="text" id="serverIp" className="server-selector-field" value={text} disabled/>
    </div>
  )
}