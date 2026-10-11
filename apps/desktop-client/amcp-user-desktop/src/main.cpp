#include <QApplication>
#include <QAction>
#include <QMenuBar>
#include "api_client.h"
#include "data_page.h"
#include "login_dialog.h"
#include "supabase_auth.h"
#include <QFrame>
#include <QHBoxLayout>
#include <QHeaderView>
#include <QIcon>
#include <QLabel>
#include <QMainWindow>
#include <QPainter>
#include <QPixmap>
#include <QPushButton>
#include <QSettings>
#include <QSizePolicy>
#include <QSvgRenderer>
#include <QTableWidget>
#include <QToolButton>
#include <QVBoxLayout>
#include <QWidget>
#include <QStackedWidget>
#include <QVector>

static QIcon loadDrawerIcon(const QString &iconPath) {
    const QSize iconSize(32, 32);

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

struct DomainMeta {
    QString id;
    QString label;
    QString color;
    QString colorSoft;
    bool comingSoon;
};

static const QVector<DomainMeta> kDomains = {
    {"cybersecurity", "Cybersecurity", "#00571A", "#d1fae5", false},
    {"finance", "Finance", "#2563eb", "#dbeafe", false},
    {"manufacturing", "Manufacturing", "#d97706", "#fef3c7", false},
    {"agriculture", "Agriculture", "#65a30d", "#ecfccb", true},
};

static const char *kDomainSettingsKey = "amcp/selectedDomain";

static int readStoredDomain() {
    const QString stored = QSettings().value(kDomainSettingsKey).toString();
    for (int i = 0; i < kDomains.size(); ++i) {
        if (kDomains[i].id == stored) {
            return i;
        }
    }
    return 0;
}

static void writeStoredDomain(int index) {
    QSettings().setValue(kDomainSettingsKey, kDomains[index].id);
}

static QIcon createDotIcon(const QString &color) {
    QPixmap pixmap(10, 10);
    pixmap.fill(Qt::transparent);
    QPainter painter(&pixmap);
    painter.setRenderHint(QPainter::Antialiasing);
    painter.setPen(Qt::NoPen);
    painter.setBrush(QColor(color));
    painter.drawEllipse(pixmap.rect());
    return QIcon(pixmap);
}

static QString navButtonStyle(const QString &domainColor, bool active) {
    QColor soft(domainColor);
    soft.setAlphaF(0.35);
    const QString activeRules = active
        ? QString("background: %1; border-left: 3px solid %2;").arg(soft.name(QColor::HexArgb), domainColor)
        : QString("background: transparent; border-left: 3px solid transparent;");
    return QString(
        "QToolButton { color: white; %1 border-top: none; border-right: none; border-bottom: none; text-align: left; padding: 10px 12px; font-size: 22px; font-weight: 500; }"
        "QToolButton:hover { background: rgba(255,255,255,0.08); }"
    ).arg(activeRules);
}

static QString domainPillStyle(const QString &color, bool active) {
    QColor soft(color);
    soft.setAlphaF(0.30);
    const QString activeRules = active
        ? QString("border: 1px solid %1; background: %2; color: white; font-weight: 600;").arg(color, soft.name(QColor::HexArgb))
        : QString("border: 1px solid transparent; background: transparent; color: rgba(255,255,255,0.85);");
    return QString(
        "QPushButton { %1 border-radius: 8px; padding: 6px 10px; font-size: 14px; text-align: left; }"
        "QPushButton:hover:enabled { background: rgba(255,255,255,0.08); }"
        "QPushButton:disabled { color: rgba(255,255,255,0.5); }"
    ).arg(activeRules);
}

static QToolButton *createNavButton(const QString &text, const QString &iconPath, QWidget *parent) {
    auto *button = new QToolButton(parent);
    button->setText(text);
    button->setIcon(loadDrawerIcon(iconPath));
    button->setIconSize(QSize(32, 32));
    button->setToolButtonStyle(Qt::ToolButtonTextBesideIcon);
    button->setCursor(Qt::PointingHandCursor);
    button->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Minimum);
    button->setFixedHeight(56);
    return button;
}

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    app.setOrganizationName("AMCP");
    app.setApplicationName("AMCP Desktop");
    Q_INIT_RESOURCE(resources);
    QCoreApplication::setOrganizationName("AMCP");
    QCoreApplication::setApplicationName("amcp-user-desktop");

    SupabaseAuth auth("amcp/user/auth");
    if (!auth.restoreSession()) {
        LoginDialog login(&auth, "AMCP User Desktop");
        if (login.exec() != QDialog::Accepted) {
            return 0;
        }
    }

    ApiClient api(&auth);

    QMainWindow window;
    auto *accountMenu = window.menuBar()->addMenu("Account");
    accountMenu->addAction(auth.email().isEmpty() ? "Signed in" : "Signed in as " + auth.email())->setEnabled(false);
    accountMenu->addAction("Log out", [&auth, &app]() {
        auth.logout();
        app.quit();
    });
    window.setWindowTitle("AMCP User Desktop");
    window.resize(1280, 800);

    auto *central = new QWidget(&window);
    auto *rootLayout = new QHBoxLayout(central);
    rootLayout->setContentsMargins(0, 0, 0, 0);
    rootLayout->setSpacing(0);

    auto *drawer = new QWidget(central);
    drawer->setFixedWidth(390);
    drawer->setObjectName("drawer");

    auto *drawerLayout = new QVBoxLayout(drawer);
    drawerLayout->setContentsMargins(22, 22, 22, 22);
    drawerLayout->setSpacing(8);

    auto *logo = new QLabel("AMCP", drawer);
    logo->setStyleSheet("color: white; font-size: 30px; font-weight: 700;");
    drawerLayout->addWidget(logo);

    int currentDomain = readStoredDomain();
    QVector<QPushButton *> domainPills;
    QVector<QToolButton *> navButtons;
    int currentPage = 0;

    for (int d = 0; d < kDomains.size(); ++d) {
        const DomainMeta &domain = kDomains[d];
        auto *pill = new QPushButton(domain.comingSoon ? QString("%1  (soon)").arg(domain.label) : domain.label, drawer);
        pill->setIcon(createDotIcon(domain.color));
        pill->setIconSize(QSize(10, 10));
        pill->setCursor(domain.comingSoon ? Qt::ForbiddenCursor : Qt::PointingHandCursor);
        pill->setEnabled(!domain.comingSoon);
        domainPills.append(pill);
        drawerLayout->addWidget(pill);
    }

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

    auto *stackedWidget = new QStackedWidget(central);

    stackedWidget->addWidget(createDataPage(&api, specs::home(),
        "Home",
        {"Domain", "Events (24h)", "Alerts (24h)"},
        {
            {"cybersecurity", "1842", "6"},
            {"finance", "934", "2"},
            {"manufacturing", "411", "3"},
            {"healthcare", "0", "0"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::alerts(),
        "Live Alerts",
        {"Title", "Domain", "Severity"},
        {
            {"Suspicious login burst", "cybersecurity", "high"},
            {"Phishing email flagged", "cybersecurity", "medium"},
            {"Unusual trading velocity", "finance", "critical"},
            {"Line pressure drift", "manufacturing", "low"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::incidents(),
        "Incidents and Cases",
        {"Title", "Domain", "Status", "Assignee"},
        {
            {"Credential stuffing campaign", "cybersecurity", "investigating", "S. Rao"},
            {"Fraud ring suspected", "finance", "open", "Unassigned"},
            {"Sensor calibration drift", "manufacturing", "resolved", "J. Alvarez"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::detections(),
        "Detections",
        {"Signal", "Model", "Confidence"},
        {
            {"Login velocity spike", "anomaly_detection", "0.93"},
            {"Lookalike domain in email body", "phishing_detection", "0.81"},
            {"Trade frequency outlier", "finance_fraud_anomaly", "0.97"},
            {"Pressure sensor drift", "manufacturing_process_anomaly", "0.42"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::predictions(),
        "Predictions and Forecasts",
        {"Model", "Domain", "Label", "Score"},
        {
            {"anomaly_detection", "cybersecurity", "anomalous", "0.93"},
            {"phishing_detection", "cybersecurity", "phishing", "0.81"},
            {"finance_fraud_anomaly", "finance", "fraud_suspected", "0.97"},
            {"manufacturing_process_anomaly", "manufacturing", "normal", "0.42"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::investigations(),
        "Investigations",
        {"Title", "Domain", "Status", "Owner"},
        {
            {"Q3 credential abuse review", "cybersecurity", "in_progress", "S. Rao"},
            {"Trading anomaly root cause", "finance", "open", "M. Chen"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::assets(),
        "Assets and Entities",
        {"Name", "Domain", "Type", "Risk"},
        {
            {"auth-gateway-01", "cybersecurity", "service", "high"},
            {"trading-api", "finance", "service", "medium"},
            {"line-3-plc", "manufacturing", "device", "low"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::automations(),
        "Automation Runs",
        {"Playbook", "Domain", "Status", "Runs"},
        {
            {"Lock account on credential stuffing", "cybersecurity", "enabled", "12"},
            {"Freeze account on fraud score > 0.9", "finance", "enabled", "4"},
            {"Notify maintenance on process drift", "manufacturing", "disabled", "21"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::reports(),
        "Reports",
        {"Title", "Domain", "Period"},
        {
            {"Weekly security posture summary", "cybersecurity", "Sep 8 - Sep 15"},
            {"Fraud detection performance", "finance", "Sep 8 - Sep 15"},
            {"Platform-wide event summary", "platform", "Sep 8 - Sep 15"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::notifications(),
        "Notifications",
        {"Message", "Read"},
        {
            {"New critical alert in finance domain", "no"},
            {"Automation ran successfully", "no"},
            {"Weekly report generated", "yes"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::profile(),
        "Profile and Preferences",
        {"Field", "Value"},
        {
            {"Name", "Jamal Samba"},
            {"Email", "jamalsamba@gmail.com"},
            {"Role", "Security Analyst"},
            {"Timezone", "UTC"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::helpDocs(),
        "Help and Docs",
        {"Title", "Category"},
        {
            {"Getting started with the dashboard", "Basics"},
            {"Understanding alert severity", "Alerts"},
            {"Configuring automation playbooks", "Automation"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::settings(),
        "My Settings",
        {"Setting", "Value"},
        {
            {"Theme", "light"},
            {"Email alerts", "on"},
            {"Alert severity threshold", "medium"},
            {"Refresh interval (seconds)", "30"},
        }));

    for (int i = 0; i < userItems.size(); ++i) {
        const auto &item = userItems[i];
        auto *btn = createNavButton(item.first, item.second, drawer);
        navButtons.append(btn);
        drawerLayout->addWidget(btn);
    }
    drawerLayout->addStretch();

    // Mirrors the Angular DomainService: the selected domain colors the drawer and active link.
    auto applyTheme = [&]() {
        const QString color = kDomains[currentDomain].color;
        drawer->setStyleSheet(QString("#drawer { background-color: %1; }").arg(color));
        for (int d = 0; d < domainPills.size(); ++d) {
            domainPills[d]->setStyleSheet(domainPillStyle(kDomains[d].color, d == currentDomain));
        }
        for (int n = 0; n < navButtons.size(); ++n) {
            navButtons[n]->setStyleSheet(navButtonStyle(color, n == currentPage));
        }
    };

    for (int d = 0; d < domainPills.size(); ++d) {
        QObject::connect(domainPills[d], &QPushButton::clicked, drawer, [&, d]() {
            currentDomain = d;
            writeStoredDomain(d);
            applyTheme();
        });
    }
    for (int n = 0; n < navButtons.size(); ++n) {
        QObject::connect(navButtons[n], &QToolButton::clicked, stackedWidget, [&, n]() {
            currentPage = n;
            stackedWidget->setCurrentIndex(n);
            applyTheme();
        });
    }
    applyTheme();

    rootLayout->addWidget(drawer);
    rootLayout->addWidget(stackedWidget);

    window.setCentralWidget(central);
    window.show();

    return app.exec();
}
