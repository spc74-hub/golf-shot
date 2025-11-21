# Guía para Mover y Subir tu Proyecto a GitHub

¡Hola! Sigue estos pasos para llevarte tu aplicación de Golf a tu carpeta personal y subirla a la nube.

## Paso 1: Mover el Proyecto
1.  En la ventana del Finder que se ha abierto, verás un archivo llamado **`golf-tracker-source.zip`**.
2.  Copia ese archivo `.zip` y pégalo en la carpeta de tu ordenador donde quieras guardar el proyecto (por ejemplo, en `Documentos/Proyectos`).
3.  Haz doble clic en el `.zip` para descomprimirlo. Se creará una carpeta con todo el código.

## Paso 2: Preparar GitHub
1.  Entra en [GitHub.com](https://github.com) e inicia sesión.
2.  Haz clic en el botón **+** (arriba a la derecha) y selecciona **"New repository"**.
3.  Ponle un nombre (ej: `golf-tracker`).
4.  Déjalo en **Public** o **Private** (como prefieras).
5.  **IMPORTANTE**: No marques ninguna casilla de "Initialize this repository with..." (ni README, ni .gitignore). Queremos un repositorio vacío.
6.  Dale a **"Create repository"**.
7.  Copia la dirección HTTPS que te darán (será algo como `https://github.com/TU_USUARIO/golf-tracker.git`).

## Paso 3: Subir el Código (Desde la Terminal)
Como no eres programador, la forma más segura es usar la Terminal de tu Mac, pero te daré los comandos exactos.

1.  Abre la aplicación **Terminal** en tu Mac (búscala con Spotlight 🔍).
2.  Escribe `cd ` (con un espacio al final) y arrastra la carpeta que descomprimiste en el Paso 1 dentro de la ventana de la Terminal. Se escribirá la ruta sola. Pulsa **Enter**.
3.  Copia y pega este bloque de comandos (todo junto) y pulsa **Enter**:

```bash
git init
git add .
git commit -m "Primera subida: Golf Tracker App"
git branch -M main
git remote add origin PEGA_AQUI_TU_LINK_DE_GITHUB
git push -u origin main
```
*(Recuerda cambiar `PEGA_AQUI_TU_LINK_DE_GITHUB` por el enlace que copiaste en el Paso 2)*.

## Paso 4: Instalar Dependencias (Para que funcione)
Para ejecutar la app en tu nueva ubicación, necesitarás instalar las "piezas" que hemos quitado para que el archivo pese menos.

1.  En la misma Terminal, escribe:
    ```bash
    npm install
    ```
    (Pulsa Enter y espera a que termine).
2.  Para arrancar la app, escribe:
    ```bash
    npm run dev
    ```
3.  ¡Listo! Abre `http://localhost:3000` en tu navegador.
