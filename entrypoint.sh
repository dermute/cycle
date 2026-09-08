#!/bin/sh
set -eu
mkdir -p /data
chown nginx:nginx /data
chmod 0777 /data
php-fpm84 -F &
exec nginx -g 'daemon off;'
