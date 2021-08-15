# express-helper

Based on `express` code generator.

## Roadmap:

- [x] [Quick start](#quick-start)
- [x] [Deploy](#deploy)
- [x] [url-metadata](#url-metadata)
- [x] [reCAPTCHA-v3](#recaptcha-v3)
- [x] [Smartprice helper](#smartprice-helper)
- Access feature
  - [x] [frontend.signin](#frontend-signin)
  - [x] [How to add new access space](#add-access-space)
    - [ ] Auth by QR Code
      - [ ] #ERRPAGE (вместо 500 на /go-target)
      - [ ] Swagger for Test QR API

## quick-start

```bash
yarn && yarn dev
```

## deploy

> ⚡ Once: `bash deploy-app-config-init.sh`
>
> _Init config template_

### `yarn deploy:prod:restart-all`

_Local build then deploy and restart all current pm2 processes_

### `yarn deploy:prod:restart-helper`

_Local build then deploy then `pm2 restart 2`_

`deploy-app-config.json`

_Old:_

```js
{
  "prod:restart-all": {
    "user": "<USER>",
    "host": "<HOST>",
    "port": "<PORT>",
    // "files": "bin app.js public routers routers/**/*.yaml utils *.json",
    "files": "bin public server-dist package.json",
    "path": "/home/path-to-dir/pravosleva-blog/express-helper",
    "pre-deploy-remote": "pm2 stop all",
    "post-deploy": "pm2 delete all; yarn; pm2 resurrect --update-env"
  },
  "prod:restart-helper": {
    "user": "<USER>",
    "host": "<HOST>",
    "port": "<PORT>",
    "files": "bin public server-dist package.json",
    "path": "/home/path-to-dir/pravosleva-blog/express-helper",
    "post-deploy": "pm2 stop 2; yarn; pm2 restart 2 --update-env"
  },
  "dev": {},
  "staging": {}
}
```

_New (ts transpiling added):_

```js
{
  "prod:restart-helper": {
    "user": "root",
    "host": "pravosleva.ru",
    "port": "22",
    "files": "bin public server-dist package.json",
    "path": "/home/pravosleva/pravosleva-blog/express-helper",
    "post-deploy": "pm2 stop 2; yarn; pm2 restart 2 --update-env"
  },
  "dev": {},
  "staging": {}
}
```

## Test

```bash
yarn test
```

## url-metadata

Based on `url-metadata` npm module. See [Swagger](http://pravosleva.ru/express-helper/swagger/#/default/get_url_metadata_editorjs). And [local instance](http://localhost:5000/swagger/#/default/get_url_metadata_editorjs).

### Sample

`GET http://localhost:5000/url-metadata/editorjs?url=<YOUR_PAGE_URL>`

_For example_

```bash
curl 'http://pravosleva.ru/express-helper/url-metadata/editorjs?url=uremont.com' \
  -H 'Connection: keep-alive' \
  -H 'Cache-Control: max-age=0' \
  -H 'Upgrade-Insecure-Requests: 1' \
  -H 'User-Agent: Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Mobile Safari/537.36' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
  -H 'Accept-Language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H 'Cookie: _ga=GA1.2.183912308.1610541495; _ym_uid=1610541496300489295; _ym_d=1610541496' \
  -H 'If-None-Match: W/"2be-diJo7qD3bwLgbiNi2gsHFMKSNsM"' \
  --compressed \
  --insecure
```

_200_

```js
{
	"success": 1,
	"meta": {
		"url": "https://uremont.com/",
		"canonical": "",
		"title": "Выбери свой автосервис | Uremont",
		"image": "https://uremont.com/static/img/og-images/ulogo-1200-630.png",
		"author": "",
		"description": "",
		"keywords": "",
		"source": "uremont.com",
		"og:url": "https://uremont.com",
		"og:locale": "",
		"og:locale:alternate": "",
		"og:title": "Выбери свой автосервис | Uremont",
		"og:type": "website",
		"og:description": "",
		"og:determiner": "",
		"og:site_name": "uremont.com",
		"og:image": "https://uremont.com/static/img/og-images/ulogo-1200-630.png",
		"og:image:secure_url": "",
		"og:image:type": "",
		"og:image:width": "600",
		"og:image:height": "315",
		"price": "",
		"priceCurrency": "",
		"availability": ""
	}
}
```

### Usage in config for `Editor.js`

```js
const editor = new EditorJS({
  holderId: 'editorjs',
  tools: {
    // ...
    linkTool: {
      class: LinkTool,
      config: {
        endpoint: 'http://localhost:5000/url-metadata/editorjs', // Your backend endpoint for url data fetching
      },
    },
  },
})
```

## recaptcha-v3

[Swagger](http://pravosleva.ru/express-helper/swagger/#/default/post_recaptcha_v3_verify). And [local instance](http://localhost:5000/swagger/#/default/post_recaptcha_v3_verify).

`.env`

```env
RECAPTCHAV3_VERIFY_URL=https://www.google.com/recaptcha/api/siteverify
RECAPTCHAV3_SERVER_KEY=<RECAPTCHAV3_SERVER_KEY>
```

### Sample

_Req_

```
POST `http://localhost:5000/recaptcha-v3/verify`
{ captcha: string }
```

_Res: 200_

```js
{
  success: 1,
  original: {}, // Like original format
}
```

## smartprice-helper

### NGINX settings

`/etc/nginx/nginx.conf`

```bash
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    # multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # NOTE: Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
}
```

`/etc/nginx/conf.d/default.conf`

```bash
server {
    listen 80;
    client_max_body_size 32m;
    server_tokens off;
    proxy_http_version 1.1;

    location / {
        if ($request_method = 'POST') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
        }
        if ($request_method = 'GET') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
        }
        proxy_pass          http://127.0.0.1:3000;
        proxy_http_version  1.1;
    }

    # NOTE: This is EXTERNAL_ROUTING, which you can set to .env file:
    location /express-helper {
        rewrite ^/express-helper/(.*)$ /$1 break;
        proxy_pass          http://127.0.0.1:5000;
    }

    # etc.
}
```

## See also original docs

- [https://developers.google.com/recaptcha/docs/verify#api_response](https://developers.google.com/recaptcha/docs/verify#api_response)
- [https://developers.google.com/recaptcha/docs/v3#site_verify_response](https://developers.google.com/recaptcha/docs/v3#site_verify_response)

## Access feature

### frontend-signin

⭕ 1. `./.env.dev` & `./.env.prod` _(**You can change this files in project root dir**, they will be copied to `./server-dist/.env`)_

```
EXPIRES_COOKIES_IN_DAYS=1

## ACCESS:
SP_SVYAZNOY_JWT_SECRET=<YOUR_STRING>
SP_ACCESS_PASSWORD=<YOUR_PASSWORD>
QR_SWAGGER_JWT_SECRET=<YOUR_QR_SWAGGER_JWT_SECRET>
QR_SWAGGER_ACCESS_PASSWORD=<YOUR_QR_SWAGGER_ACCESS_PASSWORD>

## RECATPCHA:
RECAPTCHAV3_SERVER_KEY=<YOUR_RECAPTCHAV3_SERVER_KEY>
RECAPTCHAV3_VERIFY_URL=https://www.google.com/recaptcha/api/siteverify

## PRODUCTION:
BASE_PROTOCOL_HOST=http://pravosleva.ru
EXTERNAL_ROUTING=/express-helper

## OPTIONAL:
# SUCCESS_ANYWAY=1
```

✅ 2. `./frontend.signin/.env` _(**Don't worry**, Will be updated by `yarn build:front:prod` script)_

```
SKIP_PREFLIGHT_CHECK=true
## Dev:
REACT_APP_API_URL=http://localhost:5000

## Prod:
# REACT_APP_API_URL=/express-helper
REACT_APP_EXTERNAL_ROUTING=/express-helper
```

```bash
yarn build:front
```

## add-access-space

⭕ 1. Add new key to **accessCode** `./src/server/routers/auth/cfg.js`.

_For example:_

```js
const accessCode = {
  OTSvyaznoyV1: 'sp.otapi.v1.svyaznoy.jwt',
  // TODO: New key-value
}

// etc.
```

✅ 2. Set new env to `./.env` _(**Don't worry**, Will be updated by `yarn quaint-express-env-copy:<dev|prod>` script)_

_For example:_

```bash
# etc.

SP_SVYAZNOY_JWT_SECRET=random_string
SP_ACCESS_PASSWORD=admin
## TODO: New settings

# etc.
```

⭕ 3. Add new key to redirect setyings object `./src/server/routers/auth/cfg.js`.

_For example:_

```js
// etc.

module.exports = {
  accessCode,
  redirect: {
    [accessCode.OTSvyaznoyV1]: {
      jwtSecret: SP_SVYAZNOY_JWT_SECRET,
      uiName: 'Online Trade-in API (Svyaznoy)',
      accessPassword: SP_ACCESS_PASSWORD,
      hash: md5Hash(accessCode.OTSvyaznoyV1),

      // NOTE: Последний слеш обязательно!
      logged: `${EXTERNAL_ROUTING}/smartprice/otapi/v1/svyaznoy/swagger/`,
      unlogged: `${EXTERNAL_ROUTING}/auth/signin/`,
    },
    // TODO: New object
  },
}
```

⭕ 4. Add **redirectIfLoggedMw** middleware for redirecting to `./src/server/routers/auth/index.js` _for signin page route (or other unlogged route)._

_For example:_

```js
// etc.

authApi.use(
  '/signin',
  redirectIfLoggedMw(SP_SVYAZNOY_JWT_SECRET, accessCode.OTSvyaznoyV1),
  // TODO: Other middlewares...
  express.static(path.join(__dirname, './pages/signin/build'))
)

// etc.
```

⭕ 5. Add new route for static with **redirectIfUnloggedMw** middleware _where you need it._

_For example: Additional access for specific swagger as static route_

```js
// 4. Online Trade-in API imitation
// 4.1 Docs for partners
smartpriceApi.use(
  '/otapi/v1/:partnerName/swagger',
  function (req, res, next) {
    switch (req.params.partnerName) {
      // 4.1.1 Access tool sample
      case EPartner.Svyaznoy:
        redirectIfUnloggedMw(redirect[EAccessCode.OTSvyaznoyV1].jwtSecret, EAccessCode.OTSvyaznoyV1)(req, res, next)
        break
      // TODO: Other partner...
      default:
        res.status(500).json({ ok: false, message: '🖕 SORRY 🖕', _originalBody: { params: req.params } })
        break
    }
  },
  // redirectIfUnloggedMw(redirect[EAccessCode.OTSvyaznoyV1].jwtSecret, EAccessCode.OTSvyaznoyV1),
  otApiV1Swagger
)
```
