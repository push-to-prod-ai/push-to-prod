# Base Arguments
ARG APP_DIR=/app

# Build image
FROM python:3.12-slim AS build
ARG APP_DIR

RUN apt-get update && apt-get install -y \
    curl build-essential libffi-dev \
    && rm -rf /var/lib/apt/lists/*

ENV POETRY_VERSION=1.8.2
RUN curl -sSL https://install.python-poetry.org | python -
ENV PATH=/root/.local/bin:$PATH

WORKDIR ${APP_DIR}
COPY . .

RUN python -m venv --copies ${APP_DIR}/venv
RUN . ${APP_DIR}/venv/bin/activate && poetry install --only main

# Deployment image
FROM python:3.12-slim AS prod
ARG APP_DIR

COPY --from=build ${APP_DIR}/venv ${APP_DIR}/venv/
ENV PATH=${APP_DIR}/venv/bin:$PATH

WORKDIR ${APP_DIR}/
COPY src/ ./src/

EXPOSE 8080

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]