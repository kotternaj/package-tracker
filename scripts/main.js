// Configuration

var $dropMenu = $('[data-drop-menu]');
var $navLinks = $('[data-nav-link]');
var $checkpointTable = $('[data-checkpoint]');
var $checkpointTableBody = $('[data-checkpoint-body]');
var $inputField = $('[data-tracking-number]');
var $mapContainer = $('[data-map-container]');
var $theMap = $('[data-map]');
var $alert = $('[data-alert]');

// Toggle nav menu for smaller screens
$dropMenu.on('click', function(){
    $dropMenu.toggleClass('turn-open');
    $navLinks.toggleClass('show');
});

// Creates and manages alerts and errors based on user input
function removeShake(){
    $inputField.removeClass('invalid-input');
}

function trackingCodeError(){
    $mapContainer.addClass('move-map');
    $inputField.addClass('red-border invalid-input');
    setTimeout(removeShake, 800);
    $alert.removeClass('hide');
    $alert.addClass('alert-danger');
    $alert.text('Invalid Tracking Number');
    console.log('ERROR!')
}

function trackingCodeAlertUPS(data){   //**UPS** 
    var currentStatus = data[0]['Status']['Description'];

    $alert.removeClass('alert-danger');
    $alert.removeClass('alert-success');
    $alert.removeClass('alert-warning');
    $alert.removeClass('hide');
    $alert.text('');
    $mapContainer.addClass('move-map');

    if (currentStatus == 'Delivered'){
        $alert.addClass('alert-success');
    } 
    else { 
        $alert.addClass('alert-warning');        
    }
    $alert.text(`Status: ${currentStatus}`);
}

function trackingCodeAlertFedex(data){  //**FedEx**
    var currentStatus = data[0]['Status']['Details'];

    $alert.removeClass('alert-danger');
    $alert.removeClass('alert-success');
    $alert.removeClass('alert-warning');
    $alert.removeClass('hide');
    $alert.text('');
    $mapContainer.addClass('move-map');

    if (currentStatus == 'Delivered'){
        $alert.addClass('alert-success');
    } 
    else { 
        $alert.addClass('alert-warning');        
    }
    $alert.text(`Status: ${currentStatus}`);
}

// Clears table

function eraseTable(){
    $checkpointTable.empty();
}

// Makes table using data from API

function createTable(dataArray) {
    $checkpointTable.removeClass('hide');

    var dataLength = dataArray.length;

    for (var i = 0; i < dataLength; i++) {
        var reverse = dataLength - (i + 1):
        var tData = $(`<tr><td>${i + 1}</td>
                           <td>${dataArray[reverse].city}</td>
                           <td>${dataArray[reverse].state}</td>
                           <td>${dataArray[reverse].status}</td>
                           <td>${dataArray[reverse].date}</td>
                           <td>${dataArray[reverse].time}</td>`);
        $checkpointTableBody.append(tData);
    }
}

// Submit tracking number and shipping company
function formSubmit(){
    var $trackingNumberForm = $(`[data-form="form"]`);

    $trackingNumberForm.on('submit', function(event){
        event.preventDefault();

        var serializedArray = $trackingNumberForm.serializeArray();
        var trackingNumber = serializedArray[0].value;
        var shippingCompany = $('#sel1').val();

        apiCalls(trackingNumber, shippingCompany);
    });
};

// Process tracking # -  UPS or FedEx
function apiCalls(tracking, shippingCompany) {

    if (shippingCompany == 'UPS') {
        getUPSdata(tracking).then(transformUpsData).then(geoLoop)
    }
    else if (shippingCompany == 'Fedex') {
        getFedexData(tracking).then(transformFedexData).then(geoLoop)
    }
}

// Get data from UPS API
function getUPSdata (tracking){
    var data = $.ajax({
        'url': 'https://my-little-cors-proxy.herokuapp.com/https://wwwcie.ups.com/rest/Track', 
        'type': 'POST',
        'data': JSON.stringify({
            'UPSSecurity': {
                'UsernameToken': {
                    'Username': 'trackmapdc',
                    'Password': 'Maptrackdc123!',
                },
                'ServiceAccessToken': {
                    'AccessLicenseNumber':'DD394D0B24CA9D88'
                }
            },
                'TrackRequest': {
                    'Request': {
                        'RequestOption': '1'
                    },
                    'InquiryNumber': tracking
                }
        })
    });
    return data;
};

// Create coordinates from each city/state location
function geoLoop(dataArray) {

    var promArray = dataArray.map(function(obj){
        return $alert.get(obj ['URL']);
    });

    Promise.all(promArray).then(function(geoArray){

        for (var i = 0; i < geoArray.length; i++){
            dataArray[i]['LatLng'] = geoArray[i].results[0].geometry.location;
        }
        return dataArray;
    })
    .then(removeDuplicates).then(createMap);
}

// Prevents non-unique coordinates from appearing on map
function removeDuplicates(arr){
    for (var i = 0; i < arr.length - 1; i++){
        for (var j = 1; j < arr.length; j++){
            if (arr[i]['city'] == arr[j]['city']){
                arr.splce(j, 1)
            }
        }
    }
    return arr.reverse()
};

