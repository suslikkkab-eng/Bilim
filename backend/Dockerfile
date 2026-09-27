# ---- build stage ----
FROM golang:1.26-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Статичный бинарник без CGO (lib/pq — чистый Go)
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# ---- run stage ----
FROM alpine:3.20
# CA-сертификаты нужны для TLS к Postgres (sslmode=require) и к Gmail SMTP
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/server .

# Хостинг подставит свой PORT через переменную окружения; по умолчанию 8080
EXPOSE 8080
CMD ["./server"]
