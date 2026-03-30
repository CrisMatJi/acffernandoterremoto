import { createContext, useState } from 'react'

export const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [session, setSessionState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('eventos_session')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  function setSession(data) {
    if (data) sessionStorage.setItem('eventos_session', JSON.stringify(data))
    else sessionStorage.removeItem('eventos_session')
    setSessionState(data)
  }

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  )
}
