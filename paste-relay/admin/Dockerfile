FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY server.js db.js docker-status.js ./

# No dependencies to install (see package.json) — nothing to `npm ci`.

# Ensure the DB volume's mount point exists and is writable by the
# unprivileged `node` user before dropping root. In practice this
# directory is the mount point for the shared `paste_relay_data` volume
# (Workstream F), already populated by paste-relay's own container; this
# just guards against an empty/misconfigured mount.
RUN mkdir -p /var/lib/paste-relay && chown -R node:node /var/lib/paste-relay
USER node

ENV ADMIN_PORT=4120
EXPOSE 4120

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4120/healthz',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
