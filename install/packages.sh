#!/bin/sh

pkg_update
echo "Installing packages..."
pkg_install $PACKAGE_NGINX $PACKAGE_REDIS $PACKAGE_MARIADB $PACKAGE_NODE $PACKAGE_NPM $PACKAGE_GIT >> "$LOG_FILE" 2>&1
echo "OK"
