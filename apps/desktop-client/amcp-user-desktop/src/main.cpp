#include <QApplication>
#include <QLabel>
#include <QMainWindow>
#include <QPushButton>
#include <QVBoxLayout>
#include <QWidget>

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    QMainWindow window;
    window.setWindowTitle("AMCP User Desktop");
    window.resize(900, 600);

    auto *central = new QWidget(&window);
    auto *layout = new QVBoxLayout(central);

    auto *title = new QLabel("AMCP User Workspace", central);
    title->setStyleSheet("font-size: 24px; font-weight: 600;");

    auto *description = new QLabel(
        "Basic starter shell for regular user workflows.",
        central
    );

    auto *startSession = new QPushButton("Start Session", central);

    layout->addWidget(title);
    layout->addWidget(description);
    layout->addSpacing(12);
    layout->addWidget(startSession);
    layout->addStretch();

    window.setCentralWidget(central);
    window.show();

    return app.exec();
}
