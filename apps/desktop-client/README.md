# AMCP Qt Desktop Clients

This folder contains two basic Qt desktop applications:

- `amcp-admin-desktop`: Admin-facing desktop app shell
- `amcp-user-desktop`: Regular-user desktop app shell

## Prerequisites

You mentioned you already have Qt VS Code extensions but not local libraries.
You still need local Qt development libraries installed for building/running.

### Ubuntu/Debian (Qt6)

```bash
sudo apt update
sudo apt install -y build-essential cmake ninja-build libgl1-mesa-dev libglu1-mesa-dev qt6-base-dev
```

### If only Qt5 is available

```bash
sudo apt update
sudo apt install -y build-essential cmake ninja-build qtbase5-dev
```

## Build (both apps)

From this directory (`apps/desktop-client`):

```bash
cmake -S . -B build -G Ninja
cmake --build build
```

## Run

```bash
./build/amcp-admin-desktop/amcp_admin_desktop
./build/amcp-user-desktop/amcp_user_desktop
```

## Notes

- The top-level CMake checks Qt6 first, then falls back to Qt5.
- These are starter shells intended to be extended with real features and backend integration.
