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

static const char *kDomainSettingsKey = "amcp/admin/selectedDomain";

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
    QCoreApplication::setApplicationName("amcp-admin-desktop");

    SupabaseAuth auth("amcp/admin/auth");
    if (!auth.restoreSession()) {
        LoginDialog login(&auth, "AMCP Admin Desktop", false);
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
    window.setWindowTitle("AMCP Admin Desktop");
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

    const QVector<QPair<QString, QString>> adminItems = {
        {"Control Center", ":/icons/admin/Logo.png"},
        {"Domain Management", ":/icons/admin/Domain.svg"},
        {"Model Registry", ":/icons/admin/ModelRegisty.svg"},
        {"Policies and Rules", ":/icons/admin/Policies.svg"},
        {"Messaging and Schemas", ":/icons/admin/Messaging.svg"},
        {"Automation and Playbooks", ":/icons/admin/Automation.svg"},
        {"Integrations and Edge", ":/icons/admin/Integration.svg"},
        {"Data and Storage", ":/icons/admin/Data.svg"},
        {"Users and Access", ":/icons/admin/Users.svg"},
        {"Security", ":/icons/admin/Security.svg"},
        {"Observability", ":/icons/admin/Observability.svg"},
        {"Deployments and Environments", ":/icons/admin/Deployements.svg"},
        {"Audit and Compliance", ":/icons/admin/Audit.svg"},
        {"System Settings", ":/icons/admin/SystemSettings.svg"}
    };

    auto *stackedWidget = new QStackedWidget(central);

    stackedWidget->addWidget(createDataPage(&api, specs::adminControl(),
        "Control Center",
        {"Domain", "Models", "Status"},
        {
            {"cybersecurity", "3", "active"},
            {"finance", "2", "active"},
            {"manufacturing", "2", "active"},
            {"agriculture", "0", "planned"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminDomains(),
        "Domain Management",
        {"Domain", "State", "Description"},
        {
            {"cybersecurity", "active", "Threat, phishing, and ransomware detection."},
            {"finance", "active", "Fraud and trading behavior anomaly detection."},
            {"manufacturing", "active", "Process anomaly and maintenance forecasting."},
            {"agriculture", "planned", "Deferred until after MVP."},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminModels(),
        "Model Registry",
        {"Model", "Domain", "Version", "Status"},
        {
            {"Anomaly Detection", "cybersecurity", "v1.2.0", "healthy"},
            {"Phishing Detection", "cybersecurity", "v1.0.4", "healthy"},
            {"Ransomware Detection", "cybersecurity", "v0.9.1", "degraded"},
            {"Finance Fraud Anomaly", "finance", "v1.1.0", "healthy"},
            {"Manufacturing Process Anomaly", "manufacturing", "v0.8.2", "offline"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminPolicies(),
        "Policies and Rules",
        {"Policy", "Domain", "Enforcement"},
        {
            {"Block on critical fraud score", "finance", "enforced"},
            {"Quarantine phishing senders", "cybersecurity", "enforced"},
            {"Log manufacturing drift events", "manufacturing", "monitor"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminMessaging(),
        "Messaging and Schemas",
        {"Subject", "Domain", "Status"},
        {
            {"cybersecurity.events.>", "cybersecurity", "connected"},
            {"finance.events.>", "finance", "connected"},
            {"manufacturing.events.>", "manufacturing", "degraded"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::automations(),
        "Automation and Playbooks",
        {"Playbook", "Domain", "Status", "Runs"},
        {
            {"Lock account on credential stuffing", "cybersecurity", "enabled", "12"},
            {"Freeze account on fraud score > 0.9", "finance", "enabled", "4"},
            {"Notify maintenance on process drift", "manufacturing", "disabled", "21"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminIntegrations(),
        "Integrations and Edge",
        {"Integration", "Type", "Status"},
        {
            {"MLflow", "model-registry", "connected"},
            {"NATS", "messaging", "connected"},
            {"Postgres", "database", "connected"},
            {"Slack", "notification", "disconnected"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminDataSources(),
        "Data and Storage",
        {"Source", "Domain", "Records"},
        {
            {"auth_logs", "cybersecurity", "4,820,000"},
            {"trade_events", "finance", "1,240,000"},
            {"sensor_telemetry", "manufacturing", "980,000"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminUsers(),
        "Users and Access",
        {"Name", "Email", "Role", "Status", "Client"},
        {
            {"Jamal Samba", "jamalsamba@gmail.com", "admin", "active", "web"},
            {"S. Rao", "s.rao@example.com", "analyst", "active", "app"},
            {"M. Chen", "m.chen@example.com", "analyst", "active", "web"},
            {"K. Novak", "k.novak@example.com", "viewer", "invited", "app"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminSecurity(),
        "Security",
        {"Event", "Actor", "Severity"},
        {
            {"Failed admin login", "unknown@203.0.113.4", "medium"},
            {"API key rotated", "jamalsamba@gmail.com", "low"},
            {"Suspicious admin permission change", "k.novak@example.com", "high"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminMetrics(),
        "Observability",
        {"Metric", "Value", "Trend"},
        {
            {"Inference p95 latency", "182 ms", "flat"},
            {"Events processed / min", "665", "up"},
            {"Error rate", "0.4%", "down"},
            {"NATS consumer lag", "12 msgs", "flat"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminDeployments(),
        "Deployments and Environments",
        {"Service", "Version", "Environment", "Status"},
        {
            {"inference-service", "v1.4.0", "production", "running"},
            {"cybersecurity-domain-service", "v1.1.2", "production", "running"},
            {"manufacturing-domain-service", "v0.9.0", "staging", "deploying"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminAudit(),
        "Audit and Compliance",
        {"Actor", "Action", "Target"},
        {
            {"jamalsamba@gmail.com", "Updated policy", "pol-1"},
            {"s.rao@example.com", "Deployed model version", "phishing_detection@1.0.4"},
            {"jamalsamba@gmail.com", "Invited user", "k.novak@example.com"},
        }));

    stackedWidget->addWidget(createDataPage(&api, specs::adminSettings(),
        "System Settings",
        {"Setting", "Value"},
        {
            {"Platform name", "AMCP Platform"},
            {"Maintenance mode", "off"},
            {"Data retention (days)", "90"},
            {"Default alert severity", "medium"},
        }));

    for (int i = 0; i < adminItems.size(); ++i) {
        const auto &item = adminItems[i];
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
