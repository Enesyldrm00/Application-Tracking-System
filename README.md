<div align="center">

# 🏛️ Application Tracking System

**Kamu Başvuru Yönetim Platformu — Role-Based Access Control ile Güçlendirilmiş**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

*Vatandaşların başvuru gönderdiği, memurin yönetip onayladığı tam yığınlı (full-stack) bir e-devlet simülasyonu.*

</div>

---

## 📋 İçindekiler

- [Proje Özeti](#-proje-özeti)
- [Öne Çıkan Özellikler](#-öne-çıkan-özellikler)
- [Tech Stack](#-tech-stack)
- [Sistem Mimarisi](#-sistem-mimarisi)
- [Klasör Yapısı](#-klasör-yapısı)
- [API Endpoints](#-api-endpoints)
- [Veritabanı Şeması](#-veritabanı-şeması)
- [Kurulum & Çalıştırma](#-kurulum--çalıştırma)
- [Ortam Değişkenleri](#-ortam-değişkenleri)
- [Yazar](#-yazar)

---

## 🎯 Proje Özeti

**Application Tracking System**, vatandaşların resmi başvurularını dijital ortamda iletmelerini ve memurlerin bu başvuruları merkezi bir panelden yönetmelerini sağlayan bir web uygulamasıdır.

Sistem iki farklı kullanıcı rolüne sahiptir:

| Rol | Yetki Kapsamı |
|---|---|
| 👤 **Vatandaş** | Kayıt/giriş, başvuru oluşturma, kendi başvurularını görüntüleme |
| 🏢 **Memur** | Tüm başvuruları listeleme, başvuruları **onaylama** veya **reddetme** |

Her kullanıcının kimliği **JSON Web Token (JWT)** ile doğrulanır. Rol bazlı erişim kontrolü (RBAC) sayesinde bir vatandaş, asla memur paneline erişemez.

---

## ✨ Öne Çıkan Özellikler

- 🔐 **JWT Authentication** — Her istekte `Authorization: Bearer <token>` başlığı ile kimlik doğrulaması
- 🛡️ **Role-Based Access Control (RBAC)** — `authMiddleware` + `roleCheckMiddleware` çift katmanlı güvenlik
- 🔒 **bcrypt Şifreleme** — Kullanıcı şifreleri salt-10 ile hashlenir, düz metin hiçbir zaman veritabanına yazılmaz
- 🗄️ **PostgreSQL + Connection Pool** — `pg.Pool` ile verimli ve güvenli veritabanı bağlantısı
- ⚡ **Dynamic UI Update** — Başvuru sonrası liste otomatik yenilenir (`getApplications()` çağrısı)
- 🌐 **Vanilla Frontend** — Sıfır framework bağımlılığı; sade, hızlı ve öğretilebilir HTML/JS/CSS
- 📦 **Environment Variables** — Tüm hassas bilgiler `dotenv` ile yönetilir, kaynak koda gömülmez

---

## 🛠 Tech Stack

| Katman | Teknoloji | Kullanım Amacı |
|---|---|---|
| **Runtime** | Node.js v18+ | Sunucu tarafı JavaScript çalışma ortamı |
| **Web Framework** | Express.js v5 | HTTP sunucusu, routing, middleware zinciri |
| **Veritabanı** | PostgreSQL | İlişkisel veri saklama (kullanıcılar & başvurular) |
| **ORM/Driver** | node-postgres (pg) | PostgreSQL bağlantısı ve parameterized queries |
| **Kimlik Doğrulama** | jsonwebtoken (JWT) | Stateless token üretimi ve doğrulama |
| **Şifreleme** | bcryptjs | Kullanıcı şifrelerinin güvenli hashlemesi |
| **Config Yönetimi** | dotenv | Ortam değişkenlerini `.env` dosyasından yükleme |
| **Geliştirme Aracı** | nodemon | Dosya değişikliklerini izleyerek sunucuyu otomatik yeniden başlatma |
| **Frontend** | Vanilla JS + CSS | DOM manipülasyonu, Fetch API, responsive arayüz |

---

## 🏗 Sistem Mimarisi

Proje, klasik **MVC (Model-View-Controller)** mimarisini ve ayrılmış **Middleware** katmanını uygular:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                     │
│                    public/index.html + script.js             │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP Request (+ Bearer Token)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        EXPRESS APP (app.js)                  │
│            cors() │ express.json() │ express.static()        │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┴────────────────┐
           │                                │
           ▼                                ▼
┌─────────────────────┐         ┌──────────────────────────┐
│   /api/users        │         │   /send/applications     │
│   userRoutes.js     │         │   applicationRoutes.js   │
└──────────┬──────────┘         └────────────┬─────────────┘
           │                                 │
           │                    ┌────────────▼─────────────┐
           │                    │    authMiddleware.js      │
           │                    │  (JWT Token Doğrulama)   │
           │                    └────────────┬─────────────┘
           │                                 │
           │                    ┌────────────▼─────────────┐
           │                    │  roleCheckMiddleware.js   │
           │                    │  (Sadece memur rotaları)  │
           │                    └────────────┬─────────────┘
           │                                 │
           ▼                                 ▼
┌─────────────────────┐         ┌──────────────────────────┐
│  userControllers.js │         │ applicationControllers.js│
│  - registerUser     │         │ - createApplication      │
│  - loginUser        │         │ - usersGetApplication    │
└──────────┬──────────┘         │ - adminGetApplication    │
           │                    │ - updateApplication      │
           │                    └────────────┬─────────────┘
           │                                 │
           └─────────────┬───────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │    userDatabase.js     │
            │    PostgreSQL Pool     │
            └────────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  PostgreSQL Database   │
            │  kullanicilar tablosu  │
            │  basvurular tablosu    │
            └────────────────────────┘
```

### Middleware Zinciri Akışı

- **Herkese Açık** (no middleware): `POST /api/users/register`, `POST /api/users/login`
- **Sadece Giriş Yapmış Kullanıcılar** (`authMiddleware`): `POST /create`, `GET /get`
- **Sadece Memurlar** (`authMiddleware` → `roleCheckMiddleware`): `GET /allGet`, `PATCH /update/:id`

---

## 📁 Klasör Yapısı

```
Application Tracking System/
│
├── 📄 app.js                         # Uygulama giriş noktası; Express, CORS, route tanımlamaları
├── 📄 package.json                   # Proje bağımlılıkları ve npm script'leri
├── 📄 .env                           # Ortam değişkenleri (DB bağlantısı, JWT secret)
├── 📄 .gitignore                     # Git'e gönderilmeyecek dosyalar (node_modules, .env)
│
├── 📂 public/                        # Frontend (Express tarafından statik olarak sunulur)
│   ├── 📄 index.html                 # Tek sayfalık uygulama yapısı (login, kayıt, başvuru paneli)
│   ├── 📄 script.js                  # Fetch API çağrıları, DOM manipülasyonu, token yönetimi
│   └── 📄 style.css                  # Arayüz stilleri
│
└── 📂 src/                           # Backend kaynak kodu
    │
    ├── 📂 controllers/               # İş mantığı katmanı (C in MVC)
    │   ├── 📄 userControllers.js     # registerUser, loginUser (bcrypt + JWT)
    │   └── 📄 applicationControllers.js  # createApplication, usersGetApplication,
    │                                     # adminGetApplication, updateApplication
    │
    ├── 📂 middlewares/               # Ara katman (Güvenlik kapıları)
    │   ├── 📄 authMiddleware.js      # JWT doğrulama; req.user'ı ayarlar
    │   └── 📄 roleCheckMiddleware.js # Rol kontrolü; sadece 'memur' geçebilir
    │
    ├── 📂 routes/                    # URL yönlendirme katmanı (Router)
    │   ├── 📄 userRoutes.js          # /register, /login endpoint'leri
    │   └── 📄 applicationRoutes.js   # /create, /get, /allGet, /update/:id endpoint'leri
    │
    └── 📂 db/                        # Veritabanı bağlantı katmanı
        └── 📄 userDatabase.js        # PostgreSQL Pool konfigürasyonu (dotenv ile)
```

---

## 🔌 API Endpoints

### 👤 Kullanıcı İşlemleri — `/api/users`

| Method | Endpoint | Açıklama | Auth |
|---|---|---|---|
| `POST` | `/api/users/register` | Yeni kullanıcı kaydı | ❌ Yok |
| `POST` | `/api/users/login` | Giriş; başarıda JWT token döner | ❌ Yok |

**Register Request Body:**
```json
{
  "tckn": "12345678901",
  "ad_soyad": "Ali Veli",
  "sifre_hash": "sifrem123"
}
```

**Login Response (Başarılı):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Giriş gerçekleşti"
}
```

---

### 📄 Başvuru İşlemleri — `/send/applications`

| Method | Endpoint | Açıklama | Auth | Rol |
|---|---|---|---|---|
| `POST` | `/send/applications/create` | Yeni başvuru oluştur | ✅ JWT | Vatandaş |
| `GET` | `/send/applications/get` | Kendi başvurularımı listele | ✅ JWT | Vatandaş |
| `GET` | `/send/applications/allGet` | **Tüm** başvuruları listele | ✅ JWT | Memur |
| `PATCH` | `/send/applications/update/:id` | Başvuru durumunu güncelle | ✅ JWT | Memur |

**Authorization Header (tüm korumalı istekler için):**
```
Authorization: Bearer <JWT_TOKEN>
```

**Update Request Body:**
```json
{
  "durum": "onaylandi"
}
```
> Geçerli durum değerleri: `"onaylandi"` | `"reddedildi"`

---

## 🗄 Veritabanı Şeması

Aşağıdaki SQL komutlarını PostgreSQL'de çalıştırarak tabloları oluşturun:

```sql
-- Kullanıcılar tablosu
CREATE TABLE kullanicilar (
    id          SERIAL PRIMARY KEY,
    tckn        VARCHAR(11) UNIQUE NOT NULL,
    ad_soyad    VARCHAR(100) NOT NULL,
    sifre_hash  TEXT NOT NULL,
    rol         VARCHAR(20) DEFAULT 'vatandas'  -- 'vatandas' | 'memur'
);

-- Başvurular tablosu
CREATE TABLE basvurular (
    id           SERIAL PRIMARY KEY,
    baslik       VARCHAR(255) NOT NULL,
    icerik       TEXT NOT NULL,
    durum        VARCHAR(50) DEFAULT 'beklemede',  -- 'beklemede' | 'onaylandi' | 'reddedildi'
    vatandas_id  INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- Memur rolü için örnek kullanıcı ataması
-- (Bir kullanıcıyı memur yapmak için)
UPDATE kullanicilar SET rol = 'memur' WHERE tckn = '11111111111';
```

**Tablo İlişkisi:**
```
kullanicilar (1) ──────< basvurular (N)
    id ◄─────────────── vatandas_id
```

---

## 🚀 Kurulum & Çalıştırma

### Ön Koşullar

- **Node.js** v18 veya üzeri
- **PostgreSQL** v13 veya üzeri (çalışıyor olmalı)
- **npm** v8+

### Adım Adım Kurulum

**1. Depoyu klonlayın:**
```bash
git clone https://github.com/Enesyldrm00/Application-Tracking-System.git
cd Application-Tracking-System
```

**2. Bağımlılıkları yükleyin:**
```bash
npm install
```

**3. `.env` dosyasını yapılandırın:**
```bash
# Projenin kök dizininde .env dosyası oluşturun
cp .env.example .env  # veya manuel olarak düzenleyin
```
> Detaylar için [Ortam Değişkenleri](#-ortam-değişkenleri) bölümüne bakın.

**4. PostgreSQL veritabanını oluşturun:**
```sql
-- psql veya pgAdmin üzerinden:
CREATE DATABASE "AppTrackingSystem";
-- Ardından Veritabanı Şeması bölümündeki SQL komutlarını çalıştırın.
```

**5. Sunucuyu başlatın:**
```bash
# Geliştirme modu (nodemon ile — dosya değişikliklerini izler)
npm run dev

# Üretim modu
npm start
```

**6. Uygulamayı açın:**
```
http://localhost:3000
```

---

## ⚙️ Ortam Değişkenleri

Proje kök dizininde bir `.env` dosyası oluşturun ve aşağıdaki değerleri doldurun:

```env
# PostgreSQL Veritabanı Bağlantısı
DB_USER=postgres
DB_HOST=localhost
DB_NAME=AppTrackingSystem
DB_PASSWORD=your_password_here
DB_PORT=5432

# JWT İmzalama Anahtarı (tahmin edilemez, uzun bir string kullanın)
SECRET_KEY=your_super_secret_jwt_key_here
```

> ⚠️ **Güvenlik Uyarısı:** `.env` dosyasını asla Git'e commit etmeyin. `.gitignore` dosyanızda bu dosyanın listelendiğinden emin olun.

---

## 👨‍💻 Yazar

**Muhammed Enes Yıldırım**

[![GitHub](https://img.shields.io/badge/GitHub-Enesyldrm00-181717?style=flat-square&logo=github)](https://github.com/Enesyldrm00)

---

<div align="center">
  <sub>Bu proje Node.js, Express ve PostgreSQL öğrenme sürecinde geliştirilmiştir.</sub>
</div>
