#!/bin/sh
set -eu
php-fpm84 -F &
exec nginx -g 'daemon off;'
