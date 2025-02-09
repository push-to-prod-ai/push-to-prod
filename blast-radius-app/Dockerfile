# An example using multi-stage image builds to create a final image without uv.

# First, build the application in the `/app` directory.
# See `Dockerfile` for details.
FROM python:3.11-slim-bookworm as builder

RUN apt-get update \
    && apt-get install -y \
         curl \
         build-essential \
         libffi-dev \
    && rm -rf /var/lib/apt/lists/* \
    && curl -LsSf https://astral.sh/uv/install.sh | sh

WORKDIR /app

COPY pyproject.toml uv.lock .python-version ./

ENV PATH="/root/.local/bin:${PATH}"

RUN uv venv && uv lock && uv sync


# Then, use a final image without uv
FROM python:3.11-slim-bookworm as runtime
# It is important to use the image that matches the builder, as the path to the
# Python executable must be the same, e.g., using `python:3.11-slim-bookworm`
# will fail.
WORKDIR /app
# Copy the application from the builder
# COPY --from=builder --chown=app:app /app /app
COPY --from=builder /app /app

COPY src app/src

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Run the FastAPI application by default
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]