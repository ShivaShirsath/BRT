import os
from fastapi import APIRouter

router = APIRouter()

@router.get('/files')
def list_files():
    source = os.getenv('DBF_SOURCE_DIR', '/legacy-data')
    if not os.path.isdir(source):
        return {'source': source, 'tables': []}
    tables = sorted([f for f in os.listdir(source) if f.upper().endswith('.DBF')])
    return {'source': source, 'tables': tables}
