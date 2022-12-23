# Step 1: Build the package
# yarn --cwd /home/pravosleva/projects/smartprice_projects/google-api-nodejs-client &&
# yarn --cwd /home/pravosleva/projects/smartprice_projects/google-api-nodejs-client compile

# Step 2. Move to rep: src/server/utils/google-api-nodejs-client@110.0.0/src/apis/docs (all that is needed)

# Step 3. Import dir copy script

source ./dir-copy2.sh

# Step 4. Copy to node_modules (all that is needed)

# dir_copy \
# /home/pravosleva/projects/smartprice_projects/google-api-nodejs-client/src/apis/docs \
# /home/pravosleva/projects/smartprice_projects/express-helper/node_modules/googleapis/build/src/apis/docs

dir_copy \
src/server/utils/google-api-nodejs-client@110.0.0/src/apis/docs \
node_modules/googleapis/build/src/apis/docs
