#!/bin/sh
echo "Configuring redis..."

sed -i '' -e "s|^save .*|save \"\"|" -e "s|^appendonly .*|appendonly no|" "$REDIS_CONF"

service_enable "$SERVICE_REDIS"
service_start "$SERVICE_REDIS"

echo "redis configured"
