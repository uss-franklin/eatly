import React from 'react'
import moment from 'moment'

const EventEntry = ({event, vote, uid, buttonAction}) => {
  let clickAction = vote ? buttonAction : undefined
  return (
    <tr>
      <td className="usersEventItemTitle">{event.eventName}</td>
      <td className="eventFootType">{event.foodType}</td>
      <td className="userEventCutOff">{event.voteCutOffDateTimeMoment.fromNow()}</td>
      <td><button className="editEventButton" onClick={()=> buttonAction(event.eid, uid)}>{vote ? 'vote' : 'edit'}</button></td>
    </tr>

  )
}
export default EventEntry