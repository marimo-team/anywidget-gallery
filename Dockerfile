FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

COPY nb-server/ nb-server/
COPY data/ data/

CMD ["uv", "run", "--no-project", "nb-server/main.py"]
