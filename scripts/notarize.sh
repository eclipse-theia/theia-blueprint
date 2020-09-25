#!/bin/bash -x

INPUT=$1
APP_ID=$2
NEEDS_UNZIP=false

# if folder, zip it
if [ -d "${INPUT}" ]; then
    NEEDS_UNZIP=true
    chmod -R a-st "${INPUT}"
    zip -r -q --symlinks unsigned.zip "${INPUT}"
    rm -rf "${INPUT}"
    INPUT=unsigned.zip
fi

# copy file to storage server
scp -p "${INPUT}" genie.theia@projects-storage.eclipse.org:./
rm -f "${INPUT}"

# name to use on server
REMOTE_NAME=${INPUT##*/}

# notarize over ssh
RESPONSE=$(ssh -q genie.theia@projects-storage.eclipse.org curl -X POST -F file=@"\"${REMOTE_NAME}\"" -F \'options={\"primaryBundleId\": "\"${APP_ID}\"", \"staple\": true};type=application/json\' http://172.30.206.146:8383/macos-notarization-service/notarize)
UUID=$(echo $RESPONSE | grep -Po '"uuid"\s*:\s*"\K[^"]+')
STATUS=$(echo $RESPONSE | grep -Po '"status"\s*:\s*"\K[^"]+')
echo "  Progress: $RESPONSE"

while [[ $STATUS == 'IN_PROGRESS' ]]; do
    sleep 1m
    RESPONSE=$(ssh -q genie.theia@projects-storage.eclipse.org curl -s http://172.30.206.146:8383/macos-notarization-service/$UUID/status)
    STATUS=$(echo $RESPONSE | grep -Po '"status"\s*:\s*"\K[^"]+')
    echo "  Progress: $RESPONSE"
done

if [[ $STATUS != 'COMPLETE' ]]; then
    echo "Notarization failed: $RESPONSE"
    exit 1
fi

echo "  Downloading stapled result"

ssh -q genie.theia@projects-storage.eclipse.org curl -o "\"notarized-${REMOTE_NAME}\"" http://172.30.206.146:8383/macos-notarization-service/${UUID}/download

# copy notarized file back from server
scp -p genie.theia@projects-storage.eclipse.org:"\"./notarized-${REMOTE_NAME}\"" "${INPUT}"

# ensure storage server is clean
ssh -q genie.theia@projects-storage.eclipse.org rm -f "\"${REMOTE_NAME}\"" "\"notarized-${REMOTE_NAME}\"" entitlements.plist

# if unzip needed
if [ "$NEEDS_UNZIP" = true ]; then
    unzip -qq "${INPUT}"

    if [ $? -ne 0 ]; then
        # echo contents if unzip failed
        output=$(cat $INPUT)	
        echo "$output"	
    fi

    rm -f "${INPUT}"
fi
