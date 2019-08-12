# How to add SSL

## Using mkcert

Generate a local certificare using https://github.com/FiloSottile/mkcert

```
brew install mkcert
brew install nss # if you use Firefox

mkcert -install

cd src/ssl

mkcert local.dev localhost
```

This will generate 2 files in the ssl folder:

```
local.dev+1-key.pem
local.dev+1.pem
```

Add the names into your ENV vars, either use the env file or manually and run the server.

## Alternative to mkcert

Thanks to: https://serverfault.com/a/845788/50489
Works on a MAC for sure, need to check Windows.

```
openssl req \
    -newkey rsa:2048 \
    -x509 \
    -nodes \
    -keyout server.key \
    -new \
    -out server.crt \
    -subj /CN=localhost \
    -reqexts SAN \
    -extensions SAN \
    -config <(cat /System/Library/OpenSSL/openssl.cnf \
        <(printf '[SAN]\nsubjectAltName=DNS:localhost')) \
    -sha256 \
    -days 3650
```
