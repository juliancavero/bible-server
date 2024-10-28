# Dockerfile para bib-back
FROM node:18

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto del backend
EXPOSE 3200

# Comando para iniciar el backend en modo desarrollo
CMD ["npm", "run", "start:dev"]
