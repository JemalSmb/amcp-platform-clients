# AMCP Qt Desktop Clients

This folder contains two Qt desktop applications:

- `amcp-admin-desktop`: admin-facing desktop client
- `amcp-user-desktop`: regular user desktop client

## Important: cross-platform build reality

Qt is cross-platform at the source-code level, but it does not produce one universal executable for Linux, Windows, and macOS.

Each platform needs its own native build:

- Linux: Linux executable
- Windows: `.exe` executable
- macOS: `.app` bundle or packaged macOS binary

This machine is Linux, so the build here can only produce the Linux binaries unless a Windows or macOS toolchain is configured.

## Downloadable builds (Linux, Windows, macOS)

`.github/workflows/desktop-release.yml` builds all three natively on GitHub's runners:

- **Manual run:** Actions tab -> "Desktop clients" -> Run workflow. Artifacts: `desktop-linux`, `desktop-windows`, `desktop-macos`.
- **Release:** push a tag such as `desktop-v0.1.0` and the three packages are attached to a GitHub Release.

| Platform | Package | Notes |
| --- | --- | --- |
| Linux x86_64 | `amcp-desktop-linux-x86_64.tar.gz` | Qt bundled; run `./amcp-user-desktop` or `./amcp-admin-desktop` |
| Windows x64 | `amcp-desktop-windows-x64.zip` | Unzip, run the `.exe` (Qt DLLs included). SmartScreen warns because the app is unsigned |
| macOS (Apple Silicon) | `amcp-*-desktop-macos-arm64.zip` | Unsigned: right-click -> Open the first time |

Each package ships a `.env` with only public values (API URL, Supabase URL, anon key) from `packaging/amcp.env`.
Never put the Supabase service role key in a desktop app. Build the Linux package locally with
`packaging/package-linux.sh <build-dir> <out-dir>`.

### Build the Windows .exe from Linux (no Windows machine needed)

Uses Docker with a MinGW-w64 cross-compiler and Qt's prebuilt Windows libraries (a one-time ~1 GB image):

```bash
docker build -t amcp-winbuild -f apps/desktop-client/packaging/Dockerfile.windows-cross apps/desktop-client/packaging
mkdir -p dist
docker run --rm --user $(id -u):$(id -g) -v "$PWD":/src:ro -v "$PWD/dist":/out amcp-winbuild \
  /src/apps/desktop-client/packaging/package-windows-cross.sh
# -> dist/amcp-desktop-windows-x64.zip
```

macOS cannot be cross-built this way: it needs Apple's SDK, which Apple licenses only for use on Apple hardware.
Use the GitHub Actions macOS runner (workflow above) or a Mac.

## Prerequisites

### Ubuntu/Debian (Linux build)

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  cmake \
  ninja-build \
  pkg-config \
  libgl1-mesa-dev \
  libglu1-mesa-dev \
  qt6-base-dev \
  qt6-svg-dev \
  qt6-tools-dev \
  qt6-tools-dev-tools
```

If `sudo` is unavailable in your environment, you must run this as a user with package-manager privileges or use a preconfigured dev container / VM.

## Build on Linux

From `apps/desktop-client`:

```bash
cmake -S . -B build -G Ninja
cmake --build build --target amcp_admin_desktop amcp_user_desktop -j$(nproc)
```

Outputs:

```bash
./build/amcp-admin-desktop/amcp_admin_desktop
./build/amcp-user-desktop/amcp_user_desktop
```

## Run on Linux

```bash
./build/amcp-admin-desktop/amcp_admin_desktop
./build/amcp-user-desktop/amcp_user_desktop
```

## Windows build

A Windows build must be performed on Windows or in a Windows CI runner.

Example workflow:

```powershell
cd C:\path\to\amcp-platform-clients\apps\desktop-client
call "C:\Qt\6.x\msvc2019_64\bin\qtvars.bat"
cmake -S . -B build -G "Ninja" -DCMAKE_PREFIX_PATH=C:/Qt/6.x/msvc2019_64
cmake --build build --target amcp_admin_desktop amcp_user_desktop
windeployqt build\amcp-admin-desktop\amcp_admin_desktop.exe
windeployqt build\amcp-user-desktop\amcp_user_desktop.exe
```

This produces Windows `.exe` files, not Linux binaries.

## macOS build

A macOS build must be performed on macOS or in a macOS CI runner.

Example workflow:

```bash
cd /path/to/amcp-platform-clients/apps/desktop-client
export PATH="/opt/homebrew/opt/qt/bin:$PATH"
cmake -S . -B build -G Ninja -DCMAKE_PREFIX_PATH=/opt/homebrew/opt/qt
cmake --build build --target amcp_admin_desktop amcp_user_desktop
macdeployqt build/amcp-admin-desktop/amcp_admin_desktop.app -dmg
macdeployqt build/amcp-user-desktop/amcp_user_desktop.app -dmg
```

This produces macOS app bundles or `.dmg` packages.

## Notes

- The source project is Qt6-first and can be configured to build on more than one OS.
- There is no single executable that runs on Linux, Windows, and macOS from one build.
- The top-level CMake checks Qt6 first and may fall back to Qt5 if that is the only available toolchain.
- These are starter shells intended to be extended with real features and backend integration.

## Help docs

The "Help and Docs" page lists docs from the gateway API (`GET /help-docs`; `GET /help-docs/<id>` returns the Markdown content).
The gateway reads them from the private Supabase Storage bucket (`client-docs/help`) with its service role key; clients never
access Storage directly. Upload changes with `node scripts/sync-help-docs-to-supabase.mjs` from the repo root.
