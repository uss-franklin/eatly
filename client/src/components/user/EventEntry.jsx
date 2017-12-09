import React from 'react'
import moment from 'moment'

const EventEntry = ({event, vote, uid, buttonAction}) => {
  let clickActionRedirectLocation = vote ? 'swipe' : 'edit'
  let buttons = [
    <button key={'edit'} className="EditOrVoteEventButton" onClick={()=> buttonAction('edit', event.eid, uid)}>edit</button>,
    <button key={'swipe'} className="EditOrVoteEventButton" onClick={()=> buttonAction('swipe', event.eid, uid)}>vote</button>
  ]
  if (vote) {
    buttons = <button className="EditOrVoteEventButton" onClick={()=> buttonAction('swipe', event.eid, uid)}>vote</button>
  }
  let isExpired = event.voteCutOffDateTimeMoment.isBefore(moment())
  let timeLeft = event.voteCutOffDateTimeMoment.fromNow()
  if (isExpired || event.groupConsensusRestaurant) buttons = null
  return (
    <tr>
      <td className="usersEventItemTitle">{event.eventName}</td>
      <td className="eventFootType">{event.foodType}</td>
      <td className="userEventCutOff">{timeLeft}</td>
      <td>{buttons}</td>
    </tr>

  )
}
export default EventEntry