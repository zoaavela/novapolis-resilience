"""API FastAPI. Pour l'instant : la route /health que le front appelle au
démarrage pour savoir si le serveur est réveillé.

Lancer en local :  uvicorn api.main:app --reload --app-dir backend
"""

from __future__ import annotations

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Novapolis Résilience", version="0.1.0")

# Adresse exacte du front, jamais "*". En local : http://localhost:5173
origines = [o.strip() for o in os.environ.get("FRONT_ORIGIN", "http://localhost:5173").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origines,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def entetes_securite(request: Request, call_next):
    reponse = await call_next(request)
    reponse.headers["X-Content-Type-Options"] = "nosniff"
    reponse.headers["X-Frame-Options"] = "DENY"
    reponse.headers["Referrer-Policy"] = "no-referrer"
    reponse.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return reponse


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
