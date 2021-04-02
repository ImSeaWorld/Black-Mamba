# Black Mamba - `1.3.2`

Desktop application for [namebase.io](https://namebase.io).
Written in [NodeJS](https://nodejs.dev/) with [Electron](https://www.electronjs.org/) and [Vue 2](https://vuejs.org/v2/api/) + [Quasar](https://quasar.dev/) for flavor.
Crypto Price API: [CoinCap.io](https://coincap.io) through [coincapjs](https://github.com/ImSeaWorld/coincapjs)

Windows build is coming soon. I need to host it since it's massive!

At this point, this is no replacement for namebase. Functionality can be added to get it up to snuff but I mainly use it to look at how much I've spent and how much I have. This project has gotten bigger than itself and I'm open to PRs that add more functionality.

#### Login Page
![Login Page](https://user-images.githubusercontent.com/20188588/113406263-08e06800-9360-11eb-9858-586becacd901.png)

#### Main Page
![Main Page](https://user-images.githubusercontent.com/20188588/113403976-4e9b3180-935c-11eb-90ce-3545c7ff3e71.png)

#### SPA Builder

Luckily this was shown live and you can see it here: https://www.youtube.com/watch?v=P-W7VIPtiBM

![SPA Builder](https://user-images.githubusercontent.com/20188588/113405280-6e335980-935e-11eb-99c3-2ff161272f23.png)

Just a note here, importing was added in a haste, so output will be `.html.json` wherever you output your SPA.

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run electron:serve
```

### Compiles and minifies for production

```
npm run electron:build
```
