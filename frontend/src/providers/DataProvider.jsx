import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData]   = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch(setError)
  }, [])

  return (
    <DataContext.Provider value={{ data, error }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext).data
