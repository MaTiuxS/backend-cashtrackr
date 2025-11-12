# 💰 CashTrackr — Control de Gastos y Presupuestos

**CashTrackr** es una API REST desarrollada en **Node.js + TypeScript**, basada en el patrón **MVC**, para la gestión de **gastos, presupuestos y cuentas de usuario**.  
Está construida con **Express**, **Sequelize**, y validada mediante **Express Validator**.  
Incluye un sistema de autenticación con **JWT**, validación robusta y pruebas automáticas con **Jest**.

---

## 🧱 Tecnologías principales

| Tipo | Herramienta |
|------|--------------|
| Lenguaje | TypeScript |
| Framework | Express.js |
| ORM | Sequelize / Sequelize-Typescript |
| Base de datos | PostgreSQL |
| Validación | express-validator |
| Autenticación | JWT |
| Testing | Jest + Supertest |
| Entorno | dotenv |
| Arquitectura | MVC (Models - Views - Controllers) |
| Servidor de desarrollo | Nodemon |
| Gestor de paquetes | pnpm |

---

## 📂 Estructura del proyecto

src/

├── config/ # Configuración general (BD, variables de entorno, etc.)

├── controllers/ # Lógica de negocio y controladores de rutas

├── data/ # (opcional) scripts o datos iniciales

├── emails/ # Plantillas y envío de correos (confirmación, recuperación)

├── middleware/ # Middlewares personalizados (auth, errores, etc.)

├── models/ # Modelos Sequelize (User, Expense, Budget, etc.)

├── routes/ # Definición de rutas y endpoints

├── test/ # Tests unitarios e integrales con Jest + Supertest

├── utils/ # Funciones utilitarias (helpers)

├── validator/ # Validaciones de entrada con express-validator

├── index.ts # Punto de entrada principal

└── server.ts # Configuración y arranque del servidor Express


## ⚙️ Instalación

1. **Clonar el repositorio**
   ```
   git clone https://github.com/tu-usuario/cashtrackr.git
   cd cashtrackr
    ```

2. **Instalar dependencias**
   ```
   pnpm install
    ```

3. **Ejecutar en desarrollo**
    ```
    pnpm dev
    ```
4. **Ejecución de tests**
    ```
    pnpm test
    ```


🧩 Características principales

* ✅ Registro y autenticación de usuarios con JWT
* ✅ Confirmación de cuenta vía token
* ✅ Validación avanzada con express-validator
* ✅ CRUD de gastos y presupuestos
* ✅ Middleware de autenticación y control de acceso
* ✅ Arquitectura escalable basada en MVC
* ✅ Tipado fuerte con TypeScript
* ✅ Scripts de mantenimiento (limpiar base de datos, reset de datos, etc.)
* ✅ Pruebas integradas con Jest y Supertest