import React from 'react';
import {withGoogleMap, GoogleMap, Marker} from "react-google-maps";

const MapWithAMarker = withGoogleMap(props =>
    <GoogleMap
        defaultZoom={props.defaultZoom} //16
        center={{ lat: props.lat, lng: props.lng }}
    >
        <Marker
            position={{ lat: props.lat, lng: props.lng }}
        />
    </GoogleMap>
);

export default MapWithAMarker;