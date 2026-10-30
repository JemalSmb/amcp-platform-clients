AMCP desktop clients (Linux x86_64)

  ./amcp-user-desktop      regular user client
  ./amcp-admin-desktop     admin client

Qt is bundled. You still need the usual desktop libraries from your distro
(X11/xcb, OpenGL, fontconfig). On Ubuntu/Debian, if the window does not open:
  sudo apt install libxcb-cursor0 libxkbcommon-x11-0 libxcb-icccm4 libxcb-keysyms1 libxcb-shape0

Settings live in the ".env" file next to the launchers (API and Supabase URLs, public anon key).
