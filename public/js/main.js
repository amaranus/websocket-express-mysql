/**
 * Preloader
 */

const removePreloader = () => preloader.remove()
let preloader = document.getElementById('preloader')
if (preloader) {
    window.addEventListener('load', () => setTimeout(removePreloader, 400))
}

const form = document.getElementById('loginForm')
const roomSelect = document.getElementById('roomSelect')
const messageInput = document.getElementById('messageInput')

let typingTimer // Yazma durumu kontrolü için bir zamanlayıcı oluşturulur
const doneTypingInterval = 1500 // Yazmayı bırakma süresi (ms)

messageInput.addEventListener('keydown', () => {
    if (messageInput.value.trim() !== '') {
        // Kullanıcı yazı yazmaya başladığında 'user_typing_start' mesajı gönder
        ws.send(JSON.stringify({ type: 'user_typing_start', username: username }))
        typingTimer = setTimeout(doneTyping, doneTypingInterval) // Yazmayı bırakmak için bir zamanlayıcı ayarla
    } else {
        // Eğer kullanıcı bir şey yazmayı bıraktıysa
        doneTyping()
    }
})

function doneTyping() {
    // Yazma durumunu sonlandır
    ws.send(JSON.stringify({ type: 'user_typing_stop', username: username }))
}

const registerButton = document.getElementById('registerButton')
registerButton.addEventListener('click', () => {
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    if (username.trim() !== '' && password.trim() !== '') {
        const data = { type: 'register', username, password }
        ws.send(JSON.stringify(data))
    } else {
        alert('Please enter a username and password')
    }
})

const ws = new WebSocket('ws://localhost:3000')
ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'room_participant_count') {
        const room = data.room
        const participantCount = data.participantCount
        updateRoomParticipantCount(room, participantCount)
    } else if (data.type === 'rooms') {
        const rooms = data.rooms
        roomSelect.innerHTML = '' // Mevcut seçenekleri temizle
        rooms.forEach((room) => {
            const option = document.createElement('option')
            option.value = room
            option.textContent = room
            roomSelect.appendChild(option)
        })
    } else if (data.type === 'login_success') {
        alert('Login successful. Welcome, ' + data.username + '!')
        document.getElementById('loginForm').style.display = 'none'
        document.getElementById('chatArea').style.display = 'block'
    } else if (data.type === 'login_failure') {
        alert('Login failed. ' + data.message)
    } else if (data.type === 'register_failure') {
        alert('Registration failed. ' + data.message)
    } else if (data.type === 'chat_message') {
        const messageArea = document.getElementById('messageArea')
        messageArea.value += `\n ${data.username}: ${data.message}`
        messageArea.scrollTop = messageArea?.scrollHeight
    } else if (data.type === 'room_joined') {
        const messageArea = document.getElementById('messageArea')
        messageArea.value += `\nYou joined the room: ${data.room}`
        messageArea.scrollTop = messageArea.scrollHeight
    } else if (data.type === 'room_left') {
        const messageArea = document.getElementById('messageArea')
        messageArea.value += `\nYou left the room: ${data.room}`
        messageArea.scrollTop = messageArea.scrollHeight
    } else if (data.type === 'system_message') {
        const messageArea = document.getElementById('messageArea')
        messageArea.value += `\n${data.message}`
        messageArea.scrollTop = messageArea.scrollHeight
    }

    if (data.type === 'user_typing_start') {
        // Kullanıcı yazı yazmaya başladığında mesajı göster
        showTypingMessage(data.username + ' is typing...')
    } else if (data.type === 'user_typing_stop') {
        // Kullanıcı yazı yazmayı bıraktığında mesajı gizle
        hideTypingMessage()
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const room = roomSelect.value // Seçilen odanın değerini al
    const data = { type: 'login', username, password, room } // Odanın bilgisini sunucuya gönder
    ws.send(JSON.stringify(data))
})

// Odaya katılma işlemi
roomSelect.addEventListener('change', () => {
    const messageArea = document.getElementById('messageArea')
    messageArea.value = '' // Mesaj alanını temizle
    const room = roomSelect.value
    ws.send(JSON.stringify({ type: 'change_room', room })) // Odayı değiştir
})
document.getElementById('logoutButton').addEventListener('click', () => {
    const data = { type: 'logout' }
    ws.send(JSON.stringify(data))
    document.getElementById('chatArea').style.display = 'none'
    document.getElementById('loginForm').style.display = 'block'
    location.reload()
})

document.getElementById('sendButton').addEventListener('click', () => {
    const messageInput = document.getElementById('messageInput')
    const message = messageInput.value
    const room = roomSelect.value // Seçilen odanın değerini al
    if (room === 'Select room') {
        alert('Please select a room')
        return
    }
    if (message.trim() !== '') {
        ws.send(JSON.stringify({ type: 'chat_message', message, room })) // Odanın bilgisini sunucuya gönder
        messageInput.value = ''
    }
})
function showTypingMessage(message) {
    const typingMessage = document.getElementById('typingMessage')
    typingMessage.innerText = message
    typingMessage.style.display = 'block'
}

function hideTypingMessage() {
    const typingMessage = document.getElementById('typingMessage')
    typingMessage.style.display = 'none'
}
