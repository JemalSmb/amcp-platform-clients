set(APP_NAME amcp_admin_desktop)

# WIN32: no console window on Windows. MACOSX_BUNDLE: build a .app on macOS. Both are ignored on Linux.
add_executable(${APP_NAME} WIN32 MACOSX_BUNDLE
  src/main.cpp
  ../common/supabase_auth.cpp
  ../common/login_dialog.cpp
  ../common/api_client.cpp
  ../common/data_page.cpp
  resources.qrc
)

target_include_directories(${APP_NAME} PRIVATE ../common)

target_link_libraries(${APP_NAME} PRIVATE ${QT_PACKAGE}::Widgets ${QT_PACKAGE}::Svg ${QT_PACKAGE}::Network)
