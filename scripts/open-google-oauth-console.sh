#!/usr/bin/env bash
# Opens Google Cloud → Credentials for the project that owns GOOGLE_CLIENT_ID
# (Sierra admin Google sign-in). Add the printed URIs to the Web client.

set -euo pipefail

# Set GCP_PROJECT_ID to your Cloud project *ID* (IAM → Settings) for a direct link.
readonly GCP_PROJECT_ID="${GCP_PROJECT_ID:-}"
readonly ORIGIN="${NEXTAUTH_ORIGIN:-https://sierra-supplements.vercel.app}"

if [[ -n "${GCP_PROJECT_ID}" ]]; then
  readonly CONSOLE_URL="https://console.cloud.google.com/apis/credentials?project=${GCP_PROJECT_ID}"
else
  readonly CONSOLE_URL="https://console.cloud.google.com/apis/credentials"
fi

echo ""
if [[ -n "${GCP_PROJECT_ID}" ]]; then
  echo "Google Cloud project: ${GCP_PROJECT_ID}"
else
  echo "Google Cloud: pick your Sierra Strength project, then APIs & Services → Credentials"
fi
echo "Open this Web application OAuth 2.0 client and add:"
echo ""
echo "  Authorized JavaScript origins:"
echo "    ${ORIGIN}"
echo ""
echo "  Authorized redirect URIs:"
echo "    ${ORIGIN}/api/auth/callback/google"
echo ""
echo "Opening: ${CONSOLE_URL}"
echo ""

if command -v open >/dev/null 2>&1; then
  open "${CONSOLE_URL}"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${CONSOLE_URL}"
else
  echo "(Install 'open' or paste the URL into your browser.)"
fi
