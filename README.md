# ONG Esperança

Site institucional estático para apresentar a missão e os projetos da ONG Esperança, facilitar o contato e permitir o cadastro de pessoas interessadas em contribuir.

## Funcionalidades

- Páginas de início, projetos sociais, contato e cadastro.
- Navegação responsiva com menu hambúrguer e submenu de projetos.
- Navegação SPA entre páginas internas, mantendo o cabeçalho e o rodapé.
- Cartões de projetos gerados a partir de dados JSON e de um elemento HTML `<template>`.
- Validação de formulários no navegador, com mensagens por campo.
- Preferência de contribuição guardada em `localStorage`; dados pessoais não são persistidos.
- Gráfico de impacto com Chart.js carregado sob demanda por CDN. Os números continuam visíveis em texto se a biblioteca não carregar.

## Tecnologias

- HTML5 semântico para estrutura e formulários.
- CSS3 com Grid, Flexbox, breakpoints responsivos e tokens de design.
- JavaScript puro para roteamento SPA, manipulação do DOM, validação, templates e preferências locais.
- Chart.js 4.5.0 via jsDelivr CDN para o gráfico da página inicial.

## Estrutura

```text
ong-website/
├── index.html
├── projetos.html
├── contato.html
├── cadastro.html
├── README.md
└── assets/
    ├── css/style.css
    ├── images/
    └── js/
        ├── navigation.js
        ├── spa-router.js
        ├── project-templates.js
        ├── form-interactions.js
        ├── local-preferences.js
        └── impact-chart.js
```

Os arquivos HTML permanecem na raiz. CSS, imagens e JavaScript ficam organizados em subpastas de `assets/`.

## Pré-requisitos

- Git para obter o código-fonte.
- Python 3 para iniciar um servidor HTTP local, ou outro servidor estático equivalente.
- Navegador moderno com suporte a `fetch`, History API, `localStorage` e Canvas.
- Acesso à internet para carregar Chart.js pelo CDN. Sem rede, o restante do site continua acessível e os indicadores permanecem em texto.

Não é necessário instalar Node.js, executar `npm install` ou compilar o projeto.

## Execução local

1. Clone o repositório e entre na pasta:

   ```powershell
   git clone https://github.com/felps-onf/ong-website.git
   Set-Location ong-website
   ```

2. Inicie o servidor estático na raiz do projeto:

   ```powershell
   py -m http.server 8000
   ```

   Se o comando `py` não estiver disponível, use `python -m http.server 8000`.

3. Abra `http://localhost:8000/index.html` no navegador. O servidor é necessário porque o roteador SPA carrega páginas com `fetch`; abrir o HTML diretamente por `file://` não oferece esse comportamento.

4. Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Build e testes

O projeto não possui etapa de build nem suíte automatizada configurada: os arquivos estáticos são servidos diretamente. A verificação manual recomendada inclui testar os links e os botões do menu em desktop e celular, navegar entre páginas e usar Voltar/Avançar, enviar formulários com campos vazios e formatos incorretos, recarregar o cadastro para conferir a preferência salva e abrir a página inicial com e sem acesso à CDN.

## Versionamento e colaboração

O fluxo segue GitFlow: `master` representa a linha estável, `develop` recebe integrações e `feature/*` isola funcionalidades. A branch `feature/form-validation` foi criada para esse escopo; no estado atual da auditoria ela existe localmente, enquanto `master` e `develop` estão publicadas no remoto. As branches foram inicialmente criadas a partir do mesmo snapshot, portanto alterações exclusivas surgem quando novos commits são realizados nelas.

Para versões futuras, o projeto adota Semantic Versioning (`MAJOR.MINOR.PATCH`): mudança incompatível incrementa `MAJOR`, funcionalidade compatível incrementa `MINOR` e correção compatível incrementa `PATCH`. Ainda não há tags de release. As mensagens históricas incluem o prefixo `add:`; para novos commits recomenda-se Conventional Commits, por exemplo `feat(form): validar campos obrigatórios` e `fix(router): preservar a página quando uma rota falhar`.

Issues, milestones e pull requests ainda não têm registros neste repositório. Para próximas contribuições, recomenda-se associar cada tarefa a uma Issue e milestone, abrir um PR da branch de feature para `develop` e promover para `master` somente após revisão e validação.