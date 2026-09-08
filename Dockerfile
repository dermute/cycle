FROM nginx:alpine

RUN apk add --no-cache php84-fpm php84-pdo_sqlite \
    && rm -f /etc/php84/php-fpm.d/www.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY php-fpm.conf /etc/php84/php-fpm.d/cycle.conf
COPY entrypoint.sh /entrypoint.sh
COPY api/ /var/www/api/
COPY index.html styles.css app.js /usr/share/nginx/html/

RUN chmod +x /entrypoint.sh && mkdir -p /data && chown nginx:nginx /data

EXPOSE 80

VOLUME ["/data"]
CMD ["/entrypoint.sh"]
