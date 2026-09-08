# GStack Agents — API server
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

ENV HOST=0.0.0.0
ENV PORT=8787
EXPOSE 8787

# data volume — sessions + knowledge इथे persist होतील
VOLUME ["/app/data"]

CMD ["node", "src/index.js"]
