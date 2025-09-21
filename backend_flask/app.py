# app.py - Aplicação Flask principal

from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
import os
from file_groups import file_groups_bp, init_db

# Criar aplicação Flask
app = Flask(__name__)

# Configurações
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Habilitar CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Registrar blueprints
app.register_blueprint(file_groups_bp)

# Rota principal para servir o HTML
@app.route('/')
def index():
    return render_template('index.html')

# Rota para servir arquivos estáticos
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Inicializar banco de dados
@app.before_first_request
def initialize():
    init_db()
    print("Banco de dados inicializado com sucesso!")

# Health check para Docker
@app.route('/health')
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    # Configurações para rodar com Docker
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )