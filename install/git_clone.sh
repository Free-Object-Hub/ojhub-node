#!/bin/sh

# и накоенц то!
# Раз репозитории object hub выложены в public domain,
# их наконец можно создать нормально

mkdir -p "$PROJECT_ROOT"

CLIENT="https://github.com/MIOBOMB/ojhub-cli.git"
OPENGO="https://github.com/MIOBOMB/ojhub-openGo.git"

if ! git clone "$CLIENT" "$CLIENT_ROOT"; then
    echo "[ERROR] Failed to clone Object Hub client"
    exit 1
fi

if ! git clone "$OPENGO" "$SERVER_ROOT"; then
    echo "[ERROR] Failed to clone Object Hub server"
    exit 1
fi

