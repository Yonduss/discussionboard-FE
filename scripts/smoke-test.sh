#!/bin/sh

set -eu

base_url="${1:-http://127.0.0.1}"
work_dir="$(mktemp -d)"

cleanup() {
    rm -rf "$work_dir"
}

trap cleanup EXIT

request() {
    method="$1"
    path="$2"
    output="$3"
    shift 3

    curl \
        --silent \
        --show-error \
        --request "$method" \
        --output "$output" \
        --write-out '%{http_code}' \
        "$@" \
        "${base_url}${path}"
}

assert_json() {
    response_file="$1"

    if ! jq --exit-status . "$response_file" >/dev/null; then
        echo "Expected a JSON response but received:" >&2
        cat "$response_file" >&2
        exit 1
    fi
}

unauthorized_body="$work_dir/unauthorized.json"
unauthorized_status="$(request GET /api/v1/posts "$unauthorized_body")"

test "$unauthorized_status" = "401"
assert_json "$unauthorized_body"
jq --exit-status '.message == "unauthorized"' \
    "$unauthorized_body" >/dev/null

email="ci-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}-$$@example.com"
password="CiSmokeTest123!"
signup_body="$work_dir/signup.json"
login_body="$work_dir/login.json"
posts_body="$work_dir/posts.json"

signup_status="$(request POST /api/v1/users/signup "$signup_body" \
    --header 'Content-Type: application/json' \
    --data "{\"email\":\"$email\",\"password\":\"$password\",\"passwordConfirm\":\"$password\",\"nickname\":\"ci-smoke\",\"profileImageUrl\":null}")"

test "$signup_status" = "201"
assert_json "$signup_body"

login_status="$(request POST /api/v1/auth/login "$login_body" \
    --header 'Content-Type: application/json' \
    --data "{\"email\":\"$email\",\"password\":\"$password\"}")"

test "$login_status" = "200"
assert_json "$login_body"

access_token="$(jq --raw-output '.data.accessToken // empty' "$login_body")"
test -n "$access_token"

posts_status="$(request GET '/api/v1/posts?page=0&size=10' "$posts_body" \
    --header "Authorization: Bearer $access_token")"

test "$posts_status" = "200"
assert_json "$posts_body"
jq --exit-status '.data.posts | type == "array"' "$posts_body" >/dev/null

echo "Signup, login, and post-list smoke tests passed through nginx."
