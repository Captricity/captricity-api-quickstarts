# $JOB_ID contains the id number of the job for which you are uploading forms to. The job must be in the setup state.
curl -X GET -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/job/$JOB_ID/readiness
# Expected response:
#    {
#        "status": "completed", 
#        "has_sheets": true, 
#        "is_downloading_from_third_party": false, 
#        "has_broken_instance_sets": false, 
#        "has_instance_sets": true, 
#        "has_document": true, 
#        "sheet_count": 2, 
#        "has_empty_sheets": false, 
#        "is_ready_to_submit": false, 
#        "has_instances": true, 
#        "is_converting_instance_sets": false, 
#        "empty_sheet_count": 0
#    }

curl -X GET -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/job/$JOB_ID/price
# Expected response:
#    {
#        "overage_field_count": 0, 
#        "page_count": 2, 
#        "job_id": 4448, 
#        "user_cents_per_page": 20, 
#        "user_included_fields_per_page": 20, 
#        "user_cents_per_overage_field": 1, 
#        "user_discount": 0, 
#        "total_user_cost_in_cents": 40, 
#        "total_job_cost_in_cents": 40
#    }

curl -X POST -H "Captricity-API-Token: $MY_API_TOKEN" https://shreddr.captricity.com/api/v1/job/$JOB_ID/submit/
