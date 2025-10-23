PRINTER MANAGER es una aplicación desarrollada con React (frontend) y Node.js (backend) que permite monitorear y administrar impresoras en red.
El sistema utiliza la API SNMP para obtener información en tiempo real sobre los niveles de tóner, detectar cambios de cartuchos, y mantener un contador de tóneres de reserva.
Además, el programa realiza comprobaciones de conectividad mediante ping para mostrar el estado de red de cada impresora.

Aunque el proyecto fue diseñado principalmente para impresoras Ricoh, también es compatible con modelos HP y otras marcas que soporten SNMP.
El objetivo principal es centralizar el monitoreo y gestión del estado de las impresoras, optimizando el control del suministro de tóner y el mantenimiento preventivo.

## Requisitos previos

- Tener instalado Node.js (versión recomendada 16+)
- Tener instalado PostgreSQL y PgAdmin
- Tener configurado `npm` (Node Package Manager)

## Pasos para ejecutar

1. **Instalar dependencias**

   En la raíz del proyecto, ejecuta:  
   npm install

2. **Restaurar base de datos**

-Abrir PgAdmin

-Seleccionar la opción para restaurar la base de datos, el backup de base de datos esta en la carpeta database/init.sql

-Elegir el archivo .sql en formato Plain para restaurar

3. **Iniciar el backend**

Abrir una terminal y navegar a la carpeta backend
Ejecutar:
npm start

4. **Iniciar el frontend**

En otra terminal, estando en la raíz del proyecto, ejecutar:
npm start
