from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.case import Case
from app import db
from app.utils.auth import admin_required

cases_bp = Blueprint('cases', __name__)

@cases_bp.route('', methods=['GET'])
@jwt_required()
def get_cases():
    """Get all cases"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    cases_pagination = Case.query.paginate(page=page, per_page=per_page)
    
    cases_data = [case.to_dict() for case in cases_pagination.items]
    
    return jsonify({
        'message': 'ケース一覧を取得しました。',
        'status': 'success',
        'cases': cases_data,
        'pagination': {
            'total': cases_pagination.total,
            'pages': cases_pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': cases_pagination.has_next,
            'has_prev': cases_pagination.has_prev
        }
    }), 200

@cases_bp.route('/<int:case_id>', methods=['GET'])
@jwt_required()
def get_case(case_id):
    """Get a specific case"""
    case = Case.query.get(case_id)
    
    if not case:
        return jsonify({
            'message': 'ケースが見つかりません。',
            'status': 'error'
        }), 404
    
    return jsonify({
        'message': 'ケースを取得しました。',
        'status': 'success',
        'case': case.to_dict()
    }), 200

@cases_bp.route('', methods=['POST'])
@jwt_required()
@admin_required()
def create_case():
    """Create a new case (admin only)"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({
            'message': 'ケース名が必要です。',
            'status': 'error'
        }), 400
    
    new_case = Case(
        name=data['name'],
        description=data.get('description', ''),
        status=data.get('status', 'open')
    )
    
    db.session.add(new_case)
    db.session.commit()
    
    return jsonify({
        'message': 'ケースが正常に作成されました。',
        'status': 'success',
        'case': new_case.to_dict()
    }), 201

@cases_bp.route('/<int:case_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_case(case_id):
    """Update a case (admin only)"""
    case = Case.query.get(case_id)
    
    if not case:
        return jsonify({
            'message': 'ケースが見つかりません。',
            'status': 'error'
        }), 404
    
    data = request.get_json()
    
    if 'name' in data:
        case.name = data['name']
    if 'description' in data:
        case.description = data['description']
    if 'status' in data:
        case.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'ケースが正常に更新されました。',
        'status': 'success',
        'case': case.to_dict()
    }), 200

@cases_bp.route('/<int:case_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_case(case_id):
    """Delete a case (admin only)"""
    case = Case.query.get(case_id)
    
    if not case:
        return jsonify({
            'message': 'ケースが見つかりません。',
            'status': 'error'
        }), 404
    
    db.session.delete(case)
    db.session.commit()
    
    return jsonify({
        'message': 'ケースが正常に削除されました。',
        'status': 'success'
    }), 200
