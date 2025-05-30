# Imagen base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios primero (mejora cacheado)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el resto del código
COPY . .

# Construir el proyecto Next.js
RUN npm run build

# Expone el puerto por defecto que Next usa en producción
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
