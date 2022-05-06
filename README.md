# Boilerplate Websocket Server

[![Build Status][ci-img]][ci]
[![Coverage Status][coveralls-img]][coveralls]

[ci-img]:          https://github.com/lagden/boilerplate-ws/actions/workflows/nodejs.yml/badge.svg
[ci]:              https://github.com/lagden/boilerplate-ws/actions/workflows/nodejs.yml
[coveralls-img]:   https://coveralls.io/repos/github/lagden/boilerplate-ws/badge.svg?branch=master
[coveralls]:       https://coveralls.io/github/lagden/boilerplate-ws?branch=master


Boilerplate para desenvolvimento de Websocket.

- [Instalação](#instalação)
- [Como utilizar](#como-utilizar)
    - [watch](#watch)
        - [entr](#entr)
        - [nodemon](#nodemon)
    - [teste](#teste)
- [Imagem](#imagem)
- [Deploy](#deploy)
- [Exemplo](#exemplo)
- [Middlewares](#middlewares)
- [License](#license)


## Instalação

⚠️ **Importante**

Instale o [Yarn](https://yarnpkg.com/getting-started/install).

```
npm install -g yarn
yarn set version stable
```

---

Use o [degit](https://github.com/Rich-Harris/degit) para fazer o `scaffolding` do projeto.

Existem algumas dependências.

- [bin](https://github.com/lagden/boilerplate-bin)
- [envs](https://github.com/lagden/boilerplate-envs)
- [docker](https://github.com/lagden/boilerplate-docker-nodejs) (opcional)


**Exemplo:**

```shell
yarn dlx degit lagden/boilerplate-ws#master projeto
cd projeto
yarn dlx degit lagden/boilerplate-bin/files#main bin
yarn dlx degit lagden/boilerplate-eslint/files/backend/.eslintrc.yml#main ./ --force
yarn dlx degit lagden/boilerplate-envs/files#main ./ --force
yarn dlx degit lagden/boilerplate-docker-nodejs/files#main ./ --force
```


## Como utilizar

Após finalizado o `scaffolding` do projeto, instale os pacotes.

```shell
bin/node/zera -y
```

Feito isso, o projeto está pronto para funcionar.

Para rodar **local**, utilize:

```shell
bin/local/start
```

E via **docker**, utilize:

```shell
bin/docker/start
```

⚠️ **Ressalvas**

No **docker**, caso seja instalado um novo pacote, é necessário fazer o `build` da imagem novamente.  
Pare o container (`bin/docker/stop` ou `control + c`) e rode novamente passando o parâmetro `-b`:

```shell
bin/docker/start -b
```


### watch

O **watch** reinicia a aplicação caso ocorra alguma alteração.  
Rodando via **docker** isso ocorre por padrão, mas **local** é necessário fazer algumas instalações e configurações.


#### entr

Se estiver rodando em **BSD** ou **Mac OS** ou **Linux**, basta instalar o [entr](https://github.com/eradman/entr) e executar:

```shell
bin/local/start -w
```


#### nodemon

Como o [entr](https://github.com/eradman/entr) não roda no **Windows**, existe uma solução alternativa.

Utilize o arquivo `.env-local` na raiz do projeto e insira o código abaixo:

```
WATCH_LOCAL_CMD="yarn dlx nodemon -e js,json --watch server --exec npm start"
```

---

Então, execute o comando:

```shell
bin/local/start -w
```


### teste

Para executar os testes.

**local:**

```shell
bin/local/test
```

**docker:**

```shell
bin/docker/test
```


## Imagem

Crie os arquivos de usuário e senha do **registry** que serão utilizados para fazer o `push` da imagem.

```shell
echo 'username' > .registry-user
echo 'password' > .registry-passwd
```

Verifique as suas variáveis de ambiente `.env-*`.  
E para fazer o `push` da imagem de sua aplicação, execute:

```shell
bin/docker/image -e production
```


## Deploy

Para executar o **deploy** é necessário alguns binários instalados:

- **envsubst** by Bruno Haible
- **rsync** by Andrew Tridgell, Wayne Davison and others

O fluxo do sistema de **deploy** é simples:

1. Carrega as variáveis de ambiente (`staging` ou `production`)
2. Executa o script `bin/docker/image` (se passado o parâmetro `-i` esse processo é ignorado)
3. Cria o arquivo `docker-compose-{VERSION}.yml` utilizando o **envsubst**
4. Envia os arquivos para o servidor via **rsync**
5. Executa o `docker stack deploy` no servidor

```shell
bin/docker/deploy -e production
```


## Exemplo

Utilize o [wscat](https://www.npmjs.com/package/wscat).

```shell
npm i -g wscat
```

Abra um shell e execute:

```shell
wscat -c 'ws://[::1]:5000/?jwt=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiaWQiOiI2MjcxYmFiNWY2N2U5Y2NkNDkwMzNhYmIifQ.hmoUE_vayFKMKGz0v9iPLfIuneklDkL_qnD2n5QVKrYXmUwUqoJlSKGgafXIQGlyFxNZTucE8z8qdSRHZ-IXRQ'
Connected (press CTRL+C to quit)
> {"action": "message", "message": "Olá"}
```

Em outro shell:

```shell
wscat -c 'ws://[::1]:5000/?jwt=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsYmVydG8gUm9iZXJ0byIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImlkIjoiNjI3MWJhYjVmNjdlOWNjZDQ5MDMzYWJjIn0.CEoDPZn3IRrP4Cob6V_C41FxiqZoNkI6maN6c9tvfMrzw8gB5WWxBSiGdUWJ9HF4drPJANgEvfHKL8C0gNeuxA'
Connected (press CTRL+C to quit)
< {"action":"message","message":"Olá"}
> {"action": "message", "message": "Mundo"}
```


## License

MIT © [Thiago Lagden](https://github.com/lagden)
