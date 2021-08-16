var popup;

var currentConditionsUrl = 'https://{azMapsDomain}/weather/currentConditions/json?api-version=1.0&query={query}';

var weatherTemplate = {
    //The title tag for the popup. 
    title: 'Current Conditions',

    //HTML string template with placeholders for properties of the weather response.
    content: 
        '<img class="weather-icon" src="/img/{iconCode}.png"/>' +
        '<div class="weather-content">' +
        '<div class="weather-temp">{temperature/value}&#176;</div>' +                
        '<div class="weather-phrase">{phrase}</div>',

    //Format numbers with two decimal places.
    numberFormat: {
        maximumFractionDigits: 2
    },

    //Since we trust the data being retrieve, don't sandbox the content so that we can use CSS classes.
    sandboxContent: false
};


function getWeatherForPoint(e) {
    //Close the popup if it is open.
    popup.close();

    //Request the current conditions weather data and show it in the pop up.
    var requestUrl = currentConditionsUrl.replace('{query}', e.position[1] + ',' + e.position[0]);

    processRequest(requestUrl).then(response => {
        var content;

        if (response && response.results && response.results[0]) {
            //Use the weatherTemplate settings to create templated content for the popup.
            content = atlas.PopupTemplate.applyTemplate(response.results[0], weatherTemplate);
        } else {
            content = '<div style="padding:10px;">Weather data not available for this location.</div>';
        }

        popup.setOptions({
            content: content,
            position: e.position
        });

        popup.open(map);
    });
}

function processRequest(url) {
    //This is a reusable function that sets the Azure Maps platform domain, sings the request, and makes use of any transformRequest set on the map.
    return new Promise((resolve, reject) => {
        //Replace the domain placeholder to ensure the same Azure Maps cloud is used throughout the app.
        url = url.replace('{azMapsDomain}', atlas.getDomain());

        //Get the authentication details from the map for use in the request.
        var requestParams = map.authentication.signRequest({ url: url });

        //Transform the request.
        var transform = map.getServiceOptions().tranformRequest;
        if (transform) {
            requestParams = transform(request);
        }

        fetch(requestParams.url, {
            method: 'GET',
            mode: 'cors',
            headers: new Headers(requestParams.headers)
        })
            .then(r => r.json(), e => reject(e))
            .then(r => {
                resolve(r);
            }, e => reject(e));
    });

}