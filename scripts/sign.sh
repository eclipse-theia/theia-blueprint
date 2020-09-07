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
    # zip app
    chmod -R a-st $INPUT
    zip -r -q unsigned.zip $INPUT
    rm -rf $INPUT

    # copy zip to storage server
    scp unsigned.zip genie.theia@projects-storage.eclipse.org:./unsigned

    # sign over ssh
    ssh -q genie.theia@projects-storage.eclipse.org curl -o signed -F file=@unsigned $ENTITLEMENTS http://build.eclipse.org:31338/$ENDPOINT.php

    # copy signed app back from server
    scp genie.theia@projects-storage.eclipse.org:./signed ./signed.zip

    # unzip app
    unzip -qq signed.zip
    rm -f unsigned.zip signed.zip
else
    # copy file to storage server
    scp $INPUT genie.theia@projects-storage.eclipse.org:./unsigned

    # sign over ssh
    ssh -q genie.theia@projects-storage.eclipse.org curl -o signed -F file=@unsigned $ENTITLEMENTS http://build.eclipse.org:31338/$ENDPOINT.php

    # copy signed file back from server
    scp genie.theia@projects-storage.eclipse.org:./signed ./$OUTPUT
fi
