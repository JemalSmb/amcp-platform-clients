#include <QApplication>
#include <QLabel>
#include <QMainWindow>
#include <QPushButton>
#include <QVBoxLayout>
#include <QWidget>

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    QMainWindow window;
    window.setWindowTitle("AMCP Admin Desktop");
    window.resize(900, 600);

    auto *central = new QWidget(&window);
    auto *layout = new QVBoxLayout(central);

    auto *title = new QLabel("AMCP Admin Console", central);
    title->setStyleSheet("font-size: 24px; font-weight: 600;");

    auto *description = new QLabel(
        "Basic starter shell for admin workflows.",
        central
    );

    auto *openDashboard = new QPushButton("Open Dashboard", central);

    layout->addWidget(title);
    layout->addWidget(description);
    layout->addSpacing(12);
    layout->addWidget(openDashboard);
    layout->addStretch();

    window.setCentralWidget(central);
    window.show();

    return app.exec();
}
