from captools.api import Client

if __name__ == '__main__':
    from api_token import API_TOKEN
    client = Client(API_TOKEN)

    documents = client.read_documents()
    document_id = filter(lambda x: x['name'] == 'Example School Survey Template', documents).pop()['id']

    job = client.create_jobs({'document_id': document_id})
    print job
