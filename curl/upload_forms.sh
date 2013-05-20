# $JOB_ID contains the id number of the job for which you are uploading forms to. The job must be in the setup state.
curl -X POST -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/job/$JOB_ID/instance-set/
# Below is a sample response you will get
#    {
#        "id": 30,
#        "instance_count": 1,
#        "sheet_count": 1,
#        "modified": "2012-09-17T13:24:21.328",
#        "name": "",
#        "created": "2012-09-17T13:24:21.328",
#        "multipage_file": null,
#        "extra_pages_settings: "none"
#    }

# $INSTANCE_SET_ID contains the id number of the instance set you just created.
curl -X GET -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/instance-set/$INSTANCE_SET_ID/instance/
# Expected response:
#    []

# Upload the form
curl -X POST -H "Captricity-API-Token: $MY_API_TOKEN" -F "page_number=0" -F "image_file=@image.jpg" https://shreddr.captricity.com/api/v1/instance-set/$INSTANCE_SET_ID/instance/

# And verify that the image was uploaded
curl -X GET -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/instance-set/$INSTANCE_SET_ID/instance/
# Expected response:
#    [
#        {
#            "alignment_succeeded": true, 
#            "instance_set_id": 20, 
#            "created": "2012-10-12T10:19:04.879", 
#            "modified": "2012-10-12T10:19:04.879", 
#            "page_number": 1, 
#            "image_file": "2012-02-27_17.33.41_1.png", 
#            "id": 40
#        }, 
#        "... more objects ..."
#    ]
