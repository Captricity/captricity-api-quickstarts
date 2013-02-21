import sys
from captools.api import Client

FORM_PAGE_0 = 'assets/example_page1.png'
FORM_PAGE_1 = 'assets/example_page2.png'

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

    iset = client.create_instance_sets(job_id, {'name':'New Iset'})

    instances = client.read_instance_set_instances(iset['id'])
    assert len(instances) == 0
    
    instance1 = client.create_instance_set_instances(iset['id'], {'page_number':'0', 'image_file':open(FORM_PAGE_0, 'rb')})
    instance2 = client.create_instance_set_instances(iset['id'], {'page_number':'1', 'image_file':open(FORM_PAGE_1, 'rb')})

    assert len(client.read_instance_set_instances(iset['id'])) == 2


    print client.read_instance_set_instances(iset['id'])
