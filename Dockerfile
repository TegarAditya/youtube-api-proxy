# Stage 1
FROM oven/bun:latest AS builder

WORKDIR /app

RUN apt update -y && apt install -y openssl

COPY . .

RUN bun install --frozen-lockfile

RUN bun build --compile --minify ./src/index.ts --outfile ./dist/compiled/main

# Stage 2
FROM busybox:uclibc AS wget

# Stage 3
FROM gcr.io/distroless/cc-debian11 AS runtime

WORKDIR /app

COPY --from=wget /bin/wget /usr/bin/wget

COPY --from=builder /app/dist/compiled/main /app/main

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["/usr/bin/wget", "--spider", "--no-verbose", "http://localhost:3000/healthcheck"]

CMD ["/app/main"]