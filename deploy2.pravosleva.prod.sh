deploy_dist_dir=root@pravosleva.ru:/home/projects/pravosleva-blog/express-helper/server-dist

echo '-- DEPLOY STARTED' &&

rsync -av --delete server-dist/ $deploy_dist_dir &&

echo '-- DEPLOY COMPLETED'