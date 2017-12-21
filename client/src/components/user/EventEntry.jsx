import React from 'react'
import moment from 'moment'
import { Link } from 'react-router-dom'

const EventEntry = ({event, canEdit, uid, buttonAction}) => {
  let  buttons = [
      <div>
        <a href key={'edit'} onClick={()=> buttonAction('edit', event.eid, uid)}>Edit Event</a>
        <span> | </span>
        <a href key={'swipe'} onClick={()=> buttonAction('swipe', event.eid, uid)}>     Vote</a>
        <span> | </span>
      </div>]
  
  /*let buttons = [
    <button key={'edit'} className="editOrVoteEventButton" onClick={()=> buttonAction('edit', event.eid, uid)}>edit</button>,
    <button key={'swipe'} className="editOrVoteEventButton" onClick={()=> buttonAction('swipe', event.eid, uid)}>vote</button>
  ]*/
  if (!canEdit) {
    buttons = [<a href onClick={()=> buttonAction('swipe', event.eid, uid)}>     Vote</a>, <span> | </span>]
    //buttons = [<button className="editOrVoteEventButton" onClick={()=> buttonAction('swipe', event.eid, uid)}>vote</button>]
  }

  let isExpired = event.voteCutOffDateTimeMoment.isBefore(moment())
  let timeLeft = event.voteCutOffDateTimeMoment.fromNow()
  if (isExpired) buttons = [null]

  if (event.groupConsensusRestaurant) {
    buttons.push(<a href onClick={()=> buttonAction('swipe', event.eid, uid)}>      Vote</a>, <span> | </span>)
    //buttons.push(<button className="results" onClick={()=> buttonAction('swipe', event.eid, uid)}>Results</button>)
  }
  if (event.invitedUserDetails) {
    let usersToinvite = event.invitedUserDetails.reduce((acc, guest) => {
      acc.guestEmails.push(guest.email)
      acc.guestNames.push(guest.name)
      return acc
    },{guestEmails: [], guestNames: []})

    buttons.push(<Link key={event.eid} to={{pathname: './inputForm', state: {usersToInvite: usersToinvite}}}><a>Invite Group to New Meal</a></Link> )
    //buttons.push(<Link key={event.eid} to={{pathname: './inputForm', state: {usersToInvite: usersToinvite}}}><button className="inviteGroup" >Invite Group To New Meal</button></Link>)
  }
  
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