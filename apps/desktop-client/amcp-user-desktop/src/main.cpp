#include <QApplication>
#include <QFrame>
#include <QHBoxLayout>
#include <QIcon>
#include <QLabel>
#include <QMainWindow>
#include <QPainter>
#include <QPixmap>
#include <QSizePolicy>
#include <QSvgRenderer>
#include <QToolButton>
#include <QVBoxLayout>
#include <QWidget>

static QIcon loadDrawerIcon(const QString &iconPath) {
    const QSize iconSize(28, 28);

    if (iconPath.endsWith(".svg", Qt::CaseInsensitive)) {
        QSvgRenderer renderer(iconPath);
        if (!renderer.isValid()) {
            qWarning("Failed to load drawer icon: %s", qPrintable(iconPath));
            return QIcon();
        }
        QPixmap pixmap(iconSize);
        pixmap.fill(Qt::transparent);
        QPainter painter(&pixmap);
        renderer.render(&painter);
        return QIcon(pixmap);
    }

    QPixmap pixmap(iconPath);
    if (pixmap.isNull()) {
        qWarning("Failed to load drawer icon: %s", qPrintable(iconPath));
        return QIcon();
    }
    return QIcon(pixmap.scaled(iconSize, Qt::KeepAspectRatio, Qt::SmoothTransformation));
}

static QToolButton *createNavButton(const QString &text, const QString &iconPath, QWidget *parent) {
    auto *button = new QToolButton(parent);
    button->setText(text);
    button->setIcon(loadDrawerIcon(iconPath));
    button->setIconSize(QSize(28, 28));
    button->setToolButtonStyle(Qt::ToolButtonTextBesideIcon);
    button->setCursor(Qt::PointingHandCursor);
    button->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Minimum);
    button->setFixedHeight(56);
    button->setStyleSheet(
        "QToolButton { color: white; background: transparent; border: none; text-align: left; padding: 10px 12px; font-size: 20px; font-weight: 500; }"
        "QToolButton:hover { background: rgba(255,255,255,0.08); }"
    );
    return button;
}

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    Q_INIT_RESOURCE(resources);

    QMainWindow window;
    window.setWindowTitle("AMCP User Desktop");
    window.resize(1280, 800);

    auto *central = new QWidget(&window);
    auto *rootLayout = new QHBoxLayout(central);
    rootLayout->setContentsMargins(0, 0, 0, 0);
    rootLayout->setSpacing(0);

    auto *drawer = new QWidget(central);
    drawer->setFixedWidth(390);
    drawer->setStyleSheet("background-color: #00571A;");

    auto *drawerLayout = new QVBoxLayout(drawer);
    drawerLayout->setContentsMargins(22, 22, 22, 22);
    drawerLayout->setSpacing(8);

    auto *logo = new QLabel("AMCP", drawer);
    logo->setStyleSheet("color: white; font-size: 30px; font-weight: 700;");
    drawerLayout->addWidget(logo);

    const QVector<QPair<QString, QString>> userItems = {
        {"Home", ":/icons/user/Logo.png"},
        {"Live Alerts", ":/icons/user/Alert.svg"},
        {"Incidents and Cases", ":/icons/user/Incident.svg"},
        {"Detections", ":/icons/user/Detection.svg"},
        {"Predictions and Forecasts", ":/icons/user/Prediction.svg"},
        {"Investigations", ":/icons/user/Investigations.svg"},
        {"Assets and Entities", ":/icons/user/Assets.svg"},
        {"Automation Runs", ":/icons/user/Automation.svg"},
        {"Reports", ":/icons/user/Reports.svg"},
        {"Notifications", ":/icons/user/Notification.svg"},
        {"Profile and Preferences", ":/icons/user/Profile.svg"},
        {"Help and Docs", ":/icons/user/Doc.svg"},
        {"My Settings", ":/icons/user/MySettings.svg"}
    };

    for (const auto &item : userItems) {
        drawerLayout->addWidget(createNavButton(item.first, item.second, drawer));
    }

    drawerLayout->addStretch();

    auto *content = new QWidget(central);
    content->setStyleSheet("background: #F7F7F7;");
    auto *contentLayout = new QVBoxLayout(content);
    contentLayout->setContentsMargins(24, 24, 24, 24);

    auto *header = new QFrame(content);
    header->setFixedHeight(68);
    header->setStyleSheet("background: #37383F; border-radius: 14px;");

    auto *title = new QLabel("User Drawer Preview", content);
    title->setStyleSheet("font-size: 28px; font-weight: 700; color: #1F2937;");

    auto *description = new QLabel("Drawer transformed from your design using public user icons.", content);
    description->setStyleSheet("font-size: 16px; color: #4B5563;");

    contentLayout->addWidget(header);
    contentLayout->addSpacing(18);
    contentLayout->addWidget(title);
    contentLayout->addWidget(description);
    contentLayout->addStretch();

    rootLayout->addWidget(drawer);
    rootLayout->addWidget(content);

    window.setCentralWidget(central);
    window.show();

    return app.exec();
}
