deploy_dist_dir=root@pravosleva.ru:/home/projects/pravosleva-blog/express-helper/server-dist
deploy_nm=root@pravosleva.ru:/home/projects/pravosleva-blog/express-helper/node_modules

echo '-- DEPLOY STARTED' &&

rsync -av --delete server-dist/ $deploy_dist_dir &&
rsync -av --delete node_modules/ $deploy_nm &&

echo '-- DEPLOY COMPLETED'
