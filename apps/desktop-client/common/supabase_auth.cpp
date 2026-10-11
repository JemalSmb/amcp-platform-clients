#include "supabase_auth.h"
#include "auth_config.h"

#include <QDateTime>
#include <QEventLoop>
#include <QJsonDocument>
#include <QJsonObject>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QSettings>
#include <QUrl>

SupabaseAuth::SupabaseAuth(const QString &settingsPrefix, QObject *parent)
    : QObject(parent), m_prefix(settingsPrefix) {}

bool SupabaseAuth::post(const QString &path, const QByteArray &body, QJsonObject &out) {
    QNetworkAccessManager nam;
    QNetworkRequest req(QUrl(supabaseUrl() + path));
    req.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    req.setRawHeader("apikey", supabaseAnonKey().toUtf8());

    QNetworkReply *reply = nam.post(req, body);
    QEventLoop loop;
    connect(reply, &QNetworkReply::finished, &loop, &QEventLoop::quit);
    loop.exec();

    const QByteArray data = reply->readAll();
    const bool ok = reply->error() == QNetworkReply::NoError;
    const QJsonObject obj = QJsonDocument::fromJson(data).object();
    if (!ok) {
        m_error = obj.value("error_description").toString(
            obj.value("msg").toString(obj.value("message").toString(reply->errorString())));
    }
    out = obj;
    reply->deleteLater();
    return ok;
}

bool SupabaseAuth::applySession(const QJsonObject &obj) {
    const QString token = obj.value("access_token").toString();
    if (token.isEmpty()) {
        return false;
    }
    m_accessToken = token;
    m_refreshToken = obj.value("refresh_token").toString();
    m_email = obj.value("user").toObject().value("email").toString(m_email);
    const qint64 expiresIn = obj.value("expires_in").toInteger(3600);
    m_expiresAt = QDateTime::currentSecsSinceEpoch() + expiresIn;
    persist();
    return true;
}

void SupabaseAuth::persist() const {
    QSettings s;
    s.setValue(m_prefix + "/accessToken", m_accessToken);
    s.setValue(m_prefix + "/refreshToken", m_refreshToken);
    s.setValue(m_prefix + "/email", m_email);
    s.setValue(m_prefix + "/expiresAt", m_expiresAt);
}

bool SupabaseAuth::login(const QString &email, const QString &password) {
    m_error.clear();
    QJsonObject out;
    const QByteArray body = QJsonDocument(QJsonObject{{"email", email}, {"password", password}}).toJson();
    if (!post("/auth/v1/token?grant_type=password", body, out)) {
        return false;
    }
    if (!applySession(out)) {
        m_error = "Login failed";
        return false;
    }
    return true;
}

bool SupabaseAuth::signUp(const QString &email, const QString &password, const QString &name) {
    m_error.clear();
    QJsonObject out;
    QJsonObject meta{{"client", "app"}};
    if (!name.isEmpty()) {
        meta.insert("full_name", name);
    }
    QJsonObject payload{{"email", email}, {"password", password}, {"data", meta}};
    if (!post("/auth/v1/signup", QJsonDocument(payload).toJson(), out)) {
        return false;
    }
    if (!applySession(out)) {
        m_error = "Check your email to confirm your account, then log in.";
        return false;
    }
    return true;
}

bool SupabaseAuth::restoreSession() {
    QSettings s;
    m_accessToken = s.value(m_prefix + "/accessToken").toString();
    m_refreshToken = s.value(m_prefix + "/refreshToken").toString();
    m_email = s.value(m_prefix + "/email").toString();
    m_expiresAt = s.value(m_prefix + "/expiresAt").toLongLong();

    if (m_accessToken.isEmpty()) {
        return false;
    }
    if (QDateTime::currentSecsSinceEpoch() < m_expiresAt - 30) {
        return true;
    }
    if (!m_refreshToken.isEmpty()) {
        QJsonObject out;
        const QByteArray body = QJsonDocument(QJsonObject{{"refresh_token", m_refreshToken}}).toJson();
        if (post("/auth/v1/token?grant_type=refresh_token", body, out) && applySession(out)) {
            return true;
        }
    }
    logout();
    return false;
}

void SupabaseAuth::logout() {
    m_accessToken.clear();
    m_refreshToken.clear();
    m_expiresAt = 0;
    QSettings s;
    s.remove(m_prefix);
}
