# Puente - Financial Market Tracking & Portfolio Management

Aplicación web para seguimiento de mercados financieros y gestión de carteras de inversión.

## Descripción de la Solución

Puente es una plataforma que permite a los usuarios:
- Monitorear instrumentos financieros (acciones y criptomonedas)
- Gestionar carteras de inversión
- Realizar seguimiento de favoritos
- Acceder a datos en tiempo real del mercado

La solución está dividida en dos partes principales:
- Backend: API RESTful desarrollada en Node.js con Express
- Frontend: Aplicación web desarrollada en React

### Características Principales

- **Monitoreo de Mercado**
  - Listado de 20 instrumentos principales (10 acciones)
  - Precios actuales, variación diaria y semanal
  - Actualización automática cada 5 minutos
  - Búsqueda por símbolo o nombre
  - Vista detallada con datos clave

- **Seguridad**
  - Autenticación JWT
  - Almacenamiento seguro de contraseñas (hash + salt)
  - Control de acceso basado en roles

## Requisitos del Sistema

### Backend
- Node.js v14 o superior
- PostgreSQL v12 o superior
- npm v6 o superior
- Variables de entorno configuradas:
  - `DATABASE_URL`: URL de conexión a PostgreSQL
  - `JWT_SECRET`: Clave secreta para JWT
  - `ALPHA_VANTAGE_API_KEY`: API key de Alpha Vantage
  - `COINGECKO_API_KEY`: API key de CoinGecko

### Frontend
- Node.js v14 o superior
- npm v6 o superior
- Variables de entorno configuradas:
  - `REACT_APP_API_URL`: URL del backend

## Instrucciones de Instalación

### 1. Clonar el Repositorio

- Al bajar el repositorio, ya estaria bajando el frontend (dentro de la carpeta client)

### 2. Configurar el Backend

- Al bajar el repositorio, ya estaria bajando el backend (dentro de la carpeta server)

Crear archivo `.env` en la raíz del backend:
```env
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/puente
JWT_SECRET=tu_clave_secreta
ALPHA_VANTAGE_API_KEY=tu_api_key
COINGECKO_API_KEY=tu_api_key
```

### 3. Configurar la Base de Datos
```bash
npm run init-db
```

### 4. Configurar el Frontend
```bash
cd ../client
npm install
```

Crear archivo `.env` en la raíz del frontend:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 5. Ejecutar la Aplicación

En una terminal, iniciar el backend:
```bash
cd server
npm start
```

En otra terminal, iniciar el frontend:
```bash
cd client
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api-docs

## Guía de Uso Básico

### Registro y Autenticación
1. Crear una cuenta en la página de registro
2. Iniciar sesión con email y contraseña
3. Acceder al dashboard principal

### Monitoreo de Mercado
1. Ver lista de instrumentos en la página principal
2. Usar la barra de búsqueda para encontrar instrumentos específicos
3. Hacer clic en un instrumento para ver detalles
4. Marcar instrumentos como favoritos

## Decisiones Técnicas y Trade-offs

### Arquitectura
- **Backend**: API RESTful con Node.js/Express
  - *Ventajas*: Escalabilidad, mantenibilidad, separación de responsabilidades
  - *Trade-off*: Mayor complejidad inicial vs. monolitos

- **Base de Datos**: PostgreSQL
  - *Ventajas*: ACID, soporte para JSON, robustez
  - *Trade-off*: Mayor complejidad de configuración vs. NoSQL

### Seguridad
- **Autenticación**: JWT + Refresh Tokens
  - *Ventajas*: Stateless, escalable, seguro
  - *Trade-off*: Mayor complejidad vs. sesiones tradicionales

- **Contraseñas**: bcrypt con salt
  - *Ventajas*: Seguridad probada, resistente a ataques
  - *Trade-off*: Mayor uso de CPU vs. hashes simples

### APIs Externas
- **Alpha Vantage**: Datos de acciones
  - *Ventajas*: Datos confiables, actualizados
  - *Trade-off*: Límites de API vs. datos en tiempo real

- **CoinGecko**: Datos de criptomonedas
  - *Ventajas*: Amplia cobertura, API gratuita
  - *Trade-off*: Límites de tasa vs. datos en tiempo real

### Caché
- **Node-cache**: Caché en memoria
  - *Ventajas*: Rendimiento, reducción de llamadas API
  - *Trade-off*: Consumo de memoria vs. Redis

### Frontend
- **React**: Biblioteca de UI
  - *Ventajas*: Componentización, rendimiento, comunidad
  - *Trade-off*: Curva de aprendizaje vs. frameworks más simples

### Screenshots
- En la folder Screenshots hay algunas capturas de pantalla de la aplicación

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 
