import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load local environment variables if present
load_dotenv()

from .api import api_router
from .database.session import db_manager
from .utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    logger.info("Starting CatalogAI Backend API Engine...")
    await db_manager.connect()
    yield
    # Shutdown lifecycle
    logger.info("Shutting down CatalogAI Backend Engine...")
    await db_manager.disconnect()


app = FastAPI(
    title="CatalogAI API",
    description="AI-Powered Product Data Enrichment & Cataloging Engine with Lineage & Traceability",
    version="2.5.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
origins_env = os.getenv("CORS_ORIGINS", "")
if origins_env:
    allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Ms"] = str(round(process_time * 1000, 2))
    return response


# Include API routes under both /api/v1 and /api for seamless frontend flexibility
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")


@app.get("/", tags=["System"])
async def root():
    return {
        "service": "CatalogAI Product Enrichment Engine",
        "version": "2.5.0",
        "status": "operational",
        "docs": "/docs",
        "endpoints": {
            "enrich": "/api/v1/enrich",
            "bulk_enrich": "/api/v1/bulk-enrich",
            "products": "/api/v1/products",
            "analytics": "/api/v1/analytics",
            "traceability": "/api/v1/traceability/{product_id}",
            "health": "/api/health"
        }
    }


@app.get("/api/health", tags=["System"])
@app.get("/health", tags=["System"])
async def health_check():
    gemini_configured = bool(os.getenv("GEMINI_API_KEY"))
    demo_mode = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    return {
        "status": "healthy",
        "gemini_active": gemini_configured and not demo_mode,
        "demo_mode": demo_mode or not gemini_configured,
        "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "timestamp": time.time()
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
