#!/bin/bash

ENVIRONMENT=$1

case $ENVIRONMENT in
  dev)
    export COMPOSE_FILE="docker-compose.yml:docker-compose.dev.yml"
    ;;
  prod)
    export COMPOSE_FILE="docker-compose.yml:docker-compose.prod.yml"
		;;
  *)
    echo "El comando 'compose.sh $ENVIRONMENT' no existe."
    echo
    echo "Esta es una lista de comandos que podés ejecutar con este helper"
    echo "dev              => levanta todos los servicios necesarios para el entorno de desarrollo"
    echo "prod             => buildea e inicia los servicios en modo producción"
    exit 1
    ;;
esac

docker-compose "${@:2}"
