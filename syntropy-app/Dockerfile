# Base Arguments
ARG APP_DIR=/app

# Build image
FROM python:3.12-slim AS build
ARG APP_DIR

ENV POETRY_VERSION=2.0.1

# Only install essential build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential libffi-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | python3 - --version $POETRY_VERSION

# Copy only files needed for dependency installation first
COPY pyproject.toml poetry.lock ./

# Install dependencies
ENV PATH=/root/.local/bin:$PATH
RUN python -m venv --copies ${APP_DIR}/venv && \
    . ${APP_DIR}/venv/bin/activate && \
    poetry install --only main --no-interaction --no-root

# Copy source code after installing dependencies
COPY src/ ./src/

# Deployment image
FROM python:3.12-slim AS prod
ARG APP_DIR

COPY --from=build ${APP_DIR}/venv ${APP_DIR}/venv/
COPY src/ ./src/

ENV PATH=${APP_DIR}/venv/bin:$PATH
EXPOSE 8080

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]