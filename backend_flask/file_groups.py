# file_groups.py - Rotas e lógica para gerenciamento de grupos de arquivos

from flask import Blueprint, request, jsonify
from datetime import datetime
import sqlite3
import os

# Criar Blueprint para as rotas de grupos de arquivos
file_groups_bp = Blueprint('file_groups', __name__)

# Configuração do banco de dados
DB_PATH = os.getenv('DATABASE_PATH', 'database.db')

def get_db():
    """Conecta ao banco de dados SQLite"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa as tabelas do banco de dados"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Criar tabela de grupos de arquivos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS file_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            file_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Criar tabela de arquivos (para associar aos grupos)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            file_size INTEGER,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES file_groups (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()

# Rotas da API

@file_groups_bp.route('/api/file-groups', methods=['GET'])
def get_file_groups():
    """Retorna todos os grupos de arquivos"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, description, file_count, created_at, updated_at 
            FROM file_groups 
            ORDER BY created_at DESC
        ''')
        
        groups = []
        for row in cursor.fetchall():
            groups.append({
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'fileCount': row['file_count'],
                'createdAt': row['created_at'],
                'updatedAt': row['updated_at']
            })
        
        conn.close()
        return jsonify(groups), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_groups_bp.route('/api/file-groups/<int:group_id>', methods=['GET'])
def get_file_group(group_id):
    """Retorna um grupo específico pelo ID"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, description, file_count, created_at, updated_at 
            FROM file_groups 
            WHERE id = ?
        ''', (group_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return jsonify({
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'fileCount': row['file_count'],
                'createdAt': row['created_at'],
                'updatedAt': row['updated_at']
            }), 200
        else:
            return jsonify({'error': 'Grupo não encontrado'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_groups_bp.route('/api/file-groups', methods=['POST'])
def create_file_group():
    """Cria um novo grupo de arquivos"""
    try:
        data = request.get_json()
        
        # Validação dos dados
        if not data or 'name' not in data or 'description' not in data:
            return jsonify({'error': 'Nome e descrição são obrigatórios'}), 400
        
        name = data['name'].strip()
        description = data['description'].strip()
        
        if not name or not description:
            return jsonify({'error': 'Nome e descrição não podem estar vazios'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Verificar se já existe um grupo com o mesmo nome
        cursor.execute('SELECT id FROM file_groups WHERE name = ?', (name,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Já existe um grupo com este nome'}), 409
        
        # Inserir novo grupo
        cursor.execute('''
            INSERT INTO file_groups (name, description, file_count) 
            VALUES (?, ?, 0)
        ''', (name, description))
        
        group_id = cursor.lastrowid
        conn.commit()
        
        # Buscar o grupo criado
        cursor.execute('''
            SELECT id, name, description, file_count, created_at, updated_at 
            FROM file_groups 
            WHERE id = ?
        ''', (group_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        return jsonify({
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'fileCount': row['file_count'],
            'createdAt': row['created_at'],
            'updatedAt': row['updated_at']
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_groups_bp.route('/api/file-groups/<int:group_id>', methods=['PUT'])
def update_file_group(group_id):
    """Atualiza um grupo de arquivos existente"""
    try:
        data = request.get_json()
        
        # Validação dos dados
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Verificar se o grupo existe
        cursor.execute('SELECT id FROM file_groups WHERE id = ?', (group_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Grupo não encontrado'}), 404
        
        # Preparar campos para atualização
        update_fields = []
        update_values = []
        
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                conn.close()
                return jsonify({'error': 'Nome não pode estar vazio'}), 400
            
            # Verificar se já existe outro grupo com o mesmo nome
            cursor.execute('SELECT id FROM file_groups WHERE name = ? AND id != ?', (name, group_id))
            if cursor.fetchone():
                conn.close()
                return jsonify({'error': 'Já existe outro grupo com este nome'}), 409
            
            update_fields.append('name = ?')
            update_values.append(name)
        
        if 'description' in data:
            description = data['description'].strip()
            if not description:
                conn.close()
                return jsonify({'error': 'Descrição não pode estar vazia'}), 400
            update_fields.append('description = ?')
            update_values.append(description)
        
        if not update_fields:
            conn.close()
            return jsonify({'error': 'Nenhum campo válido para atualizar'}), 400
        
        # Adicionar updated_at
        update_fields.append('updated_at = CURRENT_TIMESTAMP')
        update_values.append(group_id)
        
        # Executar atualização
        query = f"UPDATE file_groups SET {', '.join(update_fields)} WHERE id = ?"
        cursor.execute(query, update_values)
        conn.commit()
        
        # Buscar o grupo atualizado
        cursor.execute('''
            SELECT id, name, description, file_count, created_at, updated_at 
            FROM file_groups 
            WHERE id = ?
        ''', (group_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        return jsonify({
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'fileCount': row['file_count'],
            'createdAt': row['created_at'],
            'updatedAt': row['updated_at']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_groups_bp.route('/api/file-groups', methods=['DELETE'])
def delete_file_groups():
    """Deleta múltiplos grupos de arquivos"""
    try:
        data = request.get_json()
        
        # Validação dos dados
        if not data or 'ids' not in data or not isinstance(data['ids'], list):
            return jsonify({'error': 'Lista de IDs é obrigatória'}), 400
        
        ids = data['ids']
        if not ids:
            return jsonify({'error': 'Lista de IDs não pode estar vazia'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Verificar quantos grupos existem
        placeholders = ','.join('?' * len(ids))
        cursor.execute(f'SELECT COUNT(*) as count FROM file_groups WHERE id IN ({placeholders})', ids)
        existing_count = cursor.fetchone()['count']
        
        if existing_count == 0:
            conn.close()
            return jsonify({'error': 'Nenhum grupo encontrado com os IDs fornecidos'}), 404
        
        # Deletar os grupos (CASCADE deletará os arquivos associados)
        cursor.execute(f'DELETE FROM file_groups WHERE id IN ({placeholders})', ids)
        deleted_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'deletedCount': deleted_count,
            'message': f'{deleted_count} grupo(s) removido(s) com sucesso'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_groups_bp.route('/api/file-groups/<int:group_id>/files', methods=['GET'])
def get_group_files(group_id):
    """Retorna todos os arquivos de um grupo específico"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Verificar se o grupo existe
        cursor.execute('SELECT name FROM file_groups WHERE id = ?', (group_id,))
        group = cursor.fetchone()
        
        if not group:
            conn.close()
            return jsonify({'error': 'Grupo não encontrado'}), 404
        
        # Buscar arquivos do grupo
        cursor.execute('''
            SELECT id, filename, filepath, file_size, uploaded_at 
            FROM files 
            WHERE group_id = ?
            ORDER BY uploaded_at DESC
        ''', (group_id,))
        
        files = []
        for row in cursor.fetchall():
            files.append({
                'id': row['id'],
                'filename': row['filename'],
                'filepath': row['filepath'],
                'fileSize': row['file_size'],
                'uploadedAt': row['uploaded_at']
            })
        
        conn.close()
        
        return jsonify({
            'groupId': group_id,
            'groupName': group['name'],
            'files': files
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Função para atualizar a contagem de arquivos em um grupo
def update_file_count(group_id):
    """Atualiza a contagem de arquivos em um grupo"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE file_groups 
            SET file_count = (SELECT COUNT(*) FROM files WHERE group_id = ?)
            WHERE id = ?
        ''', (group_id, group_id))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        print(f"Erro ao atualizar contagem de arquivos: {e}")