#!/bin/sh

# =============================================================================
# Object hub installer
# Author - MIOBOMB (2026)
#
# Его цель настолько простая насколько это вообще возможно:
# Быть портируемым и сделать процесс установки dev среды object hub
# настолько простым, насколько это возможно.
#
# Список поддерживаемых платформ.
# Dev:
# - Freebsd
#
# В планах:
# - Freebsd (prod)
# - Debian stable (dev/prod)
# - Termux (dev)
# - OpenBSD (dev/prod)
# - Arch linux (dev)
# - Darwin (АКА MacOS, dev)
# - NetBSD (dev)
#
# Что точно не буду делать:
# - Windows (используйте WSL или виртуалки)
# - Gentoo (вы и сами справитесь)
# - TempleOS (ну, вы сами понимаете)
# - HaikuOS (если там есть наш веб стек я передумаю)
#
# Когда эти планы воплотятся в жизнь - хер знает
# Может через 2-3 года
# А может я словлю гиперфикс и зафигачу всё сразу за неделю
# XXX: я не буду делать прод пока не начнётся ещё один переезд
# на какой то другой сервер
#
# =============================================================================

# =============================================================================
# КОНФИГ РАСПОЛОЖЕН НИЖЕ:
DOMAIN_NAME="_"
DB_NAME="ojhub"
DB_USER="ojhub"
DB_PASSWORD="localhost"
# =============================================================================

echo "[WARN] this script need to run into clean system (like new container) as root"

SCRDIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PLATFORM="$("$SCRDIR/os.sh")"
LOG_FILE="$SCRDIR/log.txt"

#echo "Detected: $PLATFORM"

case "$PLATFORM" in
    freebsd)
        . "$SCRDIR/prof/freebsd.sh"
        ;;

	# TODO: захуярить когда нибуть
    debian|ubuntu)
        . "$SCRDIR/prof/debian.sh"
        ;;

	# TODO: захуярить сразу после 100% готовности
	termux)
		. "$SCRDIR/prof/termux.sh"
		;;

    *)
        echo "Unsupported platform"
        exit 1
        ;;
esac

echo
echo "Object Hub installation configuration"
echo "Press Enter to use the default value."
echo

# DOMAIN ======================================================================
printf "Domain name [%s]: " "$DOMAIN_NAME"
read INPUT_DOMAIN
	
if [ -n "$INPUT_DOMAIN" ]; then
    DOMAIN_NAME="$INPUT_DOMAIN"
fi

# ROOT FOLDER =================================================================
printf "Project root [%s]: " "$PROJECT_ROOT"
read INPUT_PROJECT_ROOT
	
if [ -n "$INPUT_PROJECT_ROOT" ]; then
    PROJECT_ROOT="$INPUT_PROJECT_ROOT"
fi

# DB NAME =====================================================================
printf "Database name [%s]: " "$DB_NAME"
read INPUT_DB_NAME
	
if [ -n "$INPUT_DB_NAME" ]; then
    DB_NAME="$INPUT_DB_NAME"
fi

# DB USER =====================================================================
printf "Database user [%s]: " "$DB_USER"
read INPUT_DB_USER
	
if [ -n "$INPUT_DB_USER" ]; then
    DB_USER="$INPUT_DB_USER"
fi

# DB PASSWD ===================================================================
printf "Database password [%s]: " "$DB_PASSWORD"
read INPUT_DB_PASSWORD
	
if [ -n "$INPUT_DB_PASSWORD" ]; then
    DB_PASSWORD="$INPUT_DB_PASSWORD"
fi

CLIENT_ROOT="$PROJECT_ROOT/$CLIENT_ROOT"
SERVER_ROOT="$PROJECT_ROOT/$SERVER_ROOT"

export DOMAIN_NAME
export PROJECT_ROOT
export CLIENT_ROOT
export SERVER_ROOT

echo
echo "Configuration:"
echo "  Domain:       $DOMAIN_NAME"
echo "  Project root: $PROJECT_ROOT"
echo "  Client root:  $CLIENT_ROOT"
echo "  Server root:  $SERVER_ROOT"
echo "  Database name:  $DB_NAME"
echo "  Database username:  $DB_USER"
echo

exit 1;

. "$SCRDIR/packages.sh"
. "$SCRDIR/git_clone.sh"
. "$SCRDIR/nginx_cfg.sh"
. "$SCRDIR/redis_cfg.sh"
. "$SCRDIR/database.sh"
#FIXME: да сделай ты блять базу данных у тебя скрипт пылится почти 2 месяца только изза неё блять

echo "maybe done lol";
