const yelp = require('yelp-fusion');
const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const clientId = require('../keys/yelpKey.js').clientId;
const clientSecret = require('../keys/yelpKey.js').clientSecret;

let yelpRef = dbRef.child('yelpSearchResults');


/********
 Name: yelpSearch
 Description: The purpose of this function is to call the yelp 'SEARCH' api and retrieve data about restaurants that
 match the search request parameters (specified by the creation of an event). Given the returned restaurants, the
 function also calls the yelp 'BUSINESS' api to filter out restaurants that will not be available at the event time.
 The results of these operations are returned from the function as an unresolved promise.

 Invoked From: CreateEvent function in the event controller
 Expected Inputs: an object containing yelp search request parameters. This object may contain parameters as specified
 by Yelp at : https://www.yelp.com/developers/documentation/v3/business_search

 Expected Outputs:
 - Success: A promise object which resolves to return the restaurants specified by the search request paramaters and
 filtered (remove restaurants closed at) by the eventDateTime
 - Failure: Unresolved promise and error message indicating error. Enhancement needed to handle error scenarios more robustly.
 *********/
exports.yelpSearch  = function(searchRequestParams, eventDateTime){
    return new Promise((resolve, reject) => {
        yelp.accessToken(clientId, clientSecret).then(response => {
            const client = yelp.client(response.jsonBody.access_token);

            client.search(searchRequestParams).then(response => {
                let restaurants = response.jsonBody.businesses.filter((restaurant) => restaurant.is_closed !== 'false');
                let promisedRestaurants = [];

                restaurants.forEach((restaurant) => {
                    promisedRestaurants.push(getYelpBusinessDetails(client, restaurant).then(business => {
                        restaurant.location = business.jsonBody.location;
                        restaurant.photos = business.jsonBody.photos;
                        delete restaurant.is_closed;

                        if(business.jsonBody.hours) {
                            //Yelp currently only supports return of regular hours, accordingly the hours array currently only maintains a single object
                            restaurant.hours = business.jsonBody.hours[0];
                            restaurant.openAtEventTime = isRestaurantOpenAtEventTime(restaurant.hours.open, eventDateTime);
                            delete restaurant.hours.is_open_now;
                            delete restaurant.hours.hours_type;
                        }

                        return restaurant;

                    }).catch(err => {
                        console.log(err);
                    }))
                });

                Promise.all(promisedRestaurants).then(decoratedRestaurants => {
                    decoratedRestaurants = decoratedRestaurants.filter(restaurant => restaurant.openAtEventTime);
                    //get the first 12 results only
                    decoratedRestaurants = decoratedRestaurants.length > 12 ? decoratedRestaurants.slice(0, 12) : decoratedRestaurants;
                    var newDataPath = yelpRef.push(decoratedRestaurants);
                    //Todo
                    resolve({yelpSearchResultsKey: newDataPath.key, count: decoratedRestaurants.length });
                });

            }).catch(err => {
                console.log(err);
            })
        });
    });
};

/********
 Name: getYelpBusinessDetails
 Description: Calls the Yelp Business API with a given Yelp restaurant ID to obtain additional business details.

 Invoked From: the yelpSearch function
 Expected Inputs: (1) API client; (2) restaurant details for a single restaurant

 Expected Outputs:
 - Success: returns a promise which resolves to an object with business details (including open hours).
 - Failure:
 *********/

var getYelpBusinessDetails = function(client, restaurant){
    return(client.business(restaurant.id));
};

/********
 Name: isRestaurantOpenAtEventTime
 Description: The purpose of this function is to determine if a given restaurant is open at the time of an event.

 Invoked From:
 Expected Inputs: (1) restaurantOpenHours - an array of blocks of time for which a given restaurant is open.
 (2) eventDateTime - a date/time object corresponding with the date of an event.

 Expected Outputs:
 - Success: A boolean value indicating if the restaurant is open at the eventDateTime
 - Failure: A false value is returned.
 *********/

var isRestaurantOpenAtEventTime = function(restaurantOpenHours, eventDateTime){
    //get day, hour and minute for event
    let eventDay = eventDateTime.getDay();
    let eventHour = eventDateTime.getHours().toString().length === 1 ? ('0' + eventDateTime.getHours().toString()): eventDateTime.getHours().toString();
    let eventMinute = eventDateTime.getMinutes().toString().length === 1 ? ('0' + eventDateTime.getMinutes().toString()): eventDateTime.getMinutes().toString();
    let eventHourMinute = parseInt((eventHour + eventMinute), 10);

    let filteredRestaurantOpenHours = restaurantOpenHours.filter(openHoursEntry => {
        //Note: We are not yet handling for the scenario whereby a restaurant is open past 12 AM and the user makes a reservation for early morning on the following day
        if(openHoursEntry.day === eventDay) {
            if(openHoursEntry.is_overnight) {
                return(eventHourMinute >= parseInt(openHoursEntry.start, 10));
            } else {
                //openHoursEntry.end reduced by 100 to provide users with at least 1 hour for their meal
                return(eventHourMinute >= parseInt(openHoursEntry.start, 10) && eventHourMinute <= parseInt(openHoursEntry.end, 10) - 100);
            }
        } else {
            return false;
        }
    });

    return(filteredRestaurantOpenHours.length !== 0);
};