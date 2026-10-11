#pragma once

#include <QByteArray>
#include <QCoreApplication>
#include <QDir>
#include <QFile>
#include <QString>

// Reads KEY from the process environment, then from a .env file in the working or app directory.
inline QString envValue(const QString &key) {
    const QByteArray fromEnv = qgetenv(key.toUtf8().constData());
    if (!fromEnv.isEmpty()) {
        return QString::fromUtf8(fromEnv);
    }
    const QStringList candidates = {QDir::current().filePath(".env"),
                                    QCoreApplication::applicationDirPath() + "/.env"};
    for (const QString &path : candidates) {
        QFile file(path);
        if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
            continue;
        }
        while (!file.atEnd()) {
            const QString line = QString::fromUtf8(file.readLine()).trimmed();
            const int eq = line.indexOf('=');
            if (eq > 0 && line.left(eq).trimmed() == key) {
                QString value = line.mid(eq + 1).trimmed();
                if (value.size() >= 2 && (value.startsWith('"') || value.startsWith('\'')) &&
                    value.endsWith(value[0])) {
                    value = value.mid(1, value.size() - 2);
                }
                return value;
            }
        }
    }
    return {};
}

inline QString supabaseUrl() { return envValue("SUPABASE_URL"); }
inline QString supabaseAnonKey() { return envValue("SUPABASE_ANON_KEY"); }

inline QString apiBaseUrl() { return envValue("API_BASE_URL"); }
inline QString gatewayBaseUrl() {
    const QString v = envValue("GATEWAY_BASE_URL");
    return v.isEmpty() ? apiBaseUrl() : v;
}
inline bool envFlag(const QString &key, bool fallback) {
    const QString v = envValue(key).toLower();
    return v.isEmpty() ? fallback : (v == "1" || v == "true" || v == "yes");
}
inline bool useMockData() { return envFlag("USE_MOCK_DATA", false); }
inline bool useGatewayData() { return envFlag("USE_GATEWAY_DATA", true); }
