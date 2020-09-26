#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2
NEEDS_UNZIP=false

# if folder, zip it
if [ -d "${INPUT}" ]; then
    NEEDS_UNZIP=true
    zip -r -q -y unsigned.zip "${INPUT}"
    rm -rf "${INPUT}"
    INPUT=unsigned.zip
fi

# copy file to storage server
scp -p "${INPUT}" genie.theia@projects-storage.eclipse.org:./
rm -f "${INPUT}"

# copy entitlements to storage server
scp -p "${ENTITLEMENTS}" genie.theia@projects-storage.eclipse.org:./entitlements.plist

# name to use on server
REMOTE_NAME=${INPUT##*/}

# sign over ssh
ssh -q genie.theia@projects-storage.eclipse.org curl -o "\"signed-${REMOTE_NAME}\"" -F file=@"\"${REMOTE_NAME}\"" -F entitlements=@entitlements.plist http://build.eclipse.org:31338/macsign.php

# copy signed file back from server
scp -p genie.theia@projects-storage.eclipse.org:"\"./signed-${REMOTE_NAME}\"" "${INPUT}"

# ensure storage server is clean
ssh -q genie.theia@projects-storage.eclipse.org rm -f "\"${REMOTE_NAME}\"" "\"signed-${REMOTE_NAME}\"" entitlements.plist

# if unzip needed
if [ "$NEEDS_UNZIP" = true ]; then
    unzip -qq "${INPUT}"

    if [ $? -ne 0 ]; then
        # echo contents if unzip failed
        output=$(cat $INPUT)
        echo "$output"
        exit 1
    fi

    rm -f "${INPUT}"
fi
