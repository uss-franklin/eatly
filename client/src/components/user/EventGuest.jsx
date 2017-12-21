import React from 'react'

const EventGuest = ( {details}) => {

  return (
    <tr>
      <td>{details.name}</td>
      <td>{details.email}</td>
    </tr>
  )
}

export default EventGuest