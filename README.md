# Introduction to Hacking and Security in Smart Contracts

Repository of the course (in Spanish) "Introducción a Hacking y Seguridad en Smart Contracts", given on August 17th and 20th, 2021 by @tinchoabbate for the Computer Society ITBA. Available on [Youtube](https://www.youtube.com/watch?v=sqjHodAj5Xc).

Tests and contracts have been updated according to the excercises proposed by the author in the video.

## Install

First of all, you must have installed [NodeJS](https://nodejs.org/en/). Then:

1. Download this repository.
2. In the root directory, execute the `npm install` command in order to install the required dependencies.

## Use

Once dependencies are installed, you can execute each test file (located in the `test` folder) with the command

> $ npx hardhat test test/path/to/file.js




Description in Spanish by the author:


# Introducción a Hacking y Seguridad en Smart Contracts

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Repositorio del curso "Introducción a Hacking y Seguridad en Smart Contracts", dictado el 17 y 20 de Agosto del 2021.

## Tabla de Contenidos

- [Requisitos preliminares](#Requisitos-preliminares)
- [Instalar](#Instalar)
- [Uso](#Uso)
- [Ejercicios](#Ejercicios)
- [Recursos adicionales](#Recursos-adicionales)
- [Disclaimer](#Disclaimer)

## Requisitos preliminares

En este curso introductorio voy a asumir que ya tenés conocimientos básicos en Ethereum, y de programación y testing de smart contracts en Solidity.

Si ese no es tu caso, entonces te recomiendo primero empezar [por acá](https://intro-ethereum.marto.lol/).

## Instalar

Primero que nada, debés tener instalado [NodeJS](https://nodejs.org/en/). Luego:

1. Descargá este repositorio.
2. En el directorio raíz, ejecutá el comando `npm install` o `yarn` para instalar las dependencias.

## Uso

Una vez instaladas las dependencias, podés ejecutar cada archivo de test (en la carpeta `test`) con el comando

> $ yarn hardhat test test/path/al/archivo.js

o 

> $ npx hardhat test test/path/al/archivo.js

## Ejercicios

El repositorio está dividido por ejercicios. Cada ejercicio consta de un conjunto de archivos Solidity (ubicados en las respectivas carpeta `contracts/ejercicio-x`) y JavaScript (ubicados en las respectivas carpetas `test/ejercicio-x`).

Los archivos Solidity son contratos con alguna vulnerabilidad a ser explotada. Los archivos JavaScript son los tests que se encargan de  explotar esas vulnerabilidades.

Al resolver todos los ejercicios, vas a haber aprendido sobre cómo identificar, atacar y solucionar algunos tipos de vulnerabilidades como:

- Fallas en controles de acceso
- Operaciones matemáticas inseguras
- Denegación de Servicio
- Reentrancy

Además, en el proceso, vas a aprender sobre:

- Cómo hacer revisión de código Solidity.
- Cómo interactuar con contratos desde tus tests.
- Cómo hacer debugging.
- Patrones comunes como Ownable, Safe Math y Check-Effects-interactions.
- Peculiaridades de funciones de Solidity.
- La importancia del gas y su correcto uso.
- EOAs vs. Contratos.
- Llamadas entre contratos, tanto a funciones como para enviar ETH.
- Primitivas de DeFi, como los flash loans.

## Recursos adicionales

Para más información, links y material educacional visitá [mi sitio web](https://www.notonlyowner.com/learn/intro-seguridad-hacking-ethereum).

## Disclaimer

Todo el código en este repositorio se incluye con fines educacionales. Muchos (sino todos) los contratos incluidos aquí tienen vulnerabilidades de seguridad.

NO USAR EN PRODUCCIÓN.
