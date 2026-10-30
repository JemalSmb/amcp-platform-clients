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

    QStringList candidates;
    const QDir currentDir = QDir::current();
    const QString appDir = QCoreApplication::applicationDirPath();

    candidates << currentDir.filePath(".env");
    candidates << appDir + "/.env";
    candidates << appDir + "/../.env";
    candidates << appDir + "/../../.env";
    candidates << appDir + "/../../../.env";

    const QString currentPath = currentDir.absolutePath();
    const QStringList extraRoots = {currentPath, appDir, QDir(appDir).filePath(".."), QDir(appDir).filePath("../..")};
    for (const QString &root : extraRoots) {
        candidates << QDir(root).filePath(".env");
    }

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

inline QString trimPath(const QString &input) {
    QString out = input;
    while (out.startsWith('/')) out.remove(0, 1);
    while (out.endsWith('/')) out.chop(1);
    return out;
}

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
