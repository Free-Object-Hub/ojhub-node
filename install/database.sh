#!/bin/sh

echo "Configuring database..."

# Install MariaDB
if ! pkg_install "$PACKAGE_MARIADB" >> "$LOG_FILE" 2>&1; then
    echo "[ERROR] Failed to install MariaDB"
    exit 1
fi

# Enable and start MariaDB
if ! service_enable "$SERVICE_MARIADB" >> "$LOG_FILE" 2>&1; then
    echo "[ERROR] Failed to enable MariaDB service"
    exit 1
fi

if ! service_start "$SERVICE_MARIADB" >> "$LOG_FILE" 2>&1; then
    echo "[ERROR] Failed to start MariaDB service"
    exit 1
fi

# Create database and user
if ! mysql -u root <<EOF >> "$LOG_FILE" 2>&1
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
then
    echo "[ERROR] Failed to configure MariaDB"
    exit 1
fi

# Import database schema
#if ! mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SERVER_ROOT/schema.sql" >> "$LOG_FILE" 2>&1; then
# пока реального schema.sql там нет достаём на время из моего локального репозитория
# только чтобы проверить что оно импортирует все данные
if ! mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "/root/sqj.sql" >> "$LOG_FILE" 2>&1; then
    echo "[ERROR] Failed to import database schema"
    exit 1
fi

echo "OK"
