#pragma once

#include <QDialog>

class QLabel;
class QLineEdit;
class QPushButton;
class SupabaseAuth;

// Login / signup dialog; exec() is Accepted once a session exists.
class LoginDialog : public QDialog {
    Q_OBJECT
public:
    LoginDialog(SupabaseAuth *auth, const QString &title, bool allowSignup = true,
                QWidget *parent = nullptr);

private:
    void submit();
    void toggleMode();

    SupabaseAuth *m_auth;
    bool m_signupMode = false;
    bool m_allowSignup;
    QLabel *m_error;
    QLineEdit *m_name;
    QLineEdit *m_email;
    QLineEdit *m_password;
    QPushButton *m_submit;
    QPushButton *m_toggle;
};
