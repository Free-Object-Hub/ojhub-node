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

pkg_install()
{
    pkg install -y "$@"
}

pkg_update()
{
    pkg update
}

# ==========================
# Services
# ==========================

service_enable()
{
    sysrc "${1}_enable=YES"
}

service_disable()
{
    sysrc "${1}_enable=NO"
}

service_start()
{
    service "$1" start
}

service_stop()
{
    service "$1" stop
}

service_restart()
{
    service "$1" restart
}

# ==========================
# Packages
# ==========================

PACKAGE_NGINX="nginx"
PACKAGE_REDIS="redis"
PACKAGE_MARIADB="mariadb118-server"
PACKAGE_NODE="node24"
PACKAGE_NPM="npm-node24"
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

SERVER_ROOT="/usr/local/ojhub"
CLIENT_ROOT="/usr/local/ojhub-cli"

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
