from fastapi import FastAPI
from app.routers.health import router as health_router
from app.routers.metadata import router as metadata_router
from app.routers.import_export import router as import_export_router

app = FastAPI(title="BRT DBF Bridge", version="1.0.0")
app.include_router(health_router)
app.include_router(metadata_router, prefix="/dbf")
app.include_router(import_export_router, prefix="/dbf")
