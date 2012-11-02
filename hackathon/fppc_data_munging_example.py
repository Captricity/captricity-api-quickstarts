import csv
import re
import time
from captools.api import Client
from cStringIO import StringIO
from pprint import PrettyPrinter
from collections import Counter

CAP_API_TOKEN = 'YOUR CAPTRICITY API TOKEN'

pp = PrettyPrinter(indent=4)

def create_fancy_csv_from_job(job_id, name):
    # Initialize Captricity Python Client (installation instructions in README
    # at https://github.com/Captricity/captools)
    start = time.time()
    client = Client(api_token=CAP_API_TOKEN)
    
    # Read all the Instance Sets associated with this job
    isets = client.read_instance_sets(job_id)

    # For each Instance Set, we will pull down all the Shreds and record the
    # transcribed value and generate a link to the Shred image.
    all_iset_data = []
    fields = {}
    fields['0'] = 'Form Name'
    fields['0.5'] = 'Form Name Image Link'
    for iset in isets:
        shreds = client.read_instance_set_shreds(iset['id'])
        iset_data = {}
        iset_data['0'] = iset['name']
        for shred in shreds:
            if '0.5' not in iset_data:
                iset_data['0.5'] = 'https://shreddr.captricity.com/api/v1/instance/%s/aligned-image' % shred['instance_id']
            # Key on Field id because Field name can be duplicated
            field_id = shred['field']['id']
            iset_data[str(field_id)] = shred['best_estimate'].encode('utf-8') if shred['best_estimate'] else None
            iset_data[str(field_id + 0.5)] = 'https://shreddr.captricity.com/api/v1/shred/%s/image' % shred['id']
            # We'll order export by Field ID, links will be (field_id + 0.5) so they will be next to the Field in CSV
            fields[str(field_id)] = shred['field']['name']
            fields[str(field_id + 0.5)] = shred['field']['name'] + ' Image Link'
        all_iset_data.append(iset_data)
        if len(all_iset_data) % 5 == 0:
            print 'Done with %s Instance Sets from Job %s in %s sec, %s to go' % (len(all_iset_data), job_id, time.time() - start, len(isets) - len(all_iset_data))
    
    # Export all the data as CSV
    data_out = [fields] + all_iset_data
    header = sorted(fields.keys())
    if job_id in [3968, 4606]:
        # No depivot for cover page or addenda
        buffer = open('%s.csv' % name, 'w')
    else:
        buffer = StringIO()
    csv_writer = csv.DictWriter(buffer, header, restval=u'--no data--')
    csv_writer.writerows(data_out)
    if job_id in [3968, 4606]:
        buffer.close()
    else:
        buffer.seek(0)
        depivot_data(csv.reader(buffer), '%s.csv' % name)

def depivot_data(reader, outfile_name):
    """
    This takes in a csv and 'depivots' the data. This is useful when a single
    row of the data actually includes multiple rows. This depivots the data
    using the heuristic that when something can be depivoted, the field names
    (column headers) are the same for each depivoted row (so that we have a 'name'
    column for each depivoted row in the raw row).
    """
    headers = reader.next()
    header_counts = Counter()
    # First count all the headers, to find candidates for depivoting
    for header in headers:
        header_counts[header] += 1
    # Seperate out the singletons from the candidates for depivoting
    singleton_headers = [k for k,v in header_counts.items() if v == 1]

    # Figure out the column indices of each depivoted row group
    singleton_column_index = {} # The column indices of the singletons
    repeated_column_sets = [] # The column indices of each row group
    leftmost = None
    for i, header in enumerate(headers):
        # Seperately track the singleton column indices
        if header in singleton_headers:
            singleton_column_index[header] = i
        else:
            # First, we want to find the left most column.
            # This will be used to determine when we need to
            # add another row group
            if not leftmost:
                leftmost = header
            if leftmost == header:
                repeated_column_sets.append({})
            # Figure out the most likely row group this header belongs to
            for x in repeated_column_sets:
                if header not in x:
                    x[header] = i
                    break
    # At this point we know how many row groups exist, and which headers
    # correspond to each row group. We will use this information to construct
    # the depivoted csv

    # First, construct the new headers. This consists of all the singletons,
    # and all the headers in one of the repeated column sets, with the
    # repeated column headers coming before the singletons. Note that
    # we will sort each header based on the original ordering.
    new_headers = []
    # Add the "depivoted" row headers
    if len(repeated_column_sets) > 0:
        tmp = repeated_column_sets[0]
        tmp_new_headers = tmp.keys()
        tmp_new_headers.sort(key=lambda x: tmp[x])
        for t in tmp_new_headers:
            new_headers.append(t)
    # Add the singletons
    new_singleton_headers = singleton_column_index.keys()
    new_singleton_headers.sort(key=lambda x: singleton_column_index[x])
    for h in new_singleton_headers[1:]:
        new_headers.append(h)
    # Keep the first column the same, since that includes the name of the row
    new_headers.insert(0, new_singleton_headers[0])

    # Construct the depivoted row
    depivoted_csv_out = csv.DictWriter(open(outfile_name, 'w'), new_headers)
    depivoted_csv_out.writeheader()
    for row in reader:
        # For each row, we want to extract the depivoted rows (if there are any that
        # need depivoting). We will simply repeat the singletons in each depivoted row.
        if len(repeated_column_sets) == 0:
            depivoted_row = {k: row[v] for k,v in singleton_column_index.items()}
            depivoted_csv_out.writerow(depivoted_row)
        else:
            for column_set in repeated_column_sets:
                depivoted_row = {k: row[v] for k,v in singleton_column_index.items()}
                depivoted_row.update({k : row[v] for k,v in column_set.items()})
                depivoted_csv_out.writerow(depivoted_row)



if __name__ == '__main__':
    for job_id, name in [
            (3968, 'Cover Page'),
            (3975, 'A-1 Form 700--Investment Disclosures'),
            (3977, 'A-2 Form 700--Business Entity Ownership'),
            (3978, 'B Form 700--Real Property Listings'),
            (4036, 'C Form 700--Income Reporting'),
            (3980, 'D Form 700--Gift Disclosures'),
            (3981, 'E Form 700--Travel Payments'),
            (4607, 'FPPC Judges Addenda')
            ]:
        create_fancy_csv_from_job(job_id, name)
