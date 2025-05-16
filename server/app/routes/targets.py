from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.target import Target
from app.models.investigation import Investigation
from app import db
from app.utils.auth import admin_required

targets_bp = Blueprint('targets', __name__)

@targets_bp.route('', methods=['GET'])
@jwt_required()
def get_targets():
    """Get all targets"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    targets_pagination = Target.query.paginate(page=page, per_page=per_page)
    
    targets_data = [target.to_dict() for target in targets_pagination.items]
    
    return jsonify({
        'message': 'ターゲット一覧を取得しました。',
        'status': 'success',
        'targets': targets_data,
        'pagination': {
            'total': targets_pagination.total,
            'pages': targets_pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': targets_pagination.has_next,
            'has_prev': targets_pagination.has_prev
        }
    }), 200

@targets_bp.route('/<int:target_id>', methods=['GET'])
@jwt_required()
def get_target(target_id):
    """Get a specific target"""
    target = Target.query.get(target_id)
    
    if not target:
        return jsonify({
            'message': 'ターゲットが見つかりません。',
            'status': 'error'
        }), 404
    
    return jsonify({
        'message': 'ターゲットを取得しました。',
        'status': 'success',
        'target': target.to_dict()
    }), 200

@targets_bp.route('', methods=['POST'])
@jwt_required()
@admin_required()
def create_target():
    """Create a new target (admin only)"""
    
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('investigation_id'):
        return jsonify({
            'message': 'ターゲット名と調査IDが必要です。',
            'status': 'error'
        }), 400
    
    investigation = Investigation.query.get(data['investigation_id'])
    if not investigation:
        return jsonify({
            'message': '指定された調査が見つかりません。',
            'status': 'error'
        }), 404
    
    new_target = Target(
        investigation_id=data['investigation_id'],
        name=data['name'],
        type=data.get('type', ''),
        details=data.get('details', ''),
        status=data.get('status', 'open')
    )
    
    db.session.add(new_target)
    db.session.commit()
    
    return jsonify({
        'message': 'ターゲットが正常に作成されました。',
        'status': 'success',
        'target': new_target.to_dict()
    }), 201

@targets_bp.route('/<int:target_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_target(target_id):
    """Update a target (admin only)"""
    
    target = Target.query.get(target_id)
    
    if not target:
        return jsonify({
            'message': 'ターゲットが見つかりません。',
            'status': 'error'
        }), 404
    
    data = request.get_json()
    
    if 'name' in data:
        target.name = data['name']
    if 'type' in data:
        target.type = data['type']
    if 'details' in data:
        target.details = data['details']
    if 'status' in data:
        target.status = data['status']
    if 'investigation_id' in data:
        investigation = Investigation.query.get(data['investigation_id'])
        if not investigation:
            return jsonify({
                'message': '指定された調査が見つかりません。',
                'status': 'error'
            }), 404
        target.investigation_id = data['investigation_id']
    
    db.session.commit()
    
    return jsonify({
        'message': 'ターゲットが正常に更新されました。',
        'status': 'success',
        'target': target.to_dict()
    }), 200

@targets_bp.route('/<int:target_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_target(target_id):
    """Delete a target (admin only)"""
    
    target = Target.query.get(target_id)
    
    if not target:
        return jsonify({
            'message': 'ターゲットが見つかりません。',
            'status': 'error'
        }), 404
    
    db.session.delete(target)
    db.session.commit()
    
    return jsonify({
        'message': 'ターゲットが正常に削除されました。',
        'status': 'success'
    }), 200

@targets_bp.route('/investigation/<int:investigation_id>', methods=['GET'])
@jwt_required()
def get_targets_by_investigation(investigation_id):
    """Get targets for a specific investigation"""
    investigation = Investigation.query.get(investigation_id)
    if not investigation:
        return jsonify({
            'message': '調査が見つかりません。',
            'status': 'error'
        }), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    targets_pagination = Target.query.filter_by(investigation_id=investigation_id).paginate(page=page, per_page=per_page)
    
    targets_data = [target.to_dict() for target in targets_pagination.items]
    
    return jsonify({
        'message': '調査のターゲット一覧を取得しました。',
        'status': 'success',
        'targets': targets_data,
        'pagination': {
            'total': targets_pagination.total,
            'pages': targets_pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': targets_pagination.has_next,
            'has_prev': targets_pagination.has_prev
        }
    }), 200
