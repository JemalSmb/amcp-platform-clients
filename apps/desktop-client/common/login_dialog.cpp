#include "login_dialog.h"
#include "supabase_auth.h"

#include <QLabel>
#include <QLineEdit>
#include <QPushButton>
#include <QVBoxLayout>

LoginDialog::LoginDialog(SupabaseAuth *auth, const QString &title, bool allowSignup, QWidget *parent)
    : QDialog(parent), m_auth(auth), m_allowSignup(allowSignup) {
    setWindowTitle(title);
    setMinimumWidth(380);

    auto *layout = new QVBoxLayout(this);
    layout->setContentsMargins(28, 28, 28, 28);
    layout->setSpacing(12);

    auto *heading = new QLabel(title, this);
    heading->setStyleSheet("font-size: 22px; font-weight: 700; color: #00571A;");
    layout->addWidget(heading);

    m_name = new QLineEdit(this);
    m_name->setPlaceholderText("Full Name");
    m_email = new QLineEdit(this);
    m_email->setPlaceholderText("Email");
    m_password = new QLineEdit(this);
    m_password->setPlaceholderText("Password");
    m_password->setEchoMode(QLineEdit::Password);
    layout->addWidget(m_name);
    layout->addWidget(m_email);
    layout->addWidget(m_password);

    m_error = new QLabel(this);
    m_error->setStyleSheet("color: #dc2626;");
    m_error->setWordWrap(true);
    layout->addWidget(m_error);

    m_submit = new QPushButton(this);
    m_submit->setDefault(true);
    m_submit->setStyleSheet("background:#00571A; color:white; padding:8px; border-radius:6px;");
    layout->addWidget(m_submit);

    m_toggle = new QPushButton(this);
    m_toggle->setFlat(true);
    layout->addWidget(m_toggle);

    connect(m_submit, &QPushButton::clicked, this, &LoginDialog::submit);
    connect(m_password, &QLineEdit::returnPressed, this, &LoginDialog::submit);
    connect(m_toggle, &QPushButton::clicked, this, &LoginDialog::toggleMode);

    m_signupMode = true;
    toggleMode();
}

void LoginDialog::toggleMode() {
    m_signupMode = !m_signupMode;
    m_name->setVisible(m_signupMode);
    m_submit->setText(m_signupMode ? "Create Account" : "Login");
    m_toggle->setText(m_signupMode ? "Already have an account? Login"
                                   : "Don't have an account? Signup here");
    m_error->clear();
}

void LoginDialog::submit() {
    const QString email = m_email->text().trimmed();
    const QString password = m_password->text();
    if (email.isEmpty() || password.isEmpty()) {
        m_error->setText("Email and password are required.");
        return;
    }
    m_submit->setEnabled(false);
    const bool ok = m_signupMode ? m_auth->signUp(email, password, m_name->text().trimmed())
                                 : m_auth->login(email, password);
    m_submit->setEnabled(true);
    if (ok) {
        accept();
    } else {
        m_error->setText(m_auth->errorMessage());
    }
}
