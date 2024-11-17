#!/bin/bash

echo ">>> LONELY LOBSTER: GET LATEST API DEFINITIONS FROM THE BACKEND <<<"
cp ../backend/src/io_api_definitions.ts  ./src/app/shared/
echo ">>> API definition should be up-to-date now"
