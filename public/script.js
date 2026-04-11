
const API_URL = "http://localhost:3000/api"; 


// 1. Sisteme Giriş Yapma (Login)
async function login() {
    const tckn = document.getElementById('tckn').value;
    const sifre_hash = document.getElementById('sifre_hash').value;

    if(!tckn || !sifre_hash) {
        alert("Lütfen T.C. Kimlik ve Şifre girin!");
        return;
    }

    try {
        const response = await fetch(`/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tckn : tckn, sifre_hash : sifre_hash })
        });

        const data = await response.json();

        if (response.ok) {
         localStorage.setItem('token', data.token);// gelen tokeni localstorage kaydeder,kolayca ulaşmak için
            alert("✅ Sisteme başarıyla giriş yapıldı!");
          document.getElementById('tckn').value = "✅ TC Doğrulandı!";
          document.getElementById('sifre_hash').value = "";
        } else {
            alert("❌ Giriş Başarısız: " + data.message);
        }
    } catch (error) {
        alert("Sunucuya ulaşılamıyor. Backend açık mı?");
    }
}
async function register() {
    const tckn = document.getElementById('reg-tckn').value;
    const ad_soyad = document.getElementById('reg-name').value;
    const sifre_hash = document.getElementById('reg-password').value;

    // Basit bir kontrol
    if (!tckn || !ad_soyad || !sifre_hash) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tckn: tckn,
                ad_soyad: ad_soyad,
                sifre_hash: sifre_hash // Backend'de Bcrypt bunu karşılayacak
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
           document.getElementById('reg-tckn').value = ""; //kayıt yapınca inputları temizlesin diye.
           document.getElementById('reg-name').value = "";
           document.getElementById('reg-password').value = "";
        } else {
            alert("Hata: " + data.message);
        }
    } catch (err) {
        console.error("Kayıt hatası:", err);
        
    }
}
// 2. Yeni Başvuru Gönderme
async function createApplication() {
     const token = localStorage.getItem('token');
    if(!token) {
        alert("Önce giriş yapmalısınız!");
        return;
    }

    const baslik = document.getElementById('title').value;
    const icerik = document.getElementById('description').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/send/applications/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Token ile yetki kontrolü
            },
            body: JSON.stringify({ baslik, icerik })
        });

        if (response.ok) {
            alert("✅ Başvurunuz sisteme kaydedildi!");
            // Formu temizle
            document.getElementById('title').value = "";
            document.getElementById('description').value = "";
            // Listeyi otomatik güncelle
            getApplications(); 
        } else {
            alert("Başvuru gönderilemedi.");
        }
    } catch (error) {
        alert("Bir hata oluştu.");
    }
}

// 3. Başvuruları Ekrana Getirme
async function getApplications() {
    if(!userToken) {
        alert("Önce giriş yapmalısınız!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/applications`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        const applications = await response.json();
        const container = document.getElementById('apps-container');
        container.innerHTML = ""; 

        if(applications.length === 0) {
            container.innerHTML = "<p>Henüz başvuru bulunmuyor.</p>";
            return;
        }

        // Gelen verileri HTML kartlarına çevirip ekrana basıyoruz
        applications.forEach(app => {
            container.innerHTML += `
                <div class="app-item">
                    <h3>${app.title}</h3>
                    <p>${app.description}</p>
                    <span class="badge">Durum: ${app.status || 'Beklemede'}</span>
                </div>
            `;
        });
    } catch (error) {
        alert("Veriler çekilemedi.");
    }
}