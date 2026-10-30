# Desktop client builds

Prebuilt packages of the Qt desktop apps (user and admin client in each).

| Folder | Package | How to run |
| --- | --- | --- |
| `linux/` | `amcp-desktop-linux-x86_64.tar.gz` | `tar xzf` it, then `./amcp-user-desktop` or `./amcp-admin-desktop` |
| `windows/` | `amcp-desktop-windows-x64.zip` | unzip, run `amcp_user_desktop.exe` or `amcp_admin_desktop.exe` (unsigned: SmartScreen -> More info -> Run anyway) |

Qt is bundled. Each package has a `.env` with public values only (API URL, Supabase URL, anon key).
Verify downloads with `sha256sum -c SHA256SUMS`.

macOS: not built here (needs a Mac or the GitHub Actions macOS runner, see `../README.md`).
Rebuild: see `../README.md` ("Downloadable builds" and the Docker cross-build for Windows).
