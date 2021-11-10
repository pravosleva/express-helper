deploy_path_build_dir=root@pravosleva.ru:/home/projects/pravosleva-blog/express-helper/server-dist/routers/chat/spa.build

echo '-- DEPLOY STARTED' &&

rsync -av --delete server-dist/routers/chat/spa.build/ $deploy_path_build_dir &&

echo '-- DEPLOY COMPLETED'