#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2

# zip app
chmod -R a-st $INPUT
zip -r -q unsigned.zip $INPUT
rm -rf $INPUT

# copy zip to storage server
scp unsigned.zip genie.theia@projects-storage.eclipse.org:./unsigned

# copy entitlements to storage server
scp $ENTITLEMENTS genie.theia@projects-storage.eclipse.org:./entitlements

# sign over ssh
ssh -q genie.theia@projects-storage.eclipse.org curl -o signed -F file=@unsigned -F entitlements=@entitlements http://build.eclipse.org:31338/macsign.php

# copy signed app back from server
scp genie.theia@projects-storage.eclipse.org:./signed ./signed.zip

# unzip app
unzip -qq signed.zip
rm -f unsigned.zip signed.zip
