# 📚 LEARNING.md — Teknik Derinlik Günlüğü
### Application Tracking System | Mimari, Hatalar ve Çözümler

> Bu dosya bir "öğrenme günlüğü"dür. Projeyi geliştirirken karşılaşılan zorluklar, alınan kararlar ve kazanılan içgörüler burada dokümante edilmektedir. Sadece kod yazan değil, **neden böyle çalıştığını anlayan** bir geliştirici olmak için.

---

## Bölüm 1 — Mimari Akış: Bir İstek Nasıl Yolculuk Eder?

### 🗺️ "Request Journey" — Frontend'den Veritabanına

Bir kullanıcı "Başvuruyu İlet" butonuna bastığı andan itibaren ne olur? Her durağı adım adım inceleyelim:

```
[1] KULLANICI BUTONA BASAR
     public/script.js → createApplication() fonksiyonu tetiklenir

[2] TOKEN KONTROLÜ (Frontend)
     localStorage.getItem('token') → Token yoksa işlem durdurulur, kullanıcı uyarılır

[3] HTTP İSTEĞİ GÖNDERİLİR
     fetch('/send/applications/create', {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ baslik, icerik })
     })

[4] EXPRESS SUNUCUSUNA ULAŞIR (app.js)
     app.use('/send/applications', applicationRoutes)
     → İstek applicationRoutes.js'e yönlendirilir

[5] ROUTE TANIMLANIR (applicationRoutes.js)
     router.post("/create", authMiddleware, applicationControllers.createApplication)
     → Middleware zinciri başlar

[6] 1. DURAK: authMiddleware.js (Kimlik Kontrolü)
     - Authorization header'ı okunur
     - "Bearer <TOKEN>" formatından TOKEN ayrıştırılır
     - jwt.verify(token, SECRET_KEY) ile token doğrulanır
     - Geçerliyse: req.user = { id, rol } → next() çağrılır
     - Geçersizse: 403 döner, yolculuk biter

[7] 2. DURAK: Controller (applicationControllers.js)
     - req.user.id ile vatandaşın kimliği alınır (middleware'den geliyor!)
     - req.body'den { baslik, icerik } alınır
     - pool.query() ile SQL INSERT çalıştırılır

[8] VERİTABANI (PostgreSQL)
     INSERT INTO "basvurular" (baslik, icerik, vatandas_id) VALUES ($1, $2, $3)
     → Kayıt oluşturulur

[9] CEVAP GERİ DÖNER
     res.status(201).json({ success: true, message: "Başvuru gerçekleşti" })
     → Frontend'deki fetch() bunu yakalar

[10] UI GÜNCELLENIR (script.js)
      if (response.ok) → getApplications() çağrılır → Liste otomatik yenilenir
```

### 🔒 Memur Rotasındaki Ek Durak

`/allGet` ve `/update/:id` endpoint'leri için yolculuğa bir durak daha eklenir:

```
... [6] authMiddleware → req.user ayarlanır
    [6.5] roleCheckMiddleware
           - req.user.rol !== 'memur' ise → 403 döner
           - req.user.rol === 'memur' ise → next() çağrılır
    [7] adminGetApplication controller çalışır
```

---

## Bölüm 2 — Senior Developer Trickler: Kritik Hatalar ve Çözümleri

### 🔴 Hata #1: `Cannot set headers after they are sent to the client`

**Ne Zaman Karşılaşılır?**
Bir controller fonksiyonu içinde `return` kullanmadan birden fazla `res.json()` veya `res.send()` çağrıldığında.

**Hatalı Kod Örneği:**
```javascript
const loginUser = async (req, res) => {
    if (result.rows.length === 0) {
        res.status(404).json({ message: "Kullanıcı bulunamadı" }); // ❌ return yok!
    }
    // Kod buraya da düşer, ikinci bir res.json() daha çalışır
    res.status(200).json({ message: "..." }); // ❌ Çöküş!
};
```

**Doğru Çözüm:**
```javascript
if (result.rows.length === 0) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" }); // ✅ return ile fonksiyonu kes
}
```

**Neden Olur?**
HTTP protokolü bir isteğe sadece **bir** cevap gönderilmesine izin verir. `return` kullanılmazsa JavaScript kodu çalışmaya devam eder ve ikinci bir cevap göndermeye çalışır. Node.js bu durumu hata olarak fırlatır.

**Proje İçindeki Uygulama:** `loginUser` ve `updateApplication` fonksiyonlarındaki her `if` bloğu `return res.status(...)` ile sonlandırılmıştır.

---

### 🔴 Hata #2: `Missing await` — Asenkron Operasyonlarda Tuzak

**Ne Zaman Karşılaşılır?**
`async` fonksiyon içindeki veritabanı sorgusuna veya `bcrypt`/`jwt` çağrısına `await` eklemeyi unutunca.

**Hatalı Kod Örneği:**
```javascript
const karmaSifre = bcrypt.hash(sifre_hash, 10); // ❌ await YOK!
// karmaSifre artık gerçek hash değil, bir Promise nesnesidir!
// Veritabanına "[object Promise]" kaydedilir.
```

**Doğru Çözüm:**
```javascript
const karmaSifre = await bcrypt.hash(sifre_hash, 10); // ✅ gerçek hash string döner
```

**Neden Olur?**
`bcrypt.hash()`, `jwt.sign()`, `pool.query()` gibi işlevlerin tümü asenkrondur — yani sonucu hemen değil, biraz sonra dönerler (bir `Promise` olarak). `await` yazmazsak JavaScript o Promise'i beklemeden bir sonraki satıra geçer.

**Altın Kural:** `async` bir fonksiyon içinde I/O işlemi yapan (veritabanı, şifre, token) tüm çağrılara `await` ekle.

---

### 🔴 Hata #3: JWT State Sorunu — Token Eksik veya Tanımsız

**Ne Zaman Karşılaşılır?**
Başarılı login sonrası token localStorage'a kaydedilmez ya da sonraki istekte header'a eklenmez.

**Nasıl Yakalanır?** (Projemizdeki debug kodu)
```javascript
// getAllApplications() fonksiyonundaki debug satırı:
console.log("HAFIZADAKİ TOKEN NEDİR? ->", token);

if(!token || token === "undefined") {
    console.error("KRAL DİKKAT: Token boş veya tanımsız geliyor!");
    return;
}
```

**Sorunun Kökü:**
```javascript
// ❌ Hatalı: Token kaydedilmiyor
const data = await response.json();
// localStorage.setItem('token', data.token) → Bu satır unutulmuş!

// ✅ Doğru (projemizde uygulandığı hali):
if (response.ok) {
    localStorage.setItem('token', data.token); // Token hemen saklanır
}
```

**Header'a Eklenirken:**
```javascript
// ❌ Hatalı:
headers: { 'Authorization': `Bearer ` } // Token değişkeni eksik veya undefined

// ✅ Doğru:
headers: { 'Authorization': `Bearer ${token}` } // Template literal ile birleştirilir
```

**Neden `"undefined"` string olarak gelir?**
`localStorage.setItem('token', undefined)` çağrısı, `undefined`'ı string'e çevirip `"undefined"` olarak kaydeder. Bu yüzden `token === "undefined"` kontrolü şarttır.

---

### 🟡 Teknik İncelik: Neden `jwt.sign()` await ile kullanıldı?

```javascript
const token = await jwt.sign(
    { id: result.rows[0].id, rol: result.rows[0].rol },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
);
```

`jwt.sign()` callback almadan (synchronous) çalışabilir, ancak `await` ile kullanmak hem tutarlılık sağlar hem de `async/await` zincirine entegre olur. `jwt.verify()` ise gerçekten asenkron bir bağlamda çalıştırılması için `try/catch` + `await` ile sarılmıştır — bu sayede geçersiz token durumu `catch` bloğuna düşer ve 403 döner.

---

## Bölüm 3 — Frontend-Backend Köprüsü

### 🌉 Token Tabanlı Yetkilendirme Neden Hayati Önem Taşır?

**Geleneksel Session Problemi:**
- Sunucu her kullanıcı için session tutmak zorunda kalır (bellek kullanımı artar)
- Sunucu ölürse tüm sessionlar kaybolur (ölçeklendirme sorunu)

**JWT'nin Çözümü:**
```
[LOGIN] Sunucu → Token üretir → Frontend'e gönderir → localStorage'a kaydedilir
[SONRAKI İSTEK] Frontend → Token'ı Authorization header'a koyar → Sunucu doğrular
```

Sunucu artık hiçbir şey "hatırlamak" zorunda değildir. Token kendi içinde `{ id, rol, exp }` verilerini taşır ve her istekte doğrulanır. Bu yapıya **Stateless Authentication** denir.

**Projemizdeki Token Payload (Decode Edilmiş):**
```json
{
  "id": 3,
  "rol": "vatandas",
  "iat": 1712000000,
  "exp": 1712003600
}
```
`iat` = issued at (oluşturulma zamanı), `exp` = expiration (sona erme zamanı, 1 saat sonra)

---

### 🛡️ DOM Manipülasyonu: innerHTML Temizliği Neden Kritik?

**Tehlikeli Örnek:**
```javascript
// getApplications() fonksiyonunda:
container.innerHTML = ""; // ✅ Her seferinde ÖNCE temizle
applications.forEach(app => {
    container.innerHTML += `<div>${app.baslik}</div>`; // Sonra ekle
});
```

**Neden `= ""` şart?**
`innerHTML +=` her iterasyonda tüm DOM'u yeniden parse eder ve üstüne ekler. Listeyi yenilemeden önce temizlemezseniz eski veriler üstüne yenileri eklenir — kullanıcı aynı başvuruları defalarca görür.

**Güvenlik Boyutu (XSS):**
`innerHTML` ile kullanıcı verisi eklerken dikkatli olunmalıdır. Veritabanından gelen `app.baslik` içinde `<script>alert('hack')</script>` olursa çalışabilir. Üretim ortamı için `textContent` veya DOMPurify gibi bir sanitizasyon kütüphanesi kullanılmalıdır. Bu proje öğrenme amaçlı olduğundan doğrudan interpolasyon kullanılmıştır.

---

### 🔄 Otomatik Liste Yenileme Mantığı

```javascript
async function createApplication() {
    // ...
    if (response.ok) {
        alert("✅ Başvurunuz sisteme kaydedildi!");
        document.getElementById('title').value = "";
        document.getElementById('description').value = "";
        getApplications(); // ← Başvuru sonrası listeyi otomatik günceller
    }
}
```

Bu yaklaşım kullanıcıyı sayfayı yenilemek zorunda bırakmadan anlık geri bildirim sağlar. Model değiştiğinde (yeni kayıt) görünüm (liste) hemen güncellenir — bu MVC'nin "V-M senkronizasyonu" ilkesinin frontend'deki yansımasıdır.

---

## Bölüm 4 — Bağlantı Şeması: Hangi Dosya Kime Bağlı?

```
app.js
 ├─── express, cors (npm paketleri)
 ├─── src/routes/userRoutes.js
 │         └─── src/controllers/userControllers.js
 │                   ├─── src/db/userDatabase.js  (pool.query)
 │                   ├─── bcryptjs               (şifre hash/compare)
 │                   └─── jsonwebtoken           (jwt.sign)
 │
 └─── src/routes/applicationRoutes.js
           ├─── src/middlewares/authMiddleware.js
           │         └─── jsonwebtoken           (jwt.verify)
           │              req.user = decode       → controller'a taşınır
           │
           ├─── src/middlewares/roleCheckMiddleware.js
           │         └─── req.user.rol           (authMiddleware'den geliyor!)
           │
           └─── src/controllers/applicationControllers.js
                     ├─── src/db/userDatabase.js  (pool.query)
                     └─── req.user.id             (authMiddleware'den geliyor!)
```

### Kritik Bağımlılık Zinciri

```
authMiddleware ──sets──► req.user
                              │
                    ┌─────────┴──────────┐
                    │                    │
               roleCheckMiddleware   controller
               (req.user.rol okur)   (req.user.id okur)
```

**Önemli:** `roleCheckMiddleware`, `authMiddleware` olmadan çalışamaz. Çünkü `req.user` nesnesini `authMiddleware` oluşturur. Route tanımındaki sıra bu yüzden kritiktir:

```javascript
// ✅ Doğru sıra:
router.get("/allGet", authMiddleware, roleCheckMiddleware, adminGetApplication);
//                          ↑               ↑                    ↑
//                      1. Kimlik       2. Yetki            3. İşlem
//                      doğrulama       kontrolü
```

---

## Bölüm 5 — Parameterized Queries: SQL Injection'a Karşı Kalkan

**Kötü Uygulama (Asla Yapma):**
```javascript
// ❌ String birleştirme — SQL Injection'a açık kapı
pool.query(`SELECT * FROM kullanicilar WHERE tckn = '${tckn}'`);
// Kötü aktör tckn = "' OR 1=1 --" girerse TÜM kullanıcılar döner!
```

**Projemizin Yöntemi:**
```javascript
// ✅ Parameterized Query — PostgreSQL driver parametreleri güvenli işler
pool.query(`SELECT * FROM kullanicilar WHERE tckn = $1`, [tckn]);
// $1 yerini asla ham SQL olarak değerlendirmez, string literal olarak işler
```

Projede **tüm** `pool.query()` çağrılarında `$1`, `$2`, `$3` placeholder'ları ve değer dizisi kullanılmıştır. Bu, en temel güvenlik önlemlerinden biridir.

---

## Bölüm 6 — JOIN Sorgusunun Önemi: adminGetApplication

```javascript
const result = await pool.query(
    `SELECT b.id, k.ad_soyad, b.baslik, b.icerik, b.durum
     FROM basvurular b
     JOIN kullanicilar k ON k.id = b.vatandas_id
     ORDER BY b.id DESC`
);
```

**Neden JOIN kullanıldı?**
`basvurular` tablosu sadece `vatandas_id` (sayısal ID) saklıyor. Memur panelinde vatandaşın adını göstermek için `kullanicilar` tablosuyla birleştirmek gerekiyor. Bu **ilişkisel veritabanı** tasarımının özüdür: veriyi tekrarlamak yerine sadece referans tut, ihtiyaç olduğunda JOIN ile getir.

**`ORDER BY b.id DESC`** → En yeni başvurular en üstte görünür.

---

## Bölüm 7 — Öğrenilen Temel Kavramlar Özeti

| Kavram | Pratikte Ne Anlama Gelir? |
|---|---|
| **Middleware** | Route handler'a girmeden önce çalışan "kapı görevlisi" |
| **next()** | "Ben işimi bitirdim, sıradaki middleware/controller çalışsın" sinyali |
| **req.user** | authMiddleware'in controller'a veri taşıma yöntemi (request nesnesi üzerinden) |
| **Stateless JWT** | Sunucu oturum tutmaz; kimlik token'ın içinde kodludur |
| **bcrypt salt** | Hash'i her seferinde farklı yapar, rainbow table saldırılarını engeller |
| **Pool (pg)** | Veritabanı bağlantısı açıp kapamak yerine yeniden kullanılabilir bağlantı havuzu |
| **Parameterized Query** | Kullanıcı girdisini SQL'den izole eder, injection'ı önler |
| **RBAC** | Yetki kodu role göre koşullu çalışır, kimlik değil role göre erişim verilir |

---

*Bu günlük, projenin gelişim sürecinde yaşayan bir belge olarak güncellenecektir.*
