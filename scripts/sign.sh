#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2

FILE="$INPUT"
NEEDS_ZIP=false

# if folder, zip it
if [ -d "$INPUT" ]; then
    FILE=unsigned.zip
    NEEDS_ZIP=true

    chmod -R a-st $INPUT
    zip -r -q --symlinks $FILE $INPUT
    rm -rf $INPUT
fi

# copy file to storage server
scp $FILE genie.theia@projects-storage.eclipse.org:./
rm -f $FILE

# copy entitlements to storage server
scp $ENTITLEMENTS genie.theia@projects-storage.eclipse.org:./entitlements.plist

# sign over ssh
ssh -q genie.theia@projects-storage.eclipse.org curl -o signed-$FILE -F file=@$FILE -F entitlements=@entitlements.plist http://build.eclipse.org:31338/macsign.php

# copy signed file back from server
scp genie.theia@projects-storage.eclipse.org:./signed-$FILE $FILE

# ensure storage server is clean
ssh -q genie.theia@projects-storage.eclipse.org rm -f $FILE signed-$FILE entitlements.plist

# if unzip needed
if [ "$NEEDS_ZIP" = true ]; then
    unzip -qq $FILE
    rm -f $FILE
fi
