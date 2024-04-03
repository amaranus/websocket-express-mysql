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

NOT: İngilizce arayüz olarak tasarlanmıştır, isteyen başka bir dile çevirebilir.# websocket-express-mysql
