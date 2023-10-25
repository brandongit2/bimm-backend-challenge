#!/bin/sh

PNPM_STORE_PATH=$(pnpm store path) docker compose -f docker-compose-dev.yml up --build -d
