#!/bin/sh
set -eu

PACKAGE_SPEC="${TYPE1SKILLS_PACKAGE:-github:vibelibs/type1skills}"
PACKAGE_NAME="type1skills"

say() {
  printf '%s\n' "$*"
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

install_with() {
  manager="$1"

  case "$manager" in
    npm)
      npm uninstall -g "$PACKAGE_NAME" >/dev/null 2>&1 || true
      npm install -g "$PACKAGE_SPEC"
      ;;
    pnpm)
      pnpm remove -g "$PACKAGE_NAME" >/dev/null 2>&1 || true
      pnpm add -g "$PACKAGE_SPEC"
      ;;
    bun)
      bun remove -g "$PACKAGE_NAME" >/dev/null 2>&1 || true
      bun add -g "$PACKAGE_SPEC"
      ;;
    *)
      say "Unsupported installer: $manager"
      exit 1
      ;;
  esac
}

say "Installing Type1Skills..."
say "Package source: $PACKAGE_SPEC"

if has_command npm; then
  install_with npm
elif has_command pnpm; then
  install_with pnpm
elif has_command bun; then
  install_with bun
else
  say "Type1Skills needs npm, pnpm, or bun available on PATH."
  exit 1
fi

if ! has_command type1skills; then
  say "Install finished, but the type1skills command was not found on PATH."
  say "Check your package manager's global bin directory and try: type1skills --help"
  exit 1
fi

say "Type1Skills installed."
type1skills --help
