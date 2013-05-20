# In this and future examples, MY_API_TOKEN is an environment variable that maps to your api token. You can set it with: export MY_API_TOKEN=<YOUR TOKEN>
curl -X GET -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/document/
# Find the 'id' of the template you want to use in the list of objects that is returned

# $DOCUMENT_ID contains the id number of the template that you would like to use for the new job.
curl -X POST -H "Captricity-API-Token: $MY_API_TOKEN" -d "document_id=$DOCUMENT_ID" https://shreddr.captricity.com/api/v1/job/

