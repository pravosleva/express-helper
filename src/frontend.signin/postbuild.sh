#!/bin/bash
# set -e
# set -x

EXTERNAL_DIR_0=""$(dirname "$PWD")""
EXTERNAL_DIR=""$(dirname "$EXTERNAL_DIR_0")""

source "${EXTERNAL_DIR}/log-format.sh"

info '-- POSTBUILD STARTED: Singn In page 🔨 '

TARGET_DIR="${EXTERNAL_DIR}/server-dist/routers/auth/pages/signin/build"

# Step 1: Create target dir if necessary
if [ ! -d $TARGET_DIR ];
then
  mkdir $TARGET_DIR
  if [ ! $? -eq 0 ]; then
    echo "ERROR: ${TARGET_DIR} could not be created!"
    exit 1
  else
    echo "New dir created: ${TARGET_DIR}"
  fi
else
  rm -rf ${TARGET_DIR}/*;
  echo "Dir cleared: ${TARGET_DIR}"
fi

echo -ne '##                        (10%)\r'

# Step 2: Copy build product from ./build/ to ../public/ dir
for i in ./build/*; do cp -r $i "${TARGET_DIR}"; done;

echo -ne '######                    (30%)\r'

echo -ne '########################  (100%)\r'

info '-- POSTBUILD COMPLETED 🛠️ '

exit 0
