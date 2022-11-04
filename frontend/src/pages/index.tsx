import { useCookie } from 'next-cookie'
import Button from '../components/Button'
import ServerSelector from '../components/ServerSelector'

export default function() {
  return (
    <>
      <div className="container">
        <Button href="https://example.com" text="hello world!"/>
        <ServerSelector text="applejuice.bar"/>
      </div>
    </>
  )
}