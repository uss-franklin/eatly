import React from 'react'

const EventEntry = ({event, vote}) => (
  <div className="userEvent">
    <h3 className="usersEventItemTitle">
      {event.eventName}
    </h3>
    <button className="editEventButton">
      {vote ? 'vote' : 'edit'}
    </button>
  </div> 
)

export default EventEntry