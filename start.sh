#!/bin/bash
echo "Starting Secure Chat Server with Gunicorn..."
gunicorn server:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:10000
