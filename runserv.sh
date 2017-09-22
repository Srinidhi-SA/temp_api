#!/usr/bin/env bash
IP=0.0.0.0
PORT=9012
WORKERS=5
TIMEOUT=3000

gunicorn --bind $IP:$PORT -w $WORKERS -t $TIMEOUT config.wsgi:application
