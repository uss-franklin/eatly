import React from 'react'
import moment from 'moment'

const EventEntry = ({event, vote}) => {

  return (
  <div className="userEvent">
    <tr>
      <td className="usersEventItemTitle">{event.eventName}</td>
      <td className="eventFootType">{event.foodType}</td>
      <td className="userEventCutOff">{event.voteCutOffDateTimeMoment.fromNow()}</td>
      <td><button className="editEventButton">{vote ? 'vote' : 'edit'}</button></td>
    </tr>
  </div> 
  )
}
export default EventEntry