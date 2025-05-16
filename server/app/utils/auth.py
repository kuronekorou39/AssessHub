from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User

def admin_required():
    """Decorator to check if the current user is an admin"""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or not user.is_admin():
                return jsonify({
                    'message': '管理者権限が必要です。',
                    'status': 'error'
                }), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper
