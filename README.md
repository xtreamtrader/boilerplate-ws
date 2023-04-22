# Boilerplate Websocket Server

[![Build Status][ci-img]][ci]
[![Coverage Status][coveralls-img]][coveralls]

[ci-img]:          https://github.com/lagden/boilerplate-ws/actions/workflows/nodejs.yml/badge.svg
[ci]:              https://github.com/lagden/boilerplate-ws/actions/workflows/nodejs.yml
[coveralls-img]:   https://coveralls.io/repos/github/lagden/boilerplate-ws/badge.svg?branch=main
[coveralls]:       https://coveralls.io/github/lagden/boilerplate-ws?branch=main


Boilerplate para desenvolvimento de uma aplicação utilizando Svelte.

- [Instalação](#instalação)
- [Como utilizar](#como-utilizar)
    - [Teste](#teste)
    - [Sprites](#sprites)
- [Imagem (docker)](#imagem-docker)
- [Deploy (docker)](#deploy-docker)
- [License](#license)


## Instalação

Utilize `@tadashi/boilerplate-create` para iniciar o projeto.

```
npm i -g @tadashi/boilerplate-create
boilerplate-create
```

ou

```
npx --yes @tadashi/boilerplate-create
```

E siga as instruções do prompt.


## Como utilizar

Após finalizado o `scaffolding` do projeto, instale os pacotes.

```shell
bin/node/zera -m pnpm
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

Via **Docker**, caso seja instalado um novo pacote, é necessário fazer o `build` da imagem novamente.  
Pare o container (`bin/docker/stop` ou `control + c`) e rode novamente passando o parâmetro `-b`:

```shell
bin/docker/start -b
```


### Teste

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

Verifique as suas variáveis de ambiente `.conf/*.sh`.  
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

```
wscat -c 'ws://[::1]:5000/?jwt=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiaWQiOiI2MjcxYmFiNWY2N2U5Y2NkNDkwMzNhYmIifQ.hmoUE_vayFKMKGz0v9iPLfIuneklDkL_qnD2n5QVKrYXmUwUqoJlSKGgafXIQGlyFxNZTucE8z8qdSRHZ-IXRQ'
Connected (press CTRL+C to quit)
> {"action": "message", "message": "Olá"}
```

Em outro shell:

```
wscat -c 'ws://[::1]:5000/?jwt=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsYmVydG8gUm9iZXJ0byIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImlkIjoiNjI3MWJhYjVmNjdlOWNjZDQ5MDMzYWJjIn0.CEoDPZn3IRrP4Cob6V_C41FxiqZoNkI6maN6c9tvfMrzw8gB5WWxBSiGdUWJ9HF4drPJANgEvfHKL8C0gNeuxA'
Connected (press CTRL+C to quit)
< {"action":"message","message":"Olá"}
> {"action": "message", "message": "Mundo"}
```


## License

MIT © [Thiago Lagden](https://github.com/lagden)
