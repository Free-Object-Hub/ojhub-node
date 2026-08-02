#!/bin/sh

# Object Hub installer
# FreeBSD platform configuration
# ==========================
# Platform info
# ==========================

PLATFORM_NAME="freebsd"
REQUIRES_ROOT="yes"
SYSTEM_SERVICE="yes"

# ==========================
# Package manager
# ==========================
pkg_install() {
    pkg install -y "$@"
}
pkg_update() {
    pkg update
}

# ==========================
# Services
# ==========================
service_enable() {
    sysrc "${1}_enable=YES"
}
service_disable() {
    sysrc "${1}_enable=NO"
}
service_start() {
    service "$1" start
}
service_stop() {
    service "$1" stop
}
service_restart() {
    service "$1" restart
}

# ==========================
# Packages
# ==========================
PACKAGE_NGINX="nginx"
PACKAGE_REDIS="redis"
PACKAGE_MARIADB="mariadb118-server"
PACKAGE_GO="go126"
PACKAGE_GIT="git"

# ==========================
# Service names
# ==========================
SERVICE_NGINX="nginx"
SERVICE_REDIS="redis"
SERVICE_MARIADB="mysql-server"

# ==========================
# Paths
# ==========================

PREFIX="/usr/local"
	
NGINX_CONF_DIR="/usr/local/etc/nginx"
NGINX_CONF="/usr/local/etc/nginx/nginx.conf"
	
REDIS_CONF="/usr/local/etc/redis.conf"
	
PROJECT_ROOT="/usr/local/ojhub"
SERVER_ROOT="openGo"
CLIENT_ROOT="cli"

# ==========================
# Users
# ==========================
	
WEB_USER="www"
WEB_GROUP="www"

# ==========================
# Shell environment
# ==========================
export PLATFORM_NAME
export REQUIRES_ROOT
export SYSTEM_SERVICE
	
export PREFIX
	
export NGINX_CONF_DIR
export NGINX_CONF
export REDIS_CONF
export SERVER_ROOT
export CLIENT_ROOT
	
export WEB_USER
export WEB_GROUP
