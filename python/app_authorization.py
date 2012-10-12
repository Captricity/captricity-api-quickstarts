import sys
import urllib

from captools.api.util import generate_request_access_signature

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print 'You must specify a third party app client id and third party app client secret key to authorize the app access to a user\'s account'
        sys.exit(0)

    return_url = 'example.com'
    third_party_id = sys.argv[1]
    third_party_key = sys.argv[2]

    # Use a dictionary to make it easier to work with the query parameters
    params = {
            'return-url' : return_url,
            'third-party-id' : third_party_id,
    }

    # Generate the login url
    login_url = 'https://shreddr.captricity.com/accounts/request-access/'

    # Use captools.api.utils.generate_request_access_signature to generate the signature to pass on to the login url
    params['signature'] = generate_request_access_signature(params, third_party_key)

    # Finally, encode the parameters as a query string
    encoded_params = urllib.urlencode(params)

    print 'Request access url:', login_url + '?' + encoded_params
