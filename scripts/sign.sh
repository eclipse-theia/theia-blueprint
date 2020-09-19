#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2
NEEDS_UNZIP=false

# if folder, zip it
if [ -d "$INPUT" ]; then
    NEEDS_UNZIP=true

    chmod -R a-st $INPUT
    zip -r -q --symlinks unsigned.zip $INPUT
    rm -rf $INPUT
    INPUT=unsigned.zip
fi

# name to use on server
REMOTE_NAME=${INPUT##*/}

# copy file to storage server
scp $INPUT genie.theia@projects-storage.eclipse.org:./$REMOTE_NAME
rm -f $INPUT

# copy entitlements to storage server
scp $ENTITLEMENTS genie.theia@projects-storage.eclipse.org:./entitlements.plist

# sign over ssh
ssh -q genie.theia@projects-storage.eclipse.org curl -o signed-$REMOTE_NAME -F file=@$REMOTE_NAME -F entitlements=@entitlements.plist http://build.eclipse.org:31338/macsign.php

# copy signed file back from server
scp genie.theia@projects-storage.eclipse.org:./signed-$REMOTE_NAME $INPUT

# ensure storage server is clean
ssh -q genie.theia@projects-storage.eclipse.org rm -f $REMOTE_NAME signed-$REMOTE_NAME entitlements.plist

# if unzip needed
if [ "$NEEDS_UNZIP" = true ]; then
    unzip -qq $INPUT
    rm -f $INPUT
fi

# echo contents if it's not executable
if [[ ! -x "$INPUT" ]]; then
    output=$(cat $INPUT)
#    echo "$output"
fi
