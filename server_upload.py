import os
from flask import Flask, request, jsonify

# Создаем папку для загрузки файлов
UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Инициализация Flask приложения
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Разрешенные расширения файлов
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'docx'}

# Проверка разрешенного расширения
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Маршрут для загрузки файлов
@app.route('/api/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part in the request'}), 400

    files = request.files.getlist('files')

    if not files or len(files) == 0:
        return jsonify({'error': 'No files uploaded'}), 400

    saved_files = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = file.filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            saved_files.append(filename)

    return jsonify({'message': 'Files uploaded successfully', 'files': saved_files}), 200

# Запуск сервера
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
