import React from 'react'
import moment from 'moment'

const EventEntry = ({event, vote}) => {
  //Thu Dec 07 2017 13:29:00 GMT-0500
  let cutOffDateArr = event.voteCutOffDateTime.split(' ')
  let cutOfftimeArr = cutOffDateArr[4].split(':')
  let m = moment()
  m.month(cutOffDateArr[1])
  .date(cutOffDateArr[2])
  .hour(cutOfftimeArr[0])
  .minute(cutOfftimeArr[1])
  .second(cutOfftimeArr[2])
  let timeLeft = m.fromNow()

  return (
  <div className="userEvent">
    <ul>
      <li className="usersEventItemTitle">{event.eventName}</li>
      <li className="eventFootType">{event.foodType}</li>
      <li className="userEventCutOff">{timeLeft}</li>
      <li><button className="editEventButton">{vote ? 'vote' : 'edit'}</button></li>
    </ul>
  </div> 
  )
}
export default EventEntry