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

