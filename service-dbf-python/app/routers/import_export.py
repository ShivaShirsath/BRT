from fastapi import APIRouter

router = APIRouter()

@router.post('/import')
def queue_import():
    return {'queued': True, 'message': 'Import job accepted'}

@router.post('/export')
def queue_export():
    return {'queued': True, 'message': 'Export job accepted'}
