#!/bin/sh

set -eu

image_tag="${1:?frontend image tag is required}"
deploy_dir="${DEPLOY_DIR:-/opt/discussionboard}"
compose_file="$deploy_dir/docker-compose.prod.yml"
env_file="$deploy_dir/.env"
headers_file="$(mktemp)"
body_file="$(mktemp)"

cleanup() {
    exit_status="$?"
    rm -f "$headers_file" "$body_file"

    if [ "$exit_status" -ne 0 ] && [ -f "$compose_file" ] && [ -f "$env_file" ]; then
        docker compose --env-file "$env_file" -f "$compose_file" ps >&2 || true
        docker compose --env-file "$env_file" -f "$compose_file" \
            logs --no-color --tail=100 frontend >&2 || true
    fi

    exit "$exit_status"
}

trap cleanup EXIT

update_env() {
    key="$1"
    value="$2"

    if grep -q "^${key}=" "$env_file"; then
        sed -i "s/^${key}=.*/${key}=${value}/" "$env_file"
    else
        printf '%s=%s\n' "$key" "$value" >> "$env_file"
    fi
}

check_api_proxy() {
    status="$(curl --silent --show-error \
        --retry 10 --retry-delay 3 \
        --dump-header "$headers_file" \
        --output "$body_file" \
        --write-out '%{http_code}' \
        http://127.0.0.1/api/v1/posts)"

    test "$status" = "401"
    grep -iq '^content-type: application/json' "$headers_file"
    grep -Eq '"message"[[:space:]]*:[[:space:]]*"unauthorized"' "$body_file"
}

exec 9>"$deploy_dir/.deploy.lock"
flock -x 9

test -f "$compose_file"
test -f "$env_file"
update_env FRONTEND_IMAGE_TAG "$image_tag"
chmod 600 "$env_file"

docker compose --env-file "$env_file" -f "$compose_file" pull frontend
docker compose --env-file "$env_file" -f "$compose_file" \
    up -d --no-deps --wait frontend

curl --fail --silent --show-error \
    --retry 10 --retry-delay 3 http://127.0.0.1/health >/dev/null
check_api_proxy

docker compose --env-file "$env_file" -f "$compose_file" ps
