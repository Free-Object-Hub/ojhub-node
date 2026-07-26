#!/bin/sh

# ========================================
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
# - OpenBSD (dev/prod)
# - Debian stable (dev/prod)
# - Termux (dev)
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
# ========================================

# ========================================
# КОНФИГ РАСПОЛОЖЕН НИЖЕ:
DOMAIN_NAME="_"
# ========================================

PLATFORM="$(./os.sh)"
LOG_FILE="./log.txt"

echo "Detected: $PLATFORM"

case "$PLATFORM" in
    freebsd)
        . ./prof/freebsd.sh
        ;;

	# TODO: захуярить когда нибуть
    debian|ubuntu)
        . ./prof/debian.sh
        ;;

	# TODO: захуярить сразу после 100% готовности
	termux)
		. ./prof/termux.sh
		;;

    *)
        echo "Unsupported platform"
        exit 1
        ;;
esac

# echo "Platform loaded"
. ./packages.sh
. ./nginx_cfg.sh
. ./redis_cfg.sh

echo "maybe done lol";
