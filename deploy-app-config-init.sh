echo '{
  "prod:restart-all": {
    "user": "<USER>",
    "host": "<HOST>",
    "port": "<PORT>",
    "files": "bin public server-dist package.json",
    "path": "/home/pravosleva/pravosleva-blog/express-helper",
    "pre-deploy-remote": "pm2 stop all",
    "post-deploy": "pm2 delete all; yarn; pm2 resurrect --update-env"
  },
  "prod:restart-helper": {
    "user": "<USER>",
    "host": "<HOST>",
    "port": "<PORT>",
    "files": "bin public server-dist package.json",
    "path": "/home/pravosleva/pravosleva-blog/express-helper",
    "post-deploy": "pm2 stop 2; yarn; pm2 restart 2 --update-env"
  },
  "dev": {},
  "staging": {}
}' > deploy-app-config.json
