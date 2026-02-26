# Playwright tesztek futtatásához Docker image
FROM mcr.microsoft.com/playwright:v1.58.2-noble

# Munkakönyvtár beállítása
WORKDIR /app

# Node.js verzió ellenőrzés (a Playwright image tartalmazza)
# Package fájlok másolása
COPY package*.json ./

# Függőségek telepítése
RUN npm ci

# Projekt fájlok másolása
COPY . .

# Angular build (production)
RUN npm run build

# Playwright browsers már telepítve vannak az alapimage-ben
# De biztosítjuk, hogy a megfelelő verzió legyen
RUN npx playwright install --with-deps chromium

# Környezeti változó a CI módhoz
ENV CI=true

# Alapértelmezett parancs: tesztek futtatása
CMD ["npx", "playwright", "test", "--reporter=html,list"]
