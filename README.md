# Wollok Web Client

Este es un proyecto _en construcción_ para desarrollar herramientas web del lenguaje [Wollok](https://www.wollok.org/). Usa la implementación de [Wollok-TS](https://github.com/uqbar-project/wollok-ts) como core del lenguaje.

Actualmente cuenta con las siguientes implementaciones:

- **Game** Una interfaz para correr juegos hechos con Wollok Game.
- **Debugger** Una forma de correr tests y poder ejecutar _paso a paso_ viendo el estado de la WVM.
- **Worksheet** Un psudo IDE con un editor, consola y diagrama dinámico.

### Dónde ver el proyecto andando

- Para correr un programa Wollok: https://server.wollok.org
- Probar un Wollok Game desde la web (en construcción): https://server.wollok.org/game  
  - Por ejemplo: https://game.wollok.org/game?github=wollok/losVengadoresGame

### ¿Cómo levantar la app?

En primer lugar, asegurarse de tener instalado node >= 11.

Luego hay que bajar las dependencias con el comando:

```
npm install
```

La app está desarrollada sobre [ReactJS](https://reactjs.org/) y , como buen proyecto `npm`, para levantarla hay que ejecutar el comando

```
npm start
```

> ¡Atención! Para usar Wollok Game y poder clonarse proyectos desde github es necesario levantar además un proxy por _CORS_.
> Para eso, ejecutar desde otra consola
>
> ```
> npm run cors
> ```
>
> El server se levantará por default en el puerto `9999`

### Alternativa usando Docker

Simplemente ejecutar

```
docker-compose up
```

Y eso pone en funcionamiento todos los servicios necesarios.

Esta aplicación ha sido desarrollada usando

- Docker version 19.03.11, build dd360c7
- docker-compose version 1.25.5, build unknown
