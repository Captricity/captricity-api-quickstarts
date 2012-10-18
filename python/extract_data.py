import sys
from captools.api import Client

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'You must pass in a job id'
        sys.exit(0)

    from api_token import API_TOKEN
    client = Client(API_TOKEN)

    job_id = sys.argv[1]
    if client.read_document(client.read_job(job_id)['document_id'])['name'] != 'Example School Survey Template':
        print 'You must choose a job that is using the example school survey template'
        sys.exit(0)

    instance_sets = client.read_instance_sets(job_id)

    shreds = client.read_instance_set_shreds(instance_sets[0]['id'])
    print 'Sample result of one cell:', shreds[0]

    csv_out = client.read_job_results_csv(job_id)
    print 'CSV result:'
    print csv_out
