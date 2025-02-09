import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function ChangeMapCenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (map && center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}