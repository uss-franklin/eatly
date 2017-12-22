const validEmail = (emailAddress) => {
  let re = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
  if (re.test(emailAddress)) return true
  return false
}

const Validator = (formState) => {
  let errors = {}
  const rules = {
    address: () => {
       if (formState.longitude === null || formState.latitude === null) {
         return 'Please enter a valid address'
       }
    },
    radius: () => {
      if (formState.radius === '') {
        return 'Please select a radius'
      }
    },
    hostEmail: () => {
      if (!validEmail(formState.hostEmail)) {
        return 'Please enter a valid email address'
      }
    },
    hostName: () => {
      if (!formState.hostName.length) {
        return 'Please enter your name'
      }
    },
    eventName: () => {
      if (!formState.eventName.length) {
        return 'Please name  your event'
      }
    },
    guestEmails: () => {
      if (formState.guestEmails[0] === '') {
        return 'Please add a friend'
      }
    }
  }

  Object.keys(formState).forEach(key => {
    if (rules[key]) {
      errors[key] = rules[key]() || 'valid'
    }
  })
  let returnErrors = []
  Object.keys(errors).forEach(errorKey => {
    if (errors[errorKey] === 'valid') return
    returnErrors.push(errors[errorKey])
  })
  return returnErrors
}

export default Validator;