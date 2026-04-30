set(APP_NAME amcp_admin_desktop)

add_executable(${APP_NAME}
  src/main.cpp
  resources.qrc
)

target_link_libraries(${APP_NAME} PRIVATE ${QT_PACKAGE}::Widgets ${QT_PACKAGE}::Svg)
