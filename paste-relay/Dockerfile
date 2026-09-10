FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js storage.js auth.js db.js captcha.js content-safety.js item-crypto.js ./

RUN mkdir -p /var/lib/paste-relay && chown -R node:node /var/lib/paste-relay
USER node

ENV PORT=8787
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8787/healthz',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
