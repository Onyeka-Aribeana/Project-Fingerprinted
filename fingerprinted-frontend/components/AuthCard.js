import React from 'react'
import authStyles from "../styles/Auth.module.css"

const AuthCard = ({children}) => {
  return (
    <div className={authStyles.container}>
      {children}
    </div>
  )
}

export default AuthCard