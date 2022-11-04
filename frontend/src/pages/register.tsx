import { useCookie } from 'next-cookie'
import Button from '../components/Button'
import ServerSelector from '../components/ServerSelector'

export default function() {
  return (
    <>
      <div className="box">
        <h1>Register</h1>
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" placeholder=""/>
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder=""/>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder=""/>
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" placeholder=""/>
        </div>
      </div>
    </>
  )
}