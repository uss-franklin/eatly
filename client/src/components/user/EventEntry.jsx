import React from 'react'
import moment from 'moment'

const EventEntry = ({event, vote}) => {

  return (
  <div className="userEvent">
    <ul>
      <li className="usersEventItemTitle">{event.eventName}</li>
      <li className="eventFootType">{event.foodType}</li>
      <li className="userEventCutOff">{event.voteCutOffDateTimeMoment.fromNow()}</li>
      <li><button className="editEventButton">{vote ? 'vote' : 'edit'}</button></li>
    </ul>
  </div> 
  )
}
export default EventEntry