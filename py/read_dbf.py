from dbfread import DBF
import os

# Define the file path
dbf_file = '57758923.DBF'

if not os.path.exists(dbf_file):
    print(f"Error: {dbf_file} not found.")
    print("Please place your .dbf file in this folder or update the path in this script.")
else:
    # Iterate through records one by one
    print(f"Reading records from {dbf_file}:")
    for record in DBF(dbf_file):
        print(record)

    # Or load all records into a list if memory allows
    table = DBF(dbf_file, load=True)
    if table.records:
        print("\nFirst record loaded into list:")
        print(table.records[0])
