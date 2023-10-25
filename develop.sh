#!/bin/sh

SCRIPT_DIR=$(dirname "$0")
PNPM_STORE_PATH=$(pnpm store path) docker compose -f "$SCRIPT_DIR/docker-compose-dev.yml" up --build -d
