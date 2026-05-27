# Cord-DB-JS

Cord-DB-JS, Firebase Realtime Database'i Node.js projelerinizde en basit ve hızlı şekilde kullanmanızı sağlayan bir Firebase Admin SDK sarmalayıcısıdır.

## Kurulum

```bash
npm install cord-db-js
```

## Yapılandırma

Cord-DB-JS'nin çalışması için iki ana şeye ihtiyacınız vardır: **Database URL** ve **serviceAccountKey.json**.

### serviceAccountKey.json Nedir?
Bu dosya, uygulamanızın Firebase veritabanınıza "Yönetici (Admin)" yetkisiyle erişmesini sağlayan gizli bir anahtar dosyasıdır. Bu dosya olmadan veritabanına veri yazamaz veya okuyamazsınız.

### Nasıl Alınır?
1.  [Firebase Konsolu](https://console.firebase.google.com/)'na gidin ve projenizi seçin.
2.  Sol üstteki çark simgesine (⚙️) tıklayıp **Project Settings** (Proje Ayarları) kısmına girin.
3.  Üst menüden **Service Accounts** (Hizmet Hesapları) sekmesine tıklayın.
4.  **Node.js** seçeneğinin seçili olduğundan emin olun ve alttaki **Generate New Private Key** (Yeni Özel Anahtar Oluştur) butonuna basın.
5.  İnen `.json` dosyasının ismini `serviceAccountKey.json` olarak değiştirin ve projenizin ana dizinine (root) yapıştırın.

> ⚠️ **ÖNEMLİ GÜVENLİK UYARISI:** Bu dosya projenizin tüm yetkisine sahiptir. Bu dosyayı asla GitHub gibi halka açık platformlarda paylaşmayın! `.gitignore` dosyanıza eklemeyi unutmayın.

## Kullanım

En iyi kullanım şekli, veritabanını bir `tools.js` dosyasında tanımlayıp diğer dosyalarda çağırmaktır.

### 1. tools.js (Tanımlama)

```javascript
const { CordDB } = require("cord-db-js");
const path = require("path");

const db = new CordDB({
  databaseURL: "https://PROJE_ID-default-rtdb.firebaseio.com",
  serviceAccount: path.join(__dirname, "serviceAccountKey.json") // JSON dosyasının yolu
});

module.exports = db;
```

### 2. app.js (Kullanım)

```javascript
const db = require("./tools.js");

async function start() {
  await db.set("test", 123);
  const veri = await db.get("test");
  console.log(veri); // 123
}

start();
```

## Metotlar

| Metot | Açıklama |
| --- | --- |
| `set(key, value)` | Veri yazar. |
| `get(key)` | Veri okur. |
| `add(key, n)` | Değeri `n` kadar artırır. |
| `subtract(key, n)` | Değeri `n` kadar azaltır. |
| `push(key, value)` | Listeye eleman ekler. |
| `delete(key)` | Veriyi siler. |
| `has(key)` | Veri var mı kontrol eder. |
| `all()` | Tüm veritabanını getirir. |
| `clear()` | Tüm veritabanını temizler. |

## Lisans

MIT
