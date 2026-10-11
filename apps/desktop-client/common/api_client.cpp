#include "api_client.h"
#include "supabase_auth.h"

#include <QJsonObject>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QUrl>

ApiClient::ApiClient(SupabaseAuth *auth, QObject *parent) : QObject(parent), m_auth(auth) {}

void ApiClient::get(const QString &url, Callback cb) { send("GET", url, {}, std::move(cb)); }

void ApiClient::post(const QString &url, const QJsonObject &body, Callback cb) {
    send("POST", url, QJsonDocument(body).toJson(QJsonDocument::Compact), std::move(cb));
}

void ApiClient::put(const QString &url, const QJsonObject &body, Callback cb) {
    send("PUT", url, QJsonDocument(body).toJson(QJsonDocument::Compact), std::move(cb));
}

void ApiClient::send(const QString &method, const QString &url, const QByteArray &body, Callback cb) {
    m_auth->restoreSession();  // refreshes the token when it is about to expire

    QNetworkRequest req{QUrl(url)};
    req.setTransferTimeout(8000);
    req.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    if (m_auth->isLoggedIn()) {
        req.setRawHeader("Authorization", "Bearer " + m_auth->accessToken().toUtf8());
    }

    QNetworkReply *reply = method == "GET"    ? m_nam.get(req)
                           : method == "POST" ? m_nam.post(req, body)
                                              : m_nam.put(req, body);
    connect(reply, &QNetworkReply::finished, this, [reply, cb]() {
        const QByteArray data = reply->readAll();
        const bool ok = reply->error() == QNetworkReply::NoError;
        QString error;
        if (!ok) {
            const QJsonObject obj = QJsonDocument::fromJson(data).object();
            error = obj.value("detail").toString(reply->errorString());
        }
        cb(ok, QJsonDocument::fromJson(data), error);
        reply->deleteLater();
    });
}
