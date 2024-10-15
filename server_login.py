from flask import Flask, request, jsonify
import psycopg2
import bcrypt
from flask_cors import CORS

# Создаем приложение Flask
app = Flask(__name__)
CORS(app)  # Разрешаем CORS

# Подключение к базе данных PostgreSQL
conn = psycopg2.connect(
    dbname="myapp", user="your_username", password="your_password", host="localhost"
)
cursor = conn.cursor()
# Функция для проверки учетных данных пользователя
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Поиск пользователя по email
    cursor.execute("SELECT password FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user:
        hashed_password = user[0]

        # Проверяем хэшированный пароль
        if hashed_password == password:
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid password'}), 401
    else:
        return jsonify({'error': 'User not found'}), 404

# Маршрут для регистрации нового пользователя (если нужно)
# @app.route('/api/register', methods=['POST'])
# def register():
#     data = request.json
#     email = data.get('email')
#     password = data.get('password')
#     print(email, password)

#     if not email or not password:
#         return jsonify({'error': 'Email and password are required'}), 400

#     # Хэшируем пароль
#     hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

#     try:
#         cursor.execute(
#             "INSERT INTO users (email, password) VALUES (%s, %s)",
#             (email, hashed_password.decode('utf-8'))
#         )
#         conn.commit()
#         return jsonify({'message': 'User registered successfully'}), 201
#     except psycopg2.IntegrityError:
#         conn.rollback()
#         return jsonify({'error': 'User already exists'}), 400

# # Запускаем сервер
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
