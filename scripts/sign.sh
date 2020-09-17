#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2

# zip app
chmod -R a-st $INPUT
zip -r -q --symlinks unsigned.zip $INPUT
rm -rf $INPUT

# ensure storage server is clean
ssh -q genie.theia@projects-storage.eclipse.org rm -f unsigned.zip signed.zip entitlements.plist

# copy zip to storage server
scp unsigned.zip genie.theia@projects-storage.eclipse.org:./unsigned.zip

# copy entitlements to storage server
scp $ENTITLEMENTS genie.theia@projects-storage.eclipse.org:./entitlements.plist

# sign over ssh
ssh -q genie.theia@projects-storage.eclipse.org curl -o signed.zip -F file=@unsigned.zip -F entitlements=@entitlements.plist http://build.eclipse.org:31338/macsign.php

# copy signed app back from server
scp genie.theia@projects-storage.eclipse.org:./signed.zip ./signed.zip

# check for size
actualSize=$(stat -f%z signed.zip)

# file is too small, it's likely an error so show it
if [ $actualSize -lt 40000000 ]; then
    echo "signed.zip is just $actualSize bytes large!"
    output=$(cat signed.zip)
    echo "$output"
fi

# unzip app
unzip -qq signed.zip
rm -f unsigned.zip signed.zip
