# NOTE: Все директории относительно project root dir
echo "SKIP_PREFLIGHT_CHECK=true" > src/frontend.signin/.env

if [ $# -eq 1 ]
then
  # NOTE: Билд CRA всегда происходит как для production.
  case $1 in
    "dev")
      echo "REACT_APP_WS_API_URL=http://localhost:5000
PUBLIC_URL=/chat" > src/frontend.chat/.env.production &&
      echo "REACT_APP_WS_API_URL=http://localhost:5000
PUBLIC_URL=/chat" > src/frontend.chat/.env.development.local
    ;;
    "prod")
      echo "REACT_APP_WS_API_URL=http://gosuslugi.pravosleva.ru
PUBLIC_URL=/express-helper/chat" > src/frontend.chat/.env.production
    ;;
    *)
    echo "☠️ SCRIPT: unknown param $1" &&
    exit 1
  esac
  exit 0
else
  echo "☠️ SCRIPT: param was not set"
  exit 1
fi

## NGINX:

## 00-upstreams.conf

# upstream helper {
#   server 127.0.0.1:5000 fail_timeout=0 max_fails=0;
# }

## 50-pravosleva.ru.conf

# server {
#   location /express-helper/ {
#     proxy_pass http://helper/;
#   }
# }

## 51-gosuslugi.pravosleva.ru.conf

# server {
#   listen 80;
#   server_name gosuslugi.pravosleva.ru;

#   location / {
#     proxy_set_header Host pravosleva.ru;
#     proxy_pass http://127.0.0:80;
#   }
#   location /socket.io {
#     proxy_pass http://helper;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection "Upgrade";
#     proxy_set_header Host pravosleva.ru;
#   }
# }