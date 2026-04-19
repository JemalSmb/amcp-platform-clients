cmake_minimum_required(VERSION 3.16)
project(amcp_desktop_clients VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTORCC ON)

# This workspace targets Qt6.
find_package(Qt6 REQUIRED COMPONENTS Widgets)
set(QT_PACKAGE Qt6)

add_subdirectory(amcp-admin-desktop)
add_subdirectory(amcp-user-desktop)
