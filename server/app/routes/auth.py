from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({
            'message': 'ユーザー名とパスワードが必要です。',
            'status': 'error'
        }), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({
            'message': 'ユーザー名またはパスワードが無効です。',
            'status': 'error'
        }), 401
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'ログインに成功しました。',
        'status': 'success',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    """Get current user info"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'message': 'ユーザーが見つかりません。',
            'status': 'error'
        }), 404
    
    return jsonify({
        'message': 'ユーザー情報を取得しました。',
        'status': 'success',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/register', methods=['POST'])
@jwt_required()
def register():
    """Register a new user (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or not current_user.is_admin():
        return jsonify({
            'message': '管理者権限が必要です。',
            'status': 'error'
        }), 403
    
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({
            'message': 'ユーザー名、メール、パスワードが必要です。',
            'status': 'error'
        }), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({
            'message': 'このユーザー名は既に使用されています。',
            'status': 'error'
        }), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({
            'message': 'このメールアドレスは既に使用されています。',
            'status': 'error'
        }), 400
    
    role = data.get('role', 'general')
    if role not in ['admin', 'general']:
        role = 'general'
    
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        role=role
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'ユーザーが正常に登録されました。',
        'status': 'success',
        'user': new_user.to_dict()
    }), 201
