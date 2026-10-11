#pragma once

#include <QObject>
#include <QString>

// Supabase Auth (GoTrue REST) client; persists the session in QSettings.
class SupabaseAuth : public QObject {
    Q_OBJECT
public:
    explicit SupabaseAuth(const QString &settingsPrefix, QObject *parent = nullptr);

    bool login(const QString &email, const QString &password);
    bool signUp(const QString &email, const QString &password, const QString &name);
    bool restoreSession();
    void logout();

    bool isLoggedIn() const { return !m_accessToken.isEmpty(); }
    QString accessToken() const { return m_accessToken; }
    QString email() const { return m_email; }
    QString errorMessage() const { return m_error; }

private:
    bool post(const QString &path, const QByteArray &body, QJsonObject &out);
    bool applySession(const QJsonObject &obj);
    void persist() const;

    QString m_prefix;
    QString m_accessToken;
    QString m_refreshToken;
    QString m_email;
    qint64 m_expiresAt = 0;
    QString m_error;
};
