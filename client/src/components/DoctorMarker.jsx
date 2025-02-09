import React from 'react'
import { Marker, Popup } from 'react-leaflet'

export function DoctorMarker({ doctor }) {
  return (
    <Marker
      key={doctor.id}
      position={[doctor.lat, doctor.lon]}
    >
      <Popup>
        <div>
          <h3>{doctor.name}</h3>
          <p><strong>Doctor:</strong> {doctor.doctorName}</p>
          <p><strong>Specialization:</strong> {doctor.specialization}</p>
          <p><strong>Address:</strong> {doctor.address}</p>
        </div>
      </Popup>
    </Marker>
  )
}