# Black Mamba - `1.3.2`

Desktop application for [namebase.io](https://namebase.io)!

|                                                Library | Version |
| -----------------------------------------------------: | :-----: |
|                [Electron](https://www.electronjs.org/) |  9.0.0  |
|                     [Vue 2](https://vuejs.org/v2/api/) | 2.6.11  |
|                          [Quasar](https://quasar.dev/) |  1.0.0  |
|   [CoinCapJS](https://github.com/ImSeaWorld/coincapjs) |  1.0.5  |
| [NamebaseJS](https://github.com/ImSeaWorld/namebasejs) |  1.1.0  |

Download latest version here: https://github.com/ImSeaWorld/Black-Mamba/releases/

At this point, this is no replacement for namebase. Functionality can be added to get it up to snuff but I mainly use it to look at how much I've spent and how much I have. This project has gotten bigger than itself and I'm open to PRs that add more functionality.

### List of things to do

-   Rework `Auctions` load handling. Right now it refreshing the whole collection.
-   Rework `Auctions` table handling, `Marketplace`->`Power Search` is what it should look like.
-   Add last purchase price of domain in `My Domains`, only getting final auction price.
-   Add bidding to `Auctions` ([ref](https://github.com/ImSeaWorld/namebasejs/blob/866a37f0279d34a52a1aa45afe1492d91fedc8a4/namebasejs/index.js#L423))
-   Add failover for CoinCap

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
