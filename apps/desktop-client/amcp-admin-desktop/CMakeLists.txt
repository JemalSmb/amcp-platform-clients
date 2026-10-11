set(APP_NAME amcp_admin_desktop)

add_executable(${APP_NAME}
  src/main.cpp
  ../common/supabase_auth.cpp
  ../common/login_dialog.cpp
  resources.qrc
)

target_include_directories(${APP_NAME} PRIVATE ../common)

target_link_libraries(${APP_NAME} PRIVATE ${QT_PACKAGE}::Widgets ${QT_PACKAGE}::Svg ${QT_PACKAGE}::Network)
