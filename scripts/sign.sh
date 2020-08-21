#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2
OUTPUT=$3

if [ "$ENTITLEMENTS" != "" ]; then
    ENTITLEMENTS="-F entitlements=@$ENTITLEMENTS"
fi

TYPE=${INPUT##*.}
case "$TYPE" in
    "exe") ENDPOINT="winsign" ;;
    "msi") ENDPOINT="winsign" ;;
    "dmg") ENDPOINT="macsign" ;;
    "pkg") ENDPOINT="macsign" ;;
    "app") ENDPOINT="macsign" ;;
esac

if [ "$TYPE" == "app" ]; then
    chmod -R a-st $INPUT
    zip -r -q unsigned.zip $INPUT
    rm -rf $INPUT

    curl -o signed.zip -F file=@unsigned.zip $ENTITLEMENTS http://build.eclipse.org:31338/$ENDPOINT.php

    unzip -qq signed.zip
    rm -f unsigned.zip signed.zip
else
    curl -o $OUTPUT -F file=@$INPUT $ENTITLEMENTS http://build.eclipse.org:31338/$ENDPOINT.php
fi
