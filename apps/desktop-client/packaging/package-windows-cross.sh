#!/usr/bin/env bash
# Cross-compile the Windows .exe files on Linux (MinGW-w64 + Qt's prebuilt Windows libraries) and bundle
# them with the Qt DLLs/plugins into a zip. Runs INSIDE the image built from Dockerfile.windows-cross:
#
#   docker build -t amcp-winbuild -f packaging/Dockerfile.windows-cross packaging
#   docker run --rm --user $(id -u):$(id -g) -v "$PWD":/src:ro -v "$PWD/dist":/out amcp-winbuild \
#       /src/apps/desktop-client/packaging/package-windows-cross.sh
set -euo pipefail

SRC=${SRC:-/src/apps/desktop-client}
OUT=${OUT:-/out}
QT_HOST=/opt/qt/6.7.3/gcc_64
QT_TARGET=/opt/qt/6.7.3/mingw_64
NAME=amcp-desktop-windows-x64
STAGE="$OUT/$NAME"

cmake -S "$SRC" -B "$OUT/build-win" -G Ninja -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_SYSTEM_NAME=Windows -DCMAKE_CXX_COMPILER=x86_64-w64-mingw32-g++-posix \
  -DCMAKE_RC_COMPILER=x86_64-w64-mingw32-windres -DQT_HOST_PATH="$QT_HOST" \
  -DCMAKE_PREFIX_PATH="$QT_TARGET" -DCMAKE_FIND_ROOT_PATH="$QT_TARGET" \
  -DCMAKE_FIND_ROOT_PATH_MODE_PACKAGE=BOTH -DCMAKE_FIND_ROOT_PATH_MODE_LIBRARY=BOTH \
  -DCMAKE_FIND_ROOT_PATH_MODE_INCLUDE=BOTH \
  -DCMAKE_AUTORCC_OPTIONS=--no-zstd   # host rcc would otherwise emit zstd resources the Windows Qt can't read
cmake --build "$OUT/build-win" -j"$(nproc)"

rm -rf "$STAGE" "$OUT/$NAME.zip"
mkdir -p "$STAGE"
cp "$OUT"/build-win/amcp-admin-desktop/amcp_admin_desktop.exe "$OUT"/build-win/amcp-user-desktop/amcp_user_desktop.exe "$STAGE/"

# Qt libraries the apps use, plus the software-GL / D3D fallbacks Qt ships for machines with poor drivers.
for dll in Qt6Core Qt6Gui Qt6Widgets Qt6Svg Qt6Network; do cp "$QT_TARGET/bin/$dll.dll" "$STAGE/"; done
cp "$QT_TARGET"/bin/d3dcompiler_47.dll "$QT_TARGET"/bin/opengl32sw.dll "$STAGE/"
# MinGW runtime from the compiler we used (newer than the one Qt was built with, so it is a superset).
cp /usr/lib/gcc/x86_64-w64-mingw32/13-posix/libgcc_s_seh-1.dll /usr/lib/gcc/x86_64-w64-mingw32/13-posix/libstdc++-6.dll \
   /usr/x86_64-w64-mingw32/lib/libwinpthread-1.dll "$STAGE/"

# Strip debug symbols (libstdc++ alone drops from 26 MB to ~2 MB).
x86_64-w64-mingw32-strip --strip-unneeded "$STAGE"/*.exe "$STAGE"/libgcc_s_seh-1.dll "$STAGE"/libstdc++-6.dll

copy_plugin() { mkdir -p "$STAGE/$1"; cp "$QT_TARGET/plugins/$1/$2" "$STAGE/$1/"; }
copy_plugin platforms qwindows.dll
copy_plugin styles qmodernwindowsstyle.dll
copy_plugin iconengines qsvgicon.dll
for p in qsvg qico qgif qjpeg; do copy_plugin imageformats $p.dll; done
copy_plugin tls qschannelbackend.dll
copy_plugin tls qcertonlybackend.dll

cp "$(dirname "$0")/amcp.env" "$STAGE/.env"
cat > "$STAGE/README.txt" <<'TXT'
AMCP desktop clients (Windows x64)

  amcp_user_desktop.exe     regular user client
  amcp_admin_desktop.exe    admin client

Keep the files in this folder together. Settings live in the ".env" file next to the programs
(API and Supabase URLs, public anon key). The programs are unsigned, so Windows SmartScreen may warn:
choose "More info" -> "Run anyway".
TXT

(cd "$OUT" && zip -qr "$NAME.zip" "$NAME")
echo "created $OUT/$NAME.zip"
