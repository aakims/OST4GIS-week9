var state = {
    position: {
        marker: null,
        updated: null
    }
};

//var client = new MapboxClient('pk.eyJ1IjoiYWFraW1zIiwiYSI6ImNqZmQ1bm4yaDF4NnQzdW8xem54dmNzYXQifQ.VfaDRyNApyLYnCVL7PcpzA');

/* We'll use underscore's `once` function to make sure this only happens
 *  one time even if weupdate the position later
 */
var froLat, froLng, toLat, toLng;
var goToOrigin = _.once(function(lat, lng) {
    map.flyTo([lat, lng], 14);
    froLat = lat;
    froLng = lng;
});



var destLoc;
/* Given a lat and a long, we should create a marker, store it
 *  somewhere, and add it to the map
 */
var updatePosition = function(lat, lng, updated) {
    if (state.position.marker) { map.removeLayer(state.position.marker); }
    state.position.marker = L.circleMarker([lat, lng], { color: "blue" });
    state.position.updated = updated;
    state.position.marker.addTo(map);
    goToOrigin(lat, lng);
};

$(document).ready(function() {
    /* This 'if' check allows us to safely ask for the user's current position */
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            updatePosition(position.coords.latitude, position.coords.longitude, position.timestamp);
        });
    } else {
        alert("Unable to access geolocation API!");
    }


    /* Every time a key is lifted while typing in the #dest input, disable
     * the #calculate button if no text is in the input
     */
    $('#dest').keyup(function(e) {
        if ($('#dest').val().length === 0) {
            $('#calculate').attr('disabled', true);
        } else {
            $('#calculate').attr('disabled', false);
        }
    });


    // click handler for the "calculate" button (probably you want to do something with this)
    $("#calculate").click(function(e) {
        var dest = $('#dest').val();
        var directionStr, directionArr, directionGeojson; 

            $.ajax({
                    url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
                        dest +
                        ".json?access_token=pk.eyJ1IjoiYWFraW1zIiwiYSI6ImNqZmQ1bm4yaDF4NnQzdW8xem54dmNzYXQifQ.VfaDRyNApyLYnCVL7PcpzA"
                })
                .done(function(res) {
                    console.log("Your location detected");
                    toLat = res.features[0].geometry.coordinates[1];
                    toLng = res.features[0].geometry.coordinates[0];
                    //console.log(destCoor);

                })
                .then(function() {
                    $.ajax({
                        url: "https://api.mapbox.com/directions/v5/mapbox/driving/" + froLng + "," + froLat + ";" + toLng + "," + toLat + ".json?access_token=pk.eyJ1IjoiYWFraW1zIiwiYSI6ImNqZmQ1bm4yaDF4NnQzdW8xem54dmNzYXQifQ.VfaDRyNApyLYnCVL7PcpzA"
                    }).done(function(res) {
                      console.log("I found where you want to go.")
                      directionStr = res.routes[0].geometry; 
                      directionArr = JSON.stringify(decode(directionStr)); 
                      console.log (res);
                      console.log(directionStr);
                      console.log(directionArr); 
                    }).then(function() {
                      var coordinates = JSON.stringify(directionArr);
                      var geojson1 = "{'type': 'FeatureCollection', 'features': [{'type': 'Feature','properties': {},'geometry:': {'type': 'LineString','coordinates':";
                      var geojson2 = "}}]}";
                      directionGeojson = geojson1 + directionArr + geojson2;
                      directionGeojson = directionGeojson.replace("\'", "\""); 
                      console.log(directionGeojson); 
                      console.log(JSON.parse(directionGeojson));
                    });

                });

        //console.log(dest);
    });
});