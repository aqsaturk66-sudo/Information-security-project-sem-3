# PhishShield — Intelligent Phishing Detection & Cyber Threat Analysis System
## Enterprise Cybersecurity Web Application Documentation

---

### 1. PROJECT OVERVIEW
**PhishShield** is an enterprise-grade full-stack cybersecurity web application engineered to protect internet users, organizations, students, and analysts from social engineering and deceptive cyber threat infrastructure. The platform provides transparent, deterministic, rule-based detection for suspicious URLs and malicious email bodies, paired with a threat explanation engine and security awareness curriculum.

---

### 2. PROBLEM STATEMENT
Phishing continues to serve as the initial access vector in over 80% of reported enterprise security breaches and identity theft incidents. Modern attackers leverage automated phishing kits (such as reverse-proxy credential harvesters), lookalike domain typosquatting, Internationalized Domain Name (IDN) homoglyph spoofing, and high-urgency psychological coercion. Ordinary users lack transparent tools that demystify *why* a particular communication is dangerous, while conventional security scanners often function as opaque black boxes or introduce severe privacy and security risks (e.g., triggering SSRF or visiting target exploit kits).

---

### 3. PROJECT OBJECTIVES
1. **Deterministic & Explainable Detection**: Deliver reliable, static rule-based heuristic threat detection with transparent mathematical score breakdowns.
2. **Safe Static Parsing**: Analyze URLs without performing network egress to target sites, preventing SSRF, remote JavaScript execution, and drive-by malware infections.
3. **Privacy-Preserving Architecture**: Enable email analysis without storing sensitive message bodies in plaintext databases.
4. **Multi-User Isolation & Audit Durability**: Enforce user data isolation on persistent SQLite ACID storage with zero cross-user information leakage.
5. **Educational Empowerment**: Provide an interactive threat encyclopedia and security awareness curriculum without quizzes, cultivating intuitive defensive habits.

---

### 4. COMPREHENSIVE FEATURES
- **URL Phishing Analyzer**:
  - RFC 3986 authority spoofing check (`@` credential diversion).
  - Shannon entropy calculation for algorithmically generated domains (DGA).
  - Typosquatting / lookalike detection via Levenshtein edit distance.
  - Subdomain tree depth and brand impersonation analysis.
  - High-abuse TLD detection and public URL shortener identification.
  - Insecure HTTP protocol vs deceptive HTTPS padlock triage.
  - Non-standard network port detection and double extension identification.
- **Email Phishing Analyzer**:
  - Credential harvesting prompt detection.
  - Real-time OTP / 2FA interception signature detection.
  - Business Email Compromise (BEC) and fake invoice lure recognition.
  - Psychological urgency, fear, and ultimatum detection.
  - Impersonal generic greeting markers.
  - Privacy-preserving storage (only preview excerpt and findings saved).
- **Security Operations Dashboard**:
  - Live metric counters: Total Scans, High-Risk Alerts, Suspicious Warnings, Average Score.
  - Recharts Risk Distribution pie chart.
  - Recharts 7-Day Activity Trend area chart.
  - Recent scans inspection table with deep report modal.
- **Threat Explanation Engine**:
  - Educational directory covering 8+ core attack vectors with definitions, attacker tactics, real-world examples, and defensive countermeasures.
- **Security Awareness Center**:
  - 8 in-depth, practical cybersecurity guides on passkeys, password managers, social engineering psychology, and 10-minute incident response triage.
- **Scan Audit History**:
  - Filterable, searchable personal history with individual deletion and full purge capabilities.
  - Export to JSON report.
- **Authentication & Security Controls**:
  - Bcrypt password hashing (10 salt rounds).
  - JWT Bearer token authorization.
  - Email verification workflow.
  - Safe password recovery with user enumeration defense.
  - User security event audit log.
- **Live Security Test Suite**:
  - Automated self-testing dashboard validating SSRF rejection, SQL injection defense, token tampering rejection, and user isolation.

---

### 5. TECHNOLOGY STACK
- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Lucide Icons, Recharts.
- **Backend**: Node.js 22, Express.js 4, TypeScript (`tsx`).
- **Database**: SQLite 3 using Node.js 22 built-in `node:sqlite` (`DatabaseSync`) in Write-Ahead Logging (WAL) mode for true ACID durability.
- **Cryptography**: `bcryptjs` for password hashing, `jsonwebtoken` for stateless token auth, `node:crypto` for cryptographic tokens.

---

### 6. SYSTEM ARCHITECTURE
```
[ Browser / Client (React 19 SPA) ]
                |  (REST API with Bearer JWT)
                v
[ Express 4 Full-Stack Server (server.ts : 3000) ]
   ├── Rate Limiting & Security Headers Middleware
   ├── Input Validation & SSRF Blocker
   ├── JWT Auth & User Ownership Middleware
   ├── Deterministic Heuristic Engines (URL & Email)
   └── Persistent SQLite ACID Storage (phishshield.db)
```

---

### 7. DATABASE DESIGN & SCHEMA
Stored in persistent `phishshield.db`:
- **`users` Table**:
  - `id` (TEXT PRIMARY KEY)
  - `email` (TEXT UNIQUE NOT NULL)
  - `display_name` (TEXT NOT NULL)
  - `password_hash` (TEXT NOT NULL, bcrypt)
  - `email_verified` (INTEGER DEFAULT 0)
  - `verification_token` (TEXT)
  - `reset_token` (TEXT)
  - `reset_token_expires` (INTEGER)
  - `created_at` (TEXT NOT NULL)
  - `updated_at` (TEXT NOT NULL)
- **`scans` Table**:
  - `id` (TEXT PRIMARY KEY)
  - `user_id` (TEXT NOT NULL, FK users.id ON DELETE CASCADE)
  - `scan_type` (TEXT NOT NULL: 'url' | 'email')
  - `input_summary` (TEXT NOT NULL)
  - `target_normalized` (TEXT)
  - `risk_level` (TEXT NOT NULL: 'LOW' | 'SUSPICIOUS' | 'HIGH')
  - `risk_score` (INTEGER NOT NULL)
  - `findings_json` (TEXT NOT NULL)
  - `recommendations_json` (TEXT NOT NULL)
  - `created_at` (TEXT NOT NULL)
- **`security_events` Table**:
  - `id` (TEXT PRIMARY KEY)
  - `user_id` (TEXT NOT NULL, FK users.id ON DELETE CASCADE)
  - `event_type` (TEXT NOT NULL: 'USER_REGISTERED', 'LOGIN_SUCCESS', 'URL_SCAN_PERFORMED', etc.)
  - `ip_address` (TEXT)
  - `user_agent` (TEXT)
  - `timestamp` (TEXT NOT NULL)

---

### 8. URL DETECTION METHODOLOGY
The URL Analyzer applies 15 static heuristic checks:
1. **Insecure HTTP Protocol**: +20 penalty points (unencrypted transit).
2. **Raw IP Hostname**: +45 penalty points (bypasses domain reputation).
3. **RFC Authority Spoofing (@)**: +60 penalty points (masks true destination host).
4. **Brand Impersonation in Subdomains**: +45 penalty points.
5. **Typosquatting Edit Distance**: +40 penalty points (Levenshtein distance <= 2).
6. **URL Shorteners**: +25 penalty points (destination concealment).
7. **High-Abuse TLDs**: +25 penalty points (.xyz, .tk, .top, .ml, etc.).
8. **Excessive Subdomain Stacking**: +20 penalty points (> 4 levels).
9. **Punycode / Homoglyph Characters**: +35 penalty points (`xn--` prefix).
10. **Multiple Concatenated Hyphens**: +20 penalty points.
11. **Excessive URL Length**: +20 penalty points (> 120 chars).
12. **High-Risk Action Keywords**: +10 to +30 penalty points.
13. **Non-Standard Network Port**: +20 penalty points.
14. **Double File Extension**: +45 penalty points (e.g. `.pdf.exe`).
15. **High Domain Shannon Entropy**: +20 penalty points (DGA detection).

**Risk Level Mapping**:
- 0 to 24: `LOW RISK`
- 25 to 59: `SUSPICIOUS`
- 60 to 100: `HIGH RISK`

---

### 9. EMAIL DETECTION METHODOLOGY
The Email Analyzer uses regex linguistic pattern analysis:
1. **Explicit Credential Requests**: (password, pin, credentials) -> CRITICAL (+50).
2. **OTP / 2FA Interception**: (one-time code, 6-digit sms token) -> CRITICAL (+50).
3. **Urgency & Coercive Ultimatums**: (within 24 hours, account locked, legal action) -> HIGH (+30).
4. **Fake Security Panic Alerts**: (suspicious sign-in detected, unauthorized transaction) -> HIGH (+25).
5. **Financial Lures & BEC**: (wire transfer, overdue invoice, Geek Squad renewal) -> HIGH (+30).
6. **Lottery & Inheritance Scams**: (lottery winner, millions of dollars) -> HIGH (+35).
7. **Generic Impersonal Greetings**: (Dear Customer, Attention Sir/Madam) -> LOW (+15).
8. **High-Profile Brand Mentions**: (PayPal, Microsoft, Apple Support) -> MEDIUM (+20).
9. **Malicious Attachment Mentions**: (attached .zip, .iso, enable macros) -> HIGH (+30).
10. **Vague Action Links**: ("click here to verify") -> MEDIUM (+15).

---

### 10. API REST ENDPOINTS
- `GET /api/health` — Service health check.
- `POST /api/auth/register` — User account registration with password validation.
- `POST /api/auth/login` — User authentication returning JWT token.
- `GET /api/auth/me` — Authenticated user profile lookup.
- `POST /api/auth/verify-email` — Email verification toggle.
- `POST /api/auth/forgot-password` — Safe password recovery request.
- `POST /api/auth/reset-password` — Password reset with crypto token.
- `POST /api/analyze/url` — Deterministic URL threat analysis.
- `POST /api/analyze/email` — Deterministic Email phishing analysis.
- `GET /api/dashboard/stats` — Real-time user statistics computed from database.
- `GET /api/scans` — Paginated user scan history with filters.
- `GET /api/scans/:id` — Scan detail report (with IDOR protection).
- `DELETE /api/scans/:id` — Delete single scan record.
- `DELETE /api/scans` — Clear all user scan records.
- `GET /api/profile` — User profile and audit event log.
- `PUT /api/profile` — Update display name and change password.
- `DELETE /api/profile` — Permanent account deletion with cascade.

---

### 11. UNIVERSITY VIVA & PRESENTATION DEMO CHEAT SHEET
- **Demo User 1**: `demo@phishshield.security` | Password: `Password@123`
- **Demo User 2 (Evaluator)**: `aqsaturk66@gmail.com` | Password: `Password@123`
- **Key Talking Points**:
  1. *Why rule-based rather than LLM-only?* Deterministic heuristics provide instant, reproducible, zero-cost, air-gapped detection with exact mathematical explanations that pass regulatory scrutiny.
  2. *How is SSRF prevented?* Built-in host validation rejects RFC 1918 private subnets, loopback interfaces (`127.0.0.1`), and cloud metadata (`169.254.169.254`).
  3. *How is privacy ensured?* Raw email messages are analyzed in memory and immediately discarded; only threat metadata is stored.
  4. *How is multi-tenancy secured?* Every database query incorporates `WHERE user_id = req.user.id` verified from cryptographically signed JWT tokens.
