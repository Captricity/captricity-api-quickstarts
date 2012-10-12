import sys
from captools.api import Client

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'You must pass in a job id'
        sys.exit(0)

    from api_token import API_TOKEN
    client = Client(API_TOKEN, endpoint='https://nightly.captricity.com/api/backbone/schema')

    job_id = sys.argv[1]
    if client.read_document(client.read_job(job_id)['document_id'])['name'] != 'Example School Survey Template':
        print 'You must choose a job that is using the example school survey template'
        sys.exit(0)

    job_readiness = client.read_job_readiness(job_id)
    print 'Is job ready to submit?:', job_readiness['is_ready_to_submit']

    job_price = client.read_job_price(job_id)
    print 'How much does the job cost?:', job_price['total_job_cost_in_cents']

    client.submit_job(job_id, {})
    print 'Job submitted successfully and your account has been charged'
