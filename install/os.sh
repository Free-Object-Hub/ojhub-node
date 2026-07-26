#!/bin/sh

PLATFORM="unknown"

KERNEL="$(uname -s 2>/dev/null)"

case "$KERNEL" in

FreeBSD)
    PLATFORM="freebsd"
    ;;

OpenBSD)
    PLATFORM="openbsd"
    ;;

Linux)

    if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
        PLATFORM="termux"

    elif [ -f /etc/os-release ]; then
        . /etc/os-release

        case "$ID" in
            debian)
                PLATFORM="debian"
                ;;

            ubuntu)
                PLATFORM="ubuntu"
                ;;

            alpine)
                PLATFORM="alpine"
                ;;

            arch)
                PLATFORM="arch"
                ;;

            *)
                echo "Unsupported Linux distribution: $ID" >&2
                exit 2
                ;;
        esac

    else
        echo "Unknown Linux system" >&2
        exit 2
    fi

    ;;

Darwin)
    echo "Darwin/macOS is detected but unsupported" >&2
    exit 2
    ;;

NetBSD)
    echo "NetBSD is detected but unsupported" >&2
    exit 2
    ;;

*)
    echo "Unknown kernel: $KERNEL" >&2
    exit 2
    ;;

esac

echo "$PLATFORM"
