# Wollok Web Client

Este es un proyecto _en construcción_ para desarrollar herramientas web del lenguaje [Wollok](https://www.wollok.org/). Usa la implementación de [Wollok-TS](https://github.com/uqbar-project/wollok-ts) como core del lenguaje.

Actualmente cuenta con las siguientes implementaciones:

- **Game** Una interfaz para correr juegos hechos con Wollok Game.
- **Debugger** Una forma de correr tests y poder ejecutar _paso a paso_ viendo el estado de la WVM.
- **Worksheet** Un pseudo IDE con un editor, consola y diagrama dinámico.

## Dónde ver el proyecto andando

El proyecto se encuentra deployado en `https://server.wollok.org` en donde se encuentra:

- **Worksheet**: https://game.wollok.org/worksheet
- **Debugger**: https://game.wollok.org/debugger
- **Game**: Probar un Wollok Game desde la web: https://server.wollok.org/game  
  - Por ejemplo: https://game.wollok.org/game?git=https://github.com/wollok/elJuegoDePepita


## ¿Cómo levantar la app?

En primer lugar, asegurarse de tener instalado node `>= 11 && < 15`.

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
> El server se levantará por default en la ruta `http://localhost:9999`
>
> Para configurar la ruta del proxy hay que cambiar la variable de entorno `REACT_APP_PROXY_URL`. Por ejemplo para levantar la app con una ruta de proxy customizada se puede hacer
> 
> ```
> # Linux
> REACT_APP_PROXY_URL=http://localhost:8787 npm start
> 
> # Windows
> set "REACT_APP_PROXY_URL=http://localhost:8787" &&  npm start
> ```

### Haciendo un Deploy para producción

Para tener una version lista para deployar en su servidor querido es necesario ejecutar:

```
REACT_APP_PROXY_URL=https://game.wollok.org/content npm run build
```

Eso va a generar una version estática en el directorio build.

## Alternativa usando Docker

### TL;DR

Simplemente ejecutar

```
./compose.sh dev up
```

Y eso pone en funcionamiento todos los servicios necesarios.

Esta aplicación ha sido desarrollada usando

- Docker version 19.03.11, build dd360c7
- docker-compose version 1.25.5, build unknown

### Quiero entender qué pasa

Toda la configuración para levantar los servicios docker, está en los archivos `docker-compose*.yml`.
El script `compose` es simplemente un helper para elegir los archivos adecuados, que siempre son dos (uno de base y otro específico del ambiente dev o prod según corresponda).

Ejecutar

```
./compose.sh prod up
```

Va a levantar los mismos servicios pero en modo producción, corriendo el build de react-cra en modo optimizado y poniendo el build resultante en una imagen donde la sirve un nginx.
Usando este comando es posible levantarlo localmente en las mismas exactas condiciones que se ejecutará en producción (aunque para desarrollar sería muy incómodo).
