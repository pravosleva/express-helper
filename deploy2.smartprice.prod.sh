deploy_dist_dir=root@104.248.201.86:/home/projects/express-helper/server-dist

echo '-- DEPLOY STARTED' &&

rsync -av --delete server-dist/ $deploy_dist_dir &&

echo '-- DEPLOY COMPLETED'