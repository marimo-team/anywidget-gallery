# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "fastapi",
#     "marimo",
#     "starlette",
#     "requests",
#     "pydantic",
#     "jinja2",
# ]
# ///
import logging
import tempfile
from pathlib import Path
from typing import Callable, Coroutine

import marimo
import requests
import yaml
from fastapi import FastAPI, Request, Response
from fastapi.responses import RedirectResponse

app_dir = Path(__file__).parent / "apps"
app_dir.mkdir(parents=True, exist_ok=True)

data_dir = Path(__file__).parent.parent / "data"
data_dir.mkdir(parents=True, exist_ok=True)

server = (
    marimo.create_asgi_app()
    # Dynamic directory for all the apps
    .with_dynamic_directory(path="/app", directory=str(app_dir))
)

LOGGER = logging.getLogger(__name__)

# Create a FastAPI app
app = FastAPI()

PREFIX = "m_"


@app.middleware("http")
async def create_app_middleware(
    request: Request,
    call_next: Callable[[Request], Coroutine[None, None, Response]],
) -> Response:
    # Create the notebook file if it doesn't exist
    if request.url.path.startswith("/start"):
        LOGGER.info(f"Creating notebook for {request.url.path}")

        suffix = request.url.path.lstrip("/start/")
        # Prefix with m_ to avoid conflicts with existing files
        local_path = app_dir / f"{PREFIX}{suffix}"
        local_path = local_path.with_suffix(".py")

        # Already created
        if local_path.exists():
            LOGGER.info(f"Notebook already exists for {request.url.path}")
            return RedirectResponse(url=f"/app/{PREFIX}{suffix}")

        data_path = data_dir / suffix / "config.yaml"

        dictionary = yaml.safe_load(data_path.read_bytes())
        if dictionary is None:
            return Response(status_code=404)

        notebook_url = dictionary["notebookUrl"]
        notebook_code = None
        if notebook_url is not None:
            notebook_code = requests.get(notebook_url).text
        else:
            notebook_code = dictionary["notebookCode"]

        if notebook_code is None:
            return Response(status_code=404)

        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_text(notebook_code)

        import subprocess

        tmp_file = tempfile.NamedTemporaryFile()
        subprocess.run(
            [
                "uv",
                "export",
                "--script",
                str(local_path),
                "--output-file",
                tmp_file.name,
            ],
        )
        subprocess.run(["uv", "pip", "install", "-r", tmp_file.name])
        LOGGER.info(f"Created notebook for {request.url.path}")
        return RedirectResponse(url=f"/app/{PREFIX}{suffix}")

    return await call_next(request)


app.mount("/", server.build())

# Run the server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000, log_level="info")
