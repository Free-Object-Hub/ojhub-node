#!/bin/sh

echo "Configuring nginx..."

# директория, куда кладём конфиг Object Hub
mkdir -p "$NGINX_CONF_DIR/conf.d"

# генерация конфига из шаблона
sed -e "s|{{DOMAIN_NAME}}|$DOMAIN_NAME|g" -e "s|{{SERVER_ROOT}}|$SERVER_ROOT|g" -e "s|{{CLIENT_ROOT}}|$CLIENT_ROOT|g" ojhub-nginx.conf > "$NGINX_CONF_DIR/conf.d/ojhub.conf"

if ! grep -qF "conf.d/*.conf" "$NGINX_CONF"; then

	echo "Adding nginx include..."

	cp "$NGINX_CONF" "$NGINX_CONF.bak"

	awk '
	{
		print
		if ($0 ~ /^[[:space:]]*http[[:space:]]*\{/)
			print "\tinclude conf.d/*.conf;"
	}
	' "$NGINX_CONF" > "$NGINX_CONF.tmp"


	if mv "$NGINX_CONF.tmp" "$NGINX_CONF"; then
		echo "nginx include added"
	else
		echo "WARN: failed to modify nginx.conf"
		echo "Please add manually: include conf.d/*.conf;"
		rm -f "$NGINX_CONF.tmp"
	fi

fi

nginx -t || {
    echo "nginx configuration error"
    exit 1
}

service_enable "$SERVICE_NGINX"
service_start "$SERVICE_NGINX"

echo "nginx configured"
