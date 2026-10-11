#pragma once

#include <QJsonDocument>
#include <QNetworkAccessManager>
#include <QObject>
#include <QString>
#include <functional>

class SupabaseAuth;

// Async JSON client for the platform API / gateway; adds the Supabase bearer token.
class ApiClient : public QObject {
    Q_OBJECT
public:
    using Callback = std::function<void(bool ok, const QJsonDocument &doc, const QString &error)>;

    explicit ApiClient(SupabaseAuth *auth, QObject *parent = nullptr);

    void get(const QString &url, Callback cb);
    void post(const QString &url, const QJsonObject &body, Callback cb);
    void put(const QString &url, const QJsonObject &body, Callback cb);

private:
    void send(const QString &method, const QString &url, const QByteArray &body, Callback cb);

    SupabaseAuth *m_auth;
    QNetworkAccessManager m_nam;
};
