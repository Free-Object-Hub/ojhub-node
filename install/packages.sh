#!/bin/sh

pkg_update
echo "Installing packages..."
# FIXME: добавить в главный скрипт пункт "you have configured mysql service [yes/no]", и если yes то не ставить mariadb
pkg_install $PACKAGE_NGINX $PACKAGE_REDIS $PACKAGE_GO $PACKAGE_GIT >> "$LOG_FILE" 2>&1
echo "OK"
