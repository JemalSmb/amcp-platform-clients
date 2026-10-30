#!/usr/bin/env bash
# Bundle the Linux builds with the Qt libraries/plugins they need into one tarball.
# Usage: package-linux.sh <cmake-build-dir> <output-dir>
set -euo pipefail

BUILD_DIR=$(realpath "$1")
OUT_DIR=$(realpath -m "$2")
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=amcp-desktop-linux-x86_64
STAGE="$OUT_DIR/$NAME"

QMAKE=$(command -v qmake6 || command -v qmake)
PLUGINS=$("$QMAKE" -query QT_INSTALL_PLUGINS)

rm -rf "$STAGE"
mkdir -p "$STAGE/bin" "$STAGE/lib" "$STAGE/plugins"

for app in admin user; do
  cp "$BUILD_DIR/amcp-$app-desktop/amcp_${app}_desktop" "$STAGE/bin/"
  cat > "$STAGE/amcp-$app-desktop" <<'LAUNCH'
#!/usr/bin/env bash
HERE=$(cd "$(dirname "$(readlink -f "$0")")" && pwd)
export LD_LIBRARY_PATH="$HERE/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export QT_PLUGIN_PATH="$HERE/plugins"
cd "$HERE"   # the app reads ./.env
LAUNCH
  echo "exec \"\$HERE/bin/amcp_${app}_desktop\" \"\$@\"" >> "$STAGE/amcp-$app-desktop"
  chmod +x "$STAGE/amcp-$app-desktop"
done

# Qt + the libraries distros often ship in other versions; core system libs (glibc, GL, X11/xcb) stay on the host.
copy_libs() {
  ldd "$1" | awk '/=>/ {print $3}' | grep -E '/(libQt6|libicu|libdouble-conversion|libpcre2-16|libb2|libmd4c)' | while read -r lib; do
    cp -n "$lib" "$STAGE/lib/" 2>/dev/null || true
  done
}
for bin in "$STAGE"/bin/*; do copy_libs "$bin"; done

for plugin in platforms imageformats iconengines tls platforminputcontexts xcbglintegrations platformthemes; do
  [ -d "$PLUGINS/$plugin" ] && cp -r "$PLUGINS/$plugin" "$STAGE/plugins/"
done
# plugins have their own Qt dependencies
find "$STAGE/plugins" -name '*.so' | while read -r so; do copy_libs "$so"; done

cp "$HERE/amcp.env" "$STAGE/.env"
cp "$HERE/README-linux.txt" "$STAGE/README.txt"

tar -C "$OUT_DIR" -czf "$OUT_DIR/$NAME.tar.gz" "$NAME"
echo "created $OUT_DIR/$NAME.tar.gz"
