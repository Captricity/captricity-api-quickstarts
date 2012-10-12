#!/bin/bash

SCRIPT_DIR=`dirname $0`
LOCAL_SCRIPT_SETTINGS=$SCRIPT_DIR/local.sh
if [ ! -f $LOCAL_SCRIPT_SETTINGS ]; then
    echo "Cannot find $LOCAL_SCRIPT_SETTINGS with your local settings"
    exit 1
fi
source $LOCAL_SCRIPT_SETTINGS

RETURN_URL='http://example.com'
RETURN_URL_KEY='return-url'
THIRD_PARTY_ID_KEY='third-party-id'

# We must URL encode the request parameters
ENCODED_RETURN_URL=`python -c "import urllib, sys; url = urllib.urlencode({'$RETURN_URL_KEY':'''$RETURN_URL'''}); sys.stdout.write(url)"`

# We must URL encode the request parameters
ENCODED_THIRD_PARTY_ID=`python -c "import urllib, sys; url = urllib.urlencode({'$THIRD_PARTY_ID_KEY':'''$THIRD_PARTY_ID'''}); sys.stdout.write(url)"`

# Generate signature from the URL encoded request parameters
SIGNATURE=`echo -n "$MY_SECRET_KEY:$ENCODED_RETURN_URL&$ENCODED_THIRD_PARTY_ID" | shasum -a 256`

# Generate the request URL
echo "https://shreddr.captricity.com/accounts/request-access/?$ENCODED_RETURN_URL&$ENCODED_THIRD_PARTY_ID&signature=$SIGNATURE"
# This is what you should get: https://shreddr.captricity.com/accounts/request-access/?return-url=http%3A%2F%2Fexample.com&third-party-id=1&signature=1e76e3e77db95bc4729d1f23e627944f6648fe1f2e604928c45b
