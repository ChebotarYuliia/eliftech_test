function initMap() {
    let map;

    const showPosition = function () {
        const coords = basket[0].coords;
        const name = basket[0].restaurant;
        const latlng = new google.maps.LatLng(coords[0], +coords[1] + 0.00000050005503);
        const res = JSON.parse(localStorage.getItem("data"))?.[0]?.restaurant;
        const icon = `../assets/images/map_icons/${res}.png`;

        map = new google.maps.Map(document.getElementById('map'), {
            center: latlng,
            zoom: 15,
            zoomControl: true,
            scaleControl: true,
            streetViewControl: false,
        });
        const marker = new google.maps.Marker({
            position: latlng,
            map,
            title: name,
            icon: icon,
            animation: google.maps.Animation.DROP,
        });

        // store marker animation
        function toggleBounce() {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }
        marker.addListener("click", toggleBounce);

        function addInfoWindow(marker, message) {

            var infoWindow = new google.maps.InfoWindow({
                content: message
            });

            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open(map, marker);
                marker.setAnimation(null);
            });
        };
        addInfoWindow(marker, name)
    };

    showPosition();

    // Build and add the search bar
    const card = document.createElement('div');
    const titleBar = document.createElement('div');
    const title = document.createElement('div');
    const container = document.createElement('div');
    const input = document.createElement('input');
    const options = {
        types: ['address'],
        componentRestrictions: { country: 'ua' },
    };

    card.setAttribute('id', 'pac-card');
    title.setAttribute('id', 'title');
    title.textContent = 'Find an address';
    titleBar.appendChild(title);
    container.setAttribute('id', 'pac-container');
    input.setAttribute('id', 'pac-input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Enter an address');
    container.appendChild(input);
    card.appendChild(titleBar);
    card.appendChild(container);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    // make search area only Kharkiv
    const prefix = 'Kharkiv, ';

    input.addEventListener('input', function () {
        let str = input.value;
        if (str.indexOf(prefix) == 0) {
            return;
        } else {
            if (prefix.indexOf(str) >= 0) {
                input.value = prefix;
            } else {
                input.value = prefix + str;
            }
        }
    });

    // Make the search bar into a Places Autocomplete search bar and select
    // which detail fields should be returned about the place that
    // the user selects from the suggestions.
    const autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.setFields(['address_components', 'geometry', 'name']);

    // Set the origin point when the user selects an address
    const originMarker = new google.maps.Marker({ map: map });
    originMarker.setVisible(false);
    let originLocation = map.getCenter();

    autocomplete.addListener('place_changed', async () => {
        originMarker.setVisible(false);
        originLocation = map.getCenter();
        const place = autocomplete.getPlace();

        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert('No address available for input: \'' + place.name + '\'');
            return;
        }

        // Recenter the map to the selected address
        originLocation = place.geometry.location;
        map.setCenter(originLocation);
        map.setZoom(14);

        originMarker.setPosition(originLocation);
        originMarker.setVisible(true);

        form.address.value = input.value;

        return;
    });
}

if (basket.length) {
    window.initMap = initMap;
}

