deploy_path_build_dir=root@104.248.201.86:/home/projects/express-helper/server-dist/routers/chat/spa.build

echo '-- DEPLOY STARTED' &&

rsync -av --delete server-dist/routers/chat/spa.build/ $deploy_path_build_dir &&

echo '-- DEPLOY COMPLETED'