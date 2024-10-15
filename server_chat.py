from flask import Flask, request
from flask_socketio import SocketIO, send
from flask_cors import CORS

# Создаем Flask приложение
app = Flask(__name__)
CORS(app)  # Разрешаем CORS для взаимодействия с клиентом

# Создаем сервер SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Обработка сообщений, поступающих через WebSocket
@socketio.on('message')
def handle_message(msg):
    print(f"Message received: {msg}")
    # Рассылаем сообщение всем подключенным клиентам
    send('123', broadcast=True)

# Запуск сервера
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=4000)
