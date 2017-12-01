const yelp = require('yelp-fusion');
const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const clientId = require('../keys/yelpKey.js').clientId;
const clientSecret = require('../keys/yelpKey.js').clientSecret;

let yelpRef = dbRef.child('yelpSearchResults');

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
                    resolve(newDataPath.key);
                });

            }).catch(err => {
                console.log(err);
            })
        });
    });
};

var getYelpBusinessDetails = function(client, restaurant){
    return(client.business(restaurant.id));
};

var isRestaurantOpenAtEventTime = function(restaurantOpenHours, eventDateTime){
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