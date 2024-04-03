const express = require('express')
const WebSocket = require('ws')
const mysql = require('mysql')

const app = express()
const server = require('http').createServer(app)
const wss = new WebSocket.Server({ server })

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile('index.html')
})

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Veritabanı kullanıcı adı
    password: '1234', // Veritabanı şifresi
    database: 'ws_express', // Veritabanı adı
})

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database')
        throw err
    }
    console.log('Connected to database')
})

const activeUsers = new Set() // Aktif kullanıcıları izlemek için bir Set oluşturulur.
const rooms = new Map() // Oda adları ve katılımcılarını tutar
let typingUsers = new Set() // Yazı yazan kullanıcıları izlemek için bir Set oluşturulur.

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message)

        // Sunucu tarafında odanın değiştirilmesi
        if (data.type === 'change_room') {
            const newRoom = data.room
            const oldRoom = ws.room // Eski odanın bilgisini al
            if (oldRoom !== newRoom) {
                // Eğer kullanıcı odasını değiştirdiyse
                if (rooms.has(oldRoom)) {
                    // Eski odada kullanıcıyı bul ve odadan çıkar
                    const oldRoomParticipants = rooms.get(oldRoom)
                    oldRoomParticipants.delete(ws)
                    // Diğer kullanıcılara kullanıcının ayrıldığını bildir
                    notifyRoomParticipants(oldRoom, `${ws.username} left the room`)
                    // Eğer eski oda boşaldıysa sil
                    if (oldRoomParticipants.size === 0) {
                        rooms.delete(oldRoom)
                    }
                }
                // Yeni odaya katıl
                if (!rooms.has(newRoom)) {
                    rooms.set(newRoom, new Set())
                }
                rooms.get(newRoom).add(ws)
                ws.room = newRoom // Kullanıcının odasını güncelle
                // Diğer kullanıcılara kullanıcının yeni odaya katıldığını bildir
                notifyRoomParticipants(newRoom, `${ws.username} joined the room`)
                // İstemciye yeni odanın değiştirildiğini bildir
                ws.send(JSON.stringify({ type: 'room_changed', room: newRoom }))
                connection.query('SELECT * FROM messages WHERE room = ?', [newRoom], (err, results) => {
                    if (err) {
                        console.error('Error fetching messages from database')
                        throw err
                    }
                    results.forEach((row) => {
                        ws.send(JSON.stringify({ type: 'chat_message', message: row.message, username: row.username }))
                    })
                })
            }
        } else if (data.type === 'logout') {
            // Kullanıcının bağlantısını kapat
            ws.close()
            if (ws.username) {
                // Kullanıcıyı ilgili odadan çıkar
                rooms.forEach((participants, room) => {
                    if (participants.has(ws)) {
                        participants.delete(ws)
                        // Diğer kullanıcılara kullanıcının ayrıldığını bildir
                        notifyRoomParticipants(room, `${ws.username} left the room`)
                        // Oda boşaldıysa sil
                        if (participants.size === 0) {
                            rooms.delete(room)
                        }
                    }
                })
            }
        } else if (data.type === 'join_room') {
            const room = data.room
            if (!rooms.has(room)) {
                rooms.set(room, new Set())
            }
            rooms.get(room).add(ws)

            // Kullanıcı katıldığında diğer kullanıcılara bildir
            notifyRoomParticipants(room, `${ws.username} joined the room`)


            // İstemciye katıldığı odayı bildir
            ws.send(
                JSON.stringify({
                    type: 'room_joined',
                    room: room,
                })
            )

            // Kullanıcının önceki mesajlarını veritabanından getir ve gönder
            connection.query('SELECT * FROM messages WHERE room = ?', [room], (err, results) => {
                if (err) {
                    console.error('Error fetching messages from database')
                    throw err
                }
                results.forEach((row) => {
                    ws.send(JSON.stringify({ type: 'chat_message', message: row.message, username: row.username }))
                })
            })
        } else if (data.type === 'user_typing_start') {
            typingUsers.add(ws.username)

            // Bağlı tüm istemcilere yazı yazan kullanıcının adını gönder
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(
                        JSON.stringify({
                            type: 'user_typing_start',
                            username: ws.username,
                        })
                    )
                }
            })
        } else if (data.type === 'user_typing_stop') {
            typingUsers.delete(ws.username)

            // Bağlı tüm istemcilere yazı yazmayı bırakan kullanıcının adını gönder
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(
                        JSON.stringify({
                            type: 'user_typing_stop',
                            username: ws.username,
                        })
                    )
                }
            })
        } else if (data.type === 'login') {
            const { username, password, room } = data // Odanın bilgisini al
            if (activeUsers.has(username)) {
                // Eğer kullanıcı zaten aktifse, hata mesajı gönderilir.
                ws.send(
                    JSON.stringify({
                        type: 'login_failure',
                        message: 'User already logged in',
                    })
                )
            } else {
                connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
                    if (err) {
                        ws.send(
                            JSON.stringify({
                                type: 'login_failure',
                                message: 'Database error',
                            })
                        )
                        return
                    }
                    if (results.length > 0) {
                        ws.username = username
                        ws.room = room // Kullanıcının odasını ayarla
                        ws.send(
                            JSON.stringify({
                                type: 'login_success',
                                username: username,
                            })
                        )
                        activeUsers.add(username) // Kullanıcıyı aktif kullanıcılar listesine ekler.
                        // Kullanıcıyı odasına ekleyerek diğer kullanıcılara bildir
                        if (!rooms.has(room)) {
                            rooms.set(room, new Set())
                        }
                        rooms.get(room).add(ws)
                    } else {
                        ws.send(
                            JSON.stringify({
                                type: 'login_failure',
                                message: 'Invalid username or password',
                            })
                        )
                    }
                })
            }
        } else if (data.type === 'register') {
            const { username, password } = data
            connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
                if (err) {
                    ws.send(
                        JSON.stringify({
                            type: 'register_failure',
                            message: 'Username already exists',
                        })
                    )
                    return
                }
                ws.send(
                    JSON.stringify({
                        type: 'register_success',
                        message: 'User registered successfully',
                    })
                )
            })
        } else if (data.type === 'chat_message') {
            // Gelen mesajı veritabanına kaydet
            const { message, room } = data
            // Gelen mesajı veritabanına kaydet
            connection.query('INSERT INTO messages (username, message, room, timestamp) VALUES (?, ?, ?, NOW())', [ws.username, message, room], (err, results) => {
                if (err) {
                    console.error('Error saving message to database')
                    throw err
                }
            })

            // Bağlı tüm istemcilere gelen sohbet mesajlarını iletmek için
            const participants = rooms.get(room)
            participants.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(
                        JSON.stringify({
                            type: 'chat_message',
                            message: message,
                            username: ws.username,
                        })
                    )
                }
            })
        }
    })

    ws.on('close', () => {
        console.log('Client disconnected')
        if (ws.username) {
            activeUsers.delete(ws.username) // Kullanıcıyı aktif kullanıcılar listesinden kaldır
        }
    })
})

function notifyRoomParticipants(room, message) {
    const participants = rooms.get(room)
    participants.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: 'system_message',
                    message: message,
                })
            )
        }
    })
}

server.listen(3000, () => {
    console.log('Server started on port 3000')
})
