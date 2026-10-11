#include "data_page.h"
#include "api_client.h"
#include "auth_config.h"

#include <QComboBox>
#include <QDialog>
#include <QDialogButtonBox>
#include <QFormLayout>
#include <QHBoxLayout>
#include <QHeaderView>
#include <QJsonArray>
#include <QJsonObject>
#include <QLabel>
#include <QLineEdit>
#include <memory>
#include <QTableWidget>
#include <QVBoxLayout>

namespace {

QString str(const QJsonValue &v) {
    if (v.isString()) return v.toString();
    if (v.isBool()) return v.toBool() ? "yes" : "no";
    if (v.isDouble()) return QString::number(v.toDouble(), 'g', 12);
    if (v.isNull() || v.isUndefined()) return "";
    const QJsonDocument doc = v.isArray() ? QJsonDocument(v.toArray()) : QJsonDocument(v.toObject());
    return QString::fromUtf8(doc.toJson(QJsonDocument::Compact));
}

QVector<Row> mapArray(const QJsonDocument &doc, const QStringList &fields) {
    QVector<Row> rows;
    for (const QJsonValue &item : doc.array()) {
        const QJsonObject o = item.toObject();
        Row r;
        r.id = str(o.value("id"));
        for (const QString &f : fields) r.cells << str(o.value(f));
        rows.append(r);
    }
    return rows;
}

RemoteSpec arraySpec(const QString &path, const QStringList &fields, bool gateway = false) {
    RemoteSpec s;
    s.paths = {path};
    s.gateway = gateway;
    s.map = [fields](const QVector<QJsonDocument> &d) { return mapArray(d.value(0), fields); };
    return s;
}

RemoteSpec objectSpec(const QString &path, const QVector<QPair<QString, QString>> &fields) {
    RemoteSpec s;
    s.paths = {path};
    s.map = [fields](const QVector<QJsonDocument> &d) {
        QVector<Row> rows;
        const QJsonObject o = d.value(0).object();
        for (const auto &f : fields) rows.append({"", {f.second, str(o.value(f.first))}});
        return rows;
    };
    return s;
}

QString domainHealth(const QJsonArray &entries, const QStringList &services) {
    int total = 0, up = 0;
    for (const QJsonValue &v : entries) {
        const QJsonObject o = v.toObject();
        if (services.contains(o.value("name").toString())) {
            ++total;
            if (o.value("status").toString() == "up") ++up;
        }
    }
    if (total == 0 || up == 0) return "down";
    return up == total ? "operational" : "degraded";
}

}  // namespace

namespace specs {

RemoteSpec home() {
    RemoteSpec s;
    s.paths = {"/v1/domains/status", "/v1/alerts?limit=500"};
    s.gateway = true;
    s.map = [](const QVector<QJsonDocument> &d) {
        const QVector<QPair<QString, QStringList>> domains = {
            {"cybersecurity", {"threat-detection", "phishing-detector"}},
            {"finance", {"fraud-detector"}},
            {"manufacturing", {"process-anomaly-detector"}},
            {"agriculture", {}},
        };
        QVector<Row> rows;
        for (const auto &dom : domains) {
            int alerts = 0;
            for (const QJsonValue &a : d.value(1).array()) {
                if (a.toObject().value("domain").toString() == dom.first) ++alerts;
            }
            rows.append({dom.first, {dom.first + " (" + domainHealth(d.value(0).array(), dom.second) + ")",
                                     QString::number(alerts), QString::number(alerts)}});
        }
        return rows;
    };
    return s;
}

RemoteSpec alerts() {
    RemoteSpec s;
    s.paths = {"/v1/alerts?limit=100"};
    s.gateway = true;
    s.map = [](const QVector<QJsonDocument> &d) {
        QVector<Row> rows;
        for (const QJsonValue &v : d.value(0).array()) {
            const QJsonObject e = v.toObject();
            const QJsonObject p = e.value("payload").toObject();
            QString title = p.value("title").toString(p.value("name").toString(e.value("event_type").toString()));
            rows.append({e.value("id").toString(),
                         {title, e.value("domain").toString(), e.value("severity").toString().toLower()}});
        }
        return rows;
    };
    return s;
}

RemoteSpec incidents() { return arraySpec("/incidents", {"title", "domain", "status", "assignee"}); }
RemoteSpec detections() { return arraySpec("/detections", {"signal", "modelId", "confidence"}); }
RemoteSpec predictions() { return arraySpec("/predictions", {"modelId", "domain", "label", "score"}); }
RemoteSpec investigations() { return arraySpec("/investigations", {"title", "domain", "status", "owner"}); }
RemoteSpec assets() { return arraySpec("/assets", {"name", "domain", "type", "risk"}); }
RemoteSpec automations() { return arraySpec("/automations", {"name", "domain", "status", "runCount"}); }
RemoteSpec reports() { return arraySpec("/reports", {"title", "domain", "period"}); }
RemoteSpec notifications() { return arraySpec("/notifications", {"message", "read"}); }
RemoteSpec helpDocs() { return arraySpec("/help-docs", {"title", "category"}); }
RemoteSpec profile() {
    return objectSpec("/profile", {{"name", "Name"}, {"email", "Email"}, {"role", "Role"}, {"timezone", "Timezone"}});
}
RemoteSpec settings() {
    return objectSpec("/settings", {{"theme", "Theme"},
                                    {"emailAlerts", "Email alerts"},
                                    {"alertSeverityThreshold", "Alert severity threshold"},
                                    {"refreshIntervalSeconds", "Refresh interval (s)"}});
}

RemoteSpec adminControl() { return arraySpec("/domains", {"name", "modelCount", "state"}); }
RemoteSpec adminDomains() { return arraySpec("/domains", {"name", "state", "description"}); }
RemoteSpec adminModels() { return arraySpec("/models", {"name", "domain", "version", "status"}); }
RemoteSpec adminPolicies() { return arraySpec("/policies", {"name", "domain", "enforcement"}); }
RemoteSpec adminMessaging() { return arraySpec("/messaging/channels", {"subject", "domain", "status"}); }
RemoteSpec adminIntegrations() { return arraySpec("/integrations", {"name", "type", "status"}); }
RemoteSpec adminDataSources() { return arraySpec("/data-sources", {"name", "domain", "recordCount"}); }
RemoteSpec adminUsers() { return arraySpec("/admin/users", {"name", "email", "role", "status", "client"}); }
RemoteSpec adminSecurity() { return arraySpec("/security/events", {"type", "actor", "severity"}); }
RemoteSpec adminMetrics() {
    RemoteSpec s;
    s.paths = {"/observability/metrics"};
    s.map = [](const QVector<QJsonDocument> &d) {
        QVector<Row> rows;
        for (const QJsonValue &v : d.value(0).array()) {
            const QJsonObject o = v.toObject();
            rows.append({o.value("id").toString(),
                         {o.value("name").toString(), str(o.value("value")) + " " + o.value("unit").toString(),
                          o.value("trend").toString()}});
        }
        return rows;
    };
    return s;
}
RemoteSpec adminDeployments() { return arraySpec("/deployments", {"service", "version", "environment", "status"}); }
RemoteSpec adminAudit() { return arraySpec("/audit-log", {"actor", "action", "target"}); }
RemoteSpec adminSettings() {
    return objectSpec("/admin/settings", {{"platformName", "Platform name"},
                                          {"maintenanceMode", "Maintenance mode"},
                                          {"dataRetentionDays", "Data retention (days)"},
                                          {"defaultAlertSeverity", "Default alert severity"}});
}

}  // namespace specs

DataPage::DataPage(ApiClient *api, const QString &title, const QStringList &headers,
                   const QVector<QStringList> &fallbackRows, RemoteSpec spec, QWidget *parent)
    : QWidget(parent), m_api(api), m_headers(headers), m_fallback(fallbackRows), m_spec(std::move(spec)) {
    auto *layout = new QVBoxLayout(this);
    layout->setContentsMargins(24, 24, 24, 24);
    layout->setSpacing(12);

    auto *top = new QHBoxLayout();
    top->addWidget(new QLabel(QString("<h2>%1</h2>").arg(title), this));
    top->addStretch();
    m_actions = new QHBoxLayout();
    top->addLayout(m_actions);
    auto *refresh = new QPushButton("Refresh", this);
    connect(refresh, &QPushButton::clicked, this, &DataPage::reload);
    top->addWidget(refresh);
    layout->addLayout(top);

    m_status = new QLabel(this);
    m_status->setStyleSheet("color: #6b7280;");
    layout->addWidget(m_status);

    m_table = new QTableWidget(0, headers.size(), this);
    m_table->setHorizontalHeaderLabels(headers);
    m_table->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
    m_table->verticalHeader()->setVisible(false);
    m_table->setEditTriggers(QAbstractItemView::NoEditTriggers);
    m_table->setSelectionBehavior(QAbstractItemView::SelectRows);
    m_table->setSelectionMode(QAbstractItemView::SingleSelection);
    layout->addWidget(m_table);

    QVector<Row> sample;
    for (const QStringList &cells : m_fallback) sample.append({"", cells});
    fill(sample);
}

void DataPage::showEvent(QShowEvent *event) {
    QWidget::showEvent(event);
    if (!m_loaded) {
        m_loaded = true;
        reload();
    }
}

void DataPage::showMessage(const QString &text) { m_status->setText(text); }

QString DataPage::selectedId() const {
    const int row = m_table->currentRow();
    return row < 0 || !m_table->item(row, 0) ? QString() : m_table->item(row, 0)->data(Qt::UserRole).toString();
}

QString DataPage::selectedCell(int column) const {
    const int row = m_table->currentRow();
    return row < 0 || !m_table->item(row, column) ? QString() : m_table->item(row, column)->text();
}

QPushButton *DataPage::addButton(const QString &label, std::function<void()> onClick) {
    auto *b = new QPushButton(label, this);
    connect(b, &QPushButton::clicked, this, [onClick]() { onClick(); });
    m_actions->addWidget(b);
    return b;
}

void DataPage::fill(const QVector<Row> &rows) {
    m_table->setRowCount(0);
    m_table->setRowCount(rows.size());
    for (int r = 0; r < rows.size(); ++r) {
        for (int c = 0; c < rows[r].cells.size() && c < m_headers.size(); ++c) {
            auto *item = new QTableWidgetItem(rows[r].cells[c]);
            if (c == 0) item->setData(Qt::UserRole, rows[r].id);
            m_table->setItem(r, c, item);
        }
    }
}

void DataPage::reload() {
    if (!m_spec.map || useMockData() || (m_spec.gateway && !useGatewayData())) {
        m_status->setText("Showing sample data (mock mode)");
        return;
    }
    const QString base = m_spec.gateway ? gatewayBaseUrl() : apiBaseUrl();
    if (base.isEmpty()) {
        m_status->setText("Showing sample data (API_BASE_URL not set)");
        return;
    }

    m_status->setText("Loading...");
    auto docs = std::make_shared<QVector<QJsonDocument>>(m_spec.paths.size());
    auto pending = std::make_shared<int>(m_spec.paths.size());
    auto failed = std::make_shared<QString>();

    for (int i = 0; i < m_spec.paths.size(); ++i) {
        m_api->get(base + m_spec.paths[i], [this, i, docs, pending, failed](bool ok, const QJsonDocument &doc, const QString &err) {
            if (!ok) *failed = err;
            (*docs)[i] = doc;
            if (--(*pending) > 0) return;
            if (!failed->isEmpty()) {
                m_status->setText("Could not reach the API (" + *failed + ") - showing sample data");
                return;
            }
            fill(m_spec.map(*docs));
            m_status->clear();
        });
    }
}

void addAutomationActions(DataPage *page) {
    page->addButton("Enable / Disable", [page]() {
        const QString id = page->selectedId();
        if (id.isEmpty()) {
            page->showMessage("Select a playbook first.");
            return;
        }
        const QString next = page->selectedCell(2) == "enabled" ? "disabled" : "enabled";
        page->api()->post(apiBaseUrl() + "/automations/" + id + "/status", {{"status", next}},
                          [page](bool ok, const QJsonDocument &, const QString &err) {
                              if (ok) page->reload();
                              else page->showMessage("Update failed: " + err);
                          });
    });
}

void addUserActions(DataPage *page) {
    page->addButton("Add user", [page]() {
        QDialog dlg(page);
        dlg.setWindowTitle("Add user");
        auto *form = new QFormLayout(&dlg);
        auto *name = new QLineEdit(&dlg);
        auto *email = new QLineEdit(&dlg);
        auto *password = new QLineEdit(&dlg);
        password->setEchoMode(QLineEdit::Password);
        password->setPlaceholderText("Temporary password (min 8)");
        auto *role = new QComboBox(&dlg);
        role->addItems({"viewer", "analyst", "admin"});
        form->addRow("Full name", name);
        form->addRow("Email", email);
        form->addRow("Password", password);
        form->addRow("Role", role);
        auto *buttons = new QDialogButtonBox(QDialogButtonBox::Ok | QDialogButtonBox::Cancel, &dlg);
        form->addRow(buttons);
        QObject::connect(buttons, &QDialogButtonBox::accepted, &dlg, &QDialog::accept);
        QObject::connect(buttons, &QDialogButtonBox::rejected, &dlg, &QDialog::reject);
        if (dlg.exec() != QDialog::Accepted) return;

        page->api()->post(apiBaseUrl() + "/admin/users",
                          {{"name", name->text().trimmed()},
                           {"email", email->text().trimmed()},
                           {"password", password->text()},
                           {"role", role->currentText()}},
                          [page](bool ok, const QJsonDocument &, const QString &err) {
                              if (ok) page->reload();
                              else page->showMessage("Could not create user: " + err);
                          });
    });

    page->addButton("Suspend / Reinstate", [page]() {
        const QString id = page->selectedId();
        if (id.isEmpty()) {
            page->showMessage("Select a user first.");
            return;
        }
        const QString next = page->selectedCell(3) == "suspended" ? "active" : "suspended";
        page->api()->post(apiBaseUrl() + "/admin/users/" + id + "/status", {{"status", next}},
                          [page](bool ok, const QJsonDocument &, const QString &err) {
                              if (ok) page->reload();
                              else page->showMessage("Update failed: " + err);
                          });
    });
}

DataPage *createDataPage(ApiClient *api, RemoteSpec spec, const QString &title, const QStringList &headers,
                         const QVector<QStringList> &fallbackRows) {
    auto *page = new DataPage(api, title, headers, fallbackRows, std::move(spec));
    if (title == "Users and Access") addUserActions(page);
    if (title == "Automation Runs" || title == "Automation and Playbooks") addAutomationActions(page);
    return page;
}
