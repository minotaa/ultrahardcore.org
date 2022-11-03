
export default function(props) {
  const { href, text } = props

  function handleClick() {
    window.open(href, '_blank').focus()
  }

  return (
    <button className="button" onClick={handleClick}>
      {text}
    </button>
  )
}