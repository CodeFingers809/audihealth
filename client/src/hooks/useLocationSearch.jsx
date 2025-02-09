import { useState, useEffect } from 'react'
import axios from 'axios'

export function useLocationSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchLocation = async () => {
      if (searchTerm.length < 3) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchTerm
          )}`
        )
        setSuggestions(response.data)
      } catch (error) {
        console.error('Error searching for location:', error)
        setSuggestions([])
      }
      setLoading(false)
    }

    const timeoutId = setTimeout(searchLocation, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  return { searchTerm, setSearchTerm, suggestions, loading }
}