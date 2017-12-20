import React from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete';

export default class AutoCompleteFrame extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            address: '',
            latitude: null,
            longitude: null,
            placeId: null,
            loading:false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    };

    handleChange(address) {
        this.setState({address: address})
        this.props.updateAddress(address);
    };

    handleSelect(address) {
        this.setState({
            address,
            loading: true
        });
        this.props.updateAddress(address);

        geocodeByAddress(address)
            .then((results) =>  getLatLng(results[0]))
            .then(({ lat, lng }) => {
                console.log(this.state.address, { lat, lng });
                this.setState({
                    latitude: lat,
                    longitude: lng,
                    loading: false
                });
                this.props.updateLatLng(lat, lng);
            })
            .catch((error) => {
                console.log('There is an issue!', error);
                this.setState({
                    loading: false
                })
            });
    };

    handleEnter(address) {
        geocodeByAddress(address)
            .then(results => {
                console.log('results', results)
            })
    };

    render() {
        const inputProps = {
            type: "text",
            value: this.state.address,
            onChange: this.handleChange,
            onBlur: () => {
                console.log('Blur event!');
            },
            onFocus: () => {
                console.log('Focused!');
            },
            autoFocus: true,
            placeholder: "Where should we start the search for restaurants for your events",
        };

        const AutocompleteItem = ({formattedSuggestion}) => (
            <div>
                <strong>{formattedSuggestion.mainText}</strong>{' '}
                <small>{formattedSuggestion.secondaryText}</small>
            </div>);

        const autoCompleteStyle = {
            root: {position: 'relative', paddingBottom: '0px', 'z-index': '1000'},
            input: {width: '100%'},

            autocompleteItem: {color: 'black', 'zindex': '1000', 'backgroundcolor': 'white'},
            autocompleteItemActive: {color: 'blue'}
        };

        return (
            <PlacesAutocomplete
                inputProps={inputProps}
                autocompleteItem={AutocompleteItem}
                styles={autoCompleteStyle}
                onSelect={this.handleSelect}
                onEnterKeyDown={this.handleEnter}
                highlightFirstSuggestion={true}
            />
        )
    }
}