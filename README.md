# websocket - express - mysql

Basit chat uygulaması.

### Açıklamalar

Bu kod bir WebSocket sunucusu oluşturan ve aynı zamanda Express.js kullanarak bir HTTP sunucusu sağlayan bir Node.js uygulamasıdır. Aşağıda kodun ne işe yaradığı maddeler halinde detaylı olarak açıklanmıştır:

1. **Gerekli Modüllerin İçe Aktarılması**:
   - `express`: HTTP sunucusu oluşturmak için kullanılır.
   - `ws`: WebSocket sunucusunu oluşturmak için kullanılır.
   - `mysql`: MySQL veritabanıyla etkileşim kurmak için kullanılır.

2. **Express ve WebSocket Sunucusunun Oluşturulması**:
   - `express()` fonksiyonu ile Express uygulaması oluşturulur.
   - `http.createServer()` fonksiyonuyla Express uygulaması bir HTTP sunucusuna dönüştürülür.
   - `new WebSocket.Server({ server })` ile WebSocket sunucusu oluşturulur ve HTTP sunucusuna bağlanır.

3. **Express Uygulamasının Yapılandırılması**:
   - `express.static('public')` ile `public` klasöründeki statik dosyaların sunulması sağlanır.
   - Kök dizin (`'/'`) için bir GET yönlendiricisi oluşturulur ve istemcilere `index.html` dosyası gönderilir.

4. **Veritabanı Bağlantısının Kurulması**:
   - MySQL veritabanına bağlanmak için `mysql.createConnection()` kullanılır.
   - Bağlantı başarılı olduğunda, "Connected to database" mesajı yazdırılır.

5. **WebSocket Bağlantıları İçin Olay Dinleyicileri**:
   - `wss.on('connection', ...)` ile WebSocket bağlantıları için bir olay dinleyicisi tanımlanır.
   - Bağlantı kurulduğunda, gelen mesajlar işlenir ve uygun eylemler gerçekleştirilir (örneğin, oda değişikliği, çıkış, giriş vb.).

6. **Oda Yönetimi**:
   - `activeUsers`, `rooms` ve `typingUsers` gibi değişkenler kullanılarak oda ve kullanıcı yönetimi yapılır.
   - Kullanıcıların oda değişiklikleri, çıkışları ve girişleri işlenir.
   - Kullanıcının odaya katılması durumunda, oda katılımcılarına bildirim gönderilir ve odaya daha önce kaydedilmiş mesajlar gönderilir.

7. **Kullanıcı Oturum Yönetimi**:
   - Kullanıcıların oturum açması ve kayıt olması işlemleri gerçekleştirilir.
   - Oturum açma veya kayıt olma başarılı olduğunda, kullanıcıya bildirim gönderilir ve ilgili eylemler gerçekleştirilir.

8. **Mesaj Yönetimi**:
   - Kullanıcıların gönderdiği mesajlar işlenir ve veritabanına kaydedilir.
   - Gönderilen mesajlar, ilgili odadaki diğer kullanıcılara iletilir.

9. **Kullanıcı Bağlantılarının Kapatılması**:
   - Kullanıcı bağlantısı kapatıldığında, ilgili işlemler gerçekleştirilir ve kullanıcı aktif kullanıcılar listesinden kaldırılır.

10. **Yardımcı Fonksiyonlar**:
    - `notifyRoomParticipants()`: Bir odadaki katılımcılara sistem mesajları göndermek için kullanılır.

11. **Sunucunun Başlatılması**:
    - `server.listen(3000, ...)` ile sunucu belirtilen portta (3000) dinlemeye başlar.

NOT: İngilizce arayüz olarak tasarlanmıştır, isteyen başka bir dile çevirebilir.

### Veritabanı ve tabloları oluşturma
SQL sorgularını **phpmayadmin** ortamında uygulayarak veritabanını oluşturun. **Bu chat uygulaması kurulan ortamda bir apache mysql server gerektirir.**

1.Veritabanını oluşturma;

    CREATE DATABASE `ws_express`

2.Tabloları oluşturma;

    CREATE TABLE `messages` 
    ( 
    `id` int NOT NULL AUTO_INCREMENT, 
    `username` varchar(255) COLLATE utf8mb3_turkish_ci DEFAULT NULL, 
    `message` text COLLATE utf8mb3_turkish_ci, 
    `room` varchar(255) COLLATE utf8mb3_turkish_ci DEFAULT NULL, 
    `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (`id`) 
    ) 
    ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_turkish_ci
   
    CREATE TABLE `users` 
    ( 
    `id` int unsigned NOT NULL AUTO_INCREMENT, 
    `username` varchar(255) COLLATE utf8mb3_turkish_ci DEFAULT NULL, 
    `password` varchar(255) COLLATE utf8mb3_turkish_ci DEFAULT NULL, 
    PRIMARY KEY (`id`), 
    UNIQUE KEY `username` (`username`) 
    ) 
    ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_turkish_ci

Son olarak;

    npm install           
    npm start

 
Sunucu;

    http://localhost:3000
üzerinde çalışmaya başlar.

