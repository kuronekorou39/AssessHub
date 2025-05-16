from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.investigation import Investigation
from app.models.case import Case
from app import db
from datetime import datetime
from app.utils.auth import admin_required

investigations_bp = Blueprint('investigations', __name__)

@investigations_bp.route('', methods=['GET'])
@jwt_required()
def get_investigations():
    """Get all investigations"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    investigations_pagination = Investigation.query.paginate(page=page, per_page=per_page)
    
    investigations_data = [investigation.to_dict() for investigation in investigations_pagination.items]
    
    return jsonify({
        'message': '調査一覧を取得しました。',
        'status': 'success',
        'investigations': investigations_data,
        'pagination': {
            'total': investigations_pagination.total,
            'pages': investigations_pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': investigations_pagination.has_next,
            'has_prev': investigations_pagination.has_prev
        }
    }), 200

@investigations_bp.route('/<int:investigation_id>', methods=['GET'])
@jwt_required()
def get_investigation(investigation_id):
    """Get a specific investigation"""
    investigation = Investigation.query.get(investigation_id)
    
    if not investigation:
        return jsonify({
            'message': '調査が見つかりません。',
            'status': 'error'
        }), 404
    
    return jsonify({
        'message': '調査を取得しました。',
        'status': 'success',
        'investigation': investigation.to_dict()
    }), 200

@investigations_bp.route('', methods=['POST'])
@jwt_required()
@admin_required()
def create_investigation():
    """Create a new investigation (admin only)"""
    
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('case_id'):
        return jsonify({
            'message': '調査タイトルとケースIDが必要です。',
            'status': 'error'
        }), 400
    
    case = Case.query.get(data['case_id'])
    if not case:
        return jsonify({
            'message': '指定されたケースが見つかりません。',
            'status': 'error'
        }), 404
    
    start_date = None
    if data.get('start_date'):
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'message': '開始日の形式が無効です。YYYY-MM-DD形式で入力してください。',
                'status': 'error'
            }), 400
    
    end_date = None
    if data.get('end_date'):
        try:
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'message': '終了日の形式が無効です。YYYY-MM-DD形式で入力してください。',
                'status': 'error'
            }), 400
    
    new_investigation = Investigation(
        case_id=data['case_id'],
        title=data['title'],
        description=data.get('description', ''),
        status=data.get('status', 'open'),
        start_date=start_date,
        end_date=end_date
    )
    
    db.session.add(new_investigation)
    db.session.commit()
    
    return jsonify({
        'message': '調査が正常に作成されました。',
        'status': 'success',
        'investigation': new_investigation.to_dict()
    }), 201

@investigations_bp.route('/<int:investigation_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_investigation(investigation_id):
    """Update an investigation (admin only)"""
    
    investigation = Investigation.query.get(investigation_id)
    
    if not investigation:
        return jsonify({
            'message': '調査が見つかりません。',
            'status': 'error'
        }), 404
    
    data = request.get_json()
    
    if 'title' in data:
        investigation.title = data['title']
    if 'description' in data:
        investigation.description = data['description']
    if 'status' in data:
        investigation.status = data['status']
    
    if 'start_date' in data:
        if data['start_date']:
            try:
                investigation.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'message': '開始日の形式が無効です。YYYY-MM-DD形式で入力してください。',
                    'status': 'error'
                }), 400
        else:
            investigation.start_date = None
    
    if 'end_date' in data:
        if data['end_date']:
            try:
                investigation.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'message': '終了日の形式が無効です。YYYY-MM-DD形式で入力してください。',
                    'status': 'error'
                }), 400
        else:
            investigation.end_date = None
    
    if 'case_id' in data:
        case = Case.query.get(data['case_id'])
        if not case:
            return jsonify({
                'message': '指定されたケースが見つかりません。',
                'status': 'error'
            }), 404
        investigation.case_id = data['case_id']
    
    db.session.commit()
    
    return jsonify({
        'message': '調査が正常に更新されました。',
        'status': 'success',
        'investigation': investigation.to_dict()
    }), 200

@investigations_bp.route('/<int:investigation_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_investigation(investigation_id):
    """Delete an investigation (admin only)"""
    
    investigation = Investigation.query.get(investigation_id)
    
    if not investigation:
        return jsonify({
            'message': '調査が見つかりません。',
            'status': 'error'
        }), 404
    
    db.session.delete(investigation)
    db.session.commit()
    
    return jsonify({
        'message': '調査が正常に削除されました。',
        'status': 'success'
    }), 200

@investigations_bp.route('/case/<int:case_id>', methods=['GET'])
@jwt_required()
def get_investigations_by_case(case_id):
    """Get investigations for a specific case"""
    case = Case.query.get(case_id)
    if not case:
        return jsonify({
            'message': 'ケースが見つかりません。',
            'status': 'error'
        }), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    investigations_pagination = Investigation.query.filter_by(case_id=case_id).paginate(page=page, per_page=per_page)
    
    investigations_data = [investigation.to_dict() for investigation in investigations_pagination.items]
    
    return jsonify({
        'message': 'ケースの調査一覧を取得しました。',
        'status': 'success',
        'investigations': investigations_data,
        'pagination': {
            'total': investigations_pagination.total,
            'pages': investigations_pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': investigations_pagination.has_next,
            'has_prev': investigations_pagination.has_prev
        }
    }), 200
