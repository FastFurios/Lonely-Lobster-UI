#!/bin/bash

echo ">> git add, commit and push orgin w/o secrets:"
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 \"<your git commit message>\""
    exit 1
fi

COMMIT_MSG=$1
FILE_PROD="./src/environments/environment.prod.ts"
FILE_PROD_HIDE="${FILE_PROD}.hide"
echo "PROD: files $FILE_PROD and $FILE_PROD_HIDE"

FILE_DEV="./src/environments/environment.ts"
FILE_DEV_HIDE="${FILE_DEV}.hide"
echo "DEV: files $FILE_DEV and $FILE_DEV_HIDE"

SEARCH_TENANT="49bf30a4-54b2-47ae-b9b1-ffa71ed3d475"
SEARCH_CLIENT_PROD="65f67e5b-d0c0-4677-adf8-fc895254393a"
SEARCH_CLIENT_DEV="7d27668f-05e5-4bbf-a904-b97b2574c813"

REPLACEMENT_TENANT="<use your own Azure tenant>"
REPLACEMENT_CLIENT_PROD="<use your own Azure IDP reference for PROD>"
REPLACEMENT_CLIENT_DEV="<use your own Azure IDP reference for DEV>"

# cp original environment files aside for later restoring
cp $FILE_PROD $FILE_PROD_HIDE
cp $FILE_DEV $FILE_DEV_HIDE

# replace my Azure tenant's references
sed -i "s/${SEARCH_TENANT}/${REPLACEMENT_TENANT}/g" "$FILE_PROD"
sed -i "s/${SEARCH_TENANT}/${REPLACEMENT_TENANT}/g" "$FILE_DEV"
sed -i "s/${SEARCH_CLIENT_PROD}/${REPLACEMENT_CLIENT_PROD}/g" "$FILE_PROD"
sed -i "s/${SEARCH_CLIENT_DEV}/${REPLACEMENT_CLIENT_DEV}/g" "$FILE_DEV"

git add .
git status
git commit -m "$1"
git push origin

#echo "--- Production file: ------------------"
#more $FILE_PROD
#echo "--- Development file: ------------------"
#more $FILE_DEV

mv $FILE_PROD_HIDE $FILE_PROD  
mv $FILE_DEV_HIDE  $FILE_DEV  

echo ">> Push to origin done."