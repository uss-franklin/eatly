import React from 'react'
import moment from 'moment'
import { Link } from 'react-router-dom'

const EventEntry = ({event, canEdit, uid, buttonAction}) => {
  
  let buttons = [
    <button key={'edit'} className="editOrVoteEventButton" onClick={()=> buttonAction('edit', event.eid, uid)}>edit</button>,
    <button key={'swipe'} className="editOrVoteEventButton" onClick={()=> buttonAction('swipe', event.eid, uid)}>vote</button>
  ]
  if (!canEdit) {
    buttons = [<button className="editOrVoteEventButton" onClick={()=> buttonAction('swipe', event.eid, uid)}>vote</button>]
  }

  let isExpired = event.voteCutOffDateTimeMoment.isBefore(moment())
  let timeLeft = event.voteCutOffDateTimeMoment.fromNow()
  if (isExpired) buttons = [null]

  if (event.groupConsensusRestaurant) {
    buttons.push(<button className="results" onClick={()=> buttonAction('swipe', event.eid, uid)}>Results</button>)
  }
  if (event.invitedUserDetails) {
    let usersToinvite = event.invitedUserDetails.reduce((acc, guest) => {
      acc.guestEmails.push(guest.email)
      acc.guestNames.push(guest.name)
      return acc
    },{guestEmails: [], guestNames: []})

    buttons.push(<Link key={event.eid} to={{pathname: './inputForm', state: {usersToInvite: usersToinvite}}}><button className="inviteGroup" >Invite Group To New Meal</button></Link>)
  }
  
  console.log(event)
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