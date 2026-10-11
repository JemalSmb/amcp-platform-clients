#pragma once

#include <QJsonDocument>
#include <QPushButton>
#include <QStringList>
#include <QVector>
#include <QWidget>
#include <functional>

class ApiClient;
class QLabel;
class QTableWidget;
class QHBoxLayout;

struct Row {
    QString id;
    QStringList cells;
};

// What a page loads: endpoints (relative to the API or gateway base) and how
// JSON becomes table rows. Mirrors the web PlatformApiService / AdminApiService.
struct RemoteSpec {
    QStringList paths;
    bool gateway = false;
    std::function<QVector<Row>(const QVector<QJsonDocument> &)> map;
};

// Table page that loads from the API and falls back to sample rows when
// mock mode is on or the request fails.
class DataPage : public QWidget {
    Q_OBJECT
public:
    DataPage(ApiClient *api, const QString &title, const QStringList &headers,
             const QVector<QStringList> &fallbackRows, RemoteSpec spec, QWidget *parent = nullptr);

    ApiClient *api() const { return m_api; }
    QString selectedId() const;
    QString selectedCell(int column) const;
    QPushButton *addButton(const QString &label, std::function<void()> onClick);
    void reload();
    void showMessage(const QString &text);

protected:
    void showEvent(QShowEvent *event) override;

private:
    void fill(const QVector<Row> &rows);

    ApiClient *m_api;
    QStringList m_headers;
    QVector<QStringList> m_fallback;
    RemoteSpec m_spec;
    QTableWidget *m_table;
    QLabel *m_status;
    QHBoxLayout *m_actions;
    bool m_loaded = false;
};

namespace specs {
// User app
RemoteSpec home();
RemoteSpec alerts();
RemoteSpec incidents();
RemoteSpec detections();
RemoteSpec predictions();
RemoteSpec investigations();
RemoteSpec assets();
RemoteSpec automations();
RemoteSpec reports();
RemoteSpec notifications();
RemoteSpec profile();
RemoteSpec helpDocs();
RemoteSpec settings();
// Admin app
RemoteSpec adminControl();
RemoteSpec adminDomains();
RemoteSpec adminModels();
RemoteSpec adminPolicies();
RemoteSpec adminMessaging();
RemoteSpec adminIntegrations();
RemoteSpec adminDataSources();
RemoteSpec adminUsers();
RemoteSpec adminSecurity();
RemoteSpec adminMetrics();
RemoteSpec adminDeployments();
RemoteSpec adminAudit();
RemoteSpec adminSettings();
}  // namespace specs

// Creates the table page for a drawer entry and attaches its row actions.
DataPage *createDataPage(ApiClient *api, RemoteSpec spec, const QString &title, const QStringList &headers,
                         const QVector<QStringList> &fallbackRows);

// Row actions (same calls as the web pages).
void addAutomationActions(DataPage *page);
void addUserActions(DataPage *page);
