source_path_build_dir=$1
deploy_path_build_dir=$2

echo '-- DEPLOY STARTED' &&

rsync -av --delete $source_path_build_dir $deploy_path_build_dir &&

echo '-- DEPLOY COMPLETED'