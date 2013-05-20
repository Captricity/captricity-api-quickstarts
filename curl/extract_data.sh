# $JOB_ID contains the id number of the job for which you are uploading forms to.
# The job should be in the completed state
curl -X GET -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/job/$JOB_ID/instance-set/
# Expected response:
#    [
#        {
#            "name": "instance_set_0", 
#            "created": "2012-10-17T17:58:45.553", 
#            "extra_pages_settings": "none", 
#            "modified": "2012-10-17T17:58:45.553", 
#            "instance_count": 2, 
#            "sheet_count": 2, 
#            "multipage_file": null, 
#            "id": 175641
#        }, 
#        "... more objects ..."
#    ]

# $INSTANCE_SET_ID contains the id number of the instance set that you want to see the data of
curl -X GET -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/instance-set/$INSTANCE_SET_ID/shred/
# Expected response:
#    [
#        {
#            "uuid": "bed9611f-1fca-4d7d-af2e-21ace95277f3", 
#            "created": "2012-10-17T17:58:05", 
#            "modified": "2012-10-17T17:58:05", 
#            "instance_id": 337976, 
#            "field": {
#                "name": "ssn", 
#                "data_type": "S", 
#                "awaiting_rerun": false, 
#                "friendly_name": "Text", 
#                "human_box": {
#                    "y": 0.347247057754, 
#                    "x": 0.0718520041494, 
#                    "id": 142365, 
#                    "w": 0.277730290456, 
#                    "h": 0.030985026738
#                }, 
#                "column_id": 0, 
#                "widget_type": "T", 
#                "shred_width": 826.2476141066, 
#                "shred_height": 119.29235294130001, 
#                "range_constraint": null, 
#                "is_redacted": true, 
#                "rerun_description": "unk/unk", 
#                "instructions": "", 
#                "categorical_constraint": null, 
#                "id": 141975, 
#                "constraints": []
#            }, 
#            "best_estimate": null, 
#            "id": 5771281
#        }, 
#        "... more objects ..."
#    ]
# The results are listed under the "best_estimate"

# You can also get the csv contents
curl -X GET -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/job/$JOB_ID/csv/
