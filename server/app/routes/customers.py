from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.customer import Customer
from app.models.case import Case
from app import db

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('', methods=['GET'])
@jwt_required()
def get_customers():
    """Get all customers"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    customers_pagination = Customer.query.paginate(page=page, per_page=per_page)
    
    customers_data = [customer.to_dict() for customer in customers_pagination.items]
    
    return jsonify({
        'message': '顧客一覧を取得しました。',
        'status': 'success',
        'customers': customers_data,
        'pagination': {
            'total': customers_pagination.total,
            'pages': customers_pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': customers_pagination.has_next,
            'has_prev': customers_pagination.has_prev
        }
    }), 200

@customers_bp.route('/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_customer(customer_id):
    """Get a specific customer"""
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({
            'message': '顧客が見つかりません。',
            'status': 'error'
        }), 404
    
    return jsonify({
        'message': '顧客を取得しました。',
        'status': 'success',
        'customer': customer.to_dict()
    }), 200

@customers_bp.route('', methods=['POST'])
@jwt_required()
def create_customer():
    """Create a new customer (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or not current_user.is_admin():
        return jsonify({
            'message': '管理者権限が必要です。',
            'status': 'error'
        }), 403
    
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('case_id'):
        return jsonify({
            'message': '顧客名とケースIDが必要です。',
            'status': 'error'
        }), 400
    
    case = Case.query.get(data['case_id'])
    if not case:
        return jsonify({
            'message': '指定されたケースが見つかりません。',
            'status': 'error'
        }), 404
    
    new_customer = Customer(
        case_id=data['case_id'],
        name=data['name'],
        email=data.get('email', ''),
        phone=data.get('phone', ''),
        address=data.get('address', '')
    )
    
    db.session.add(new_customer)
    db.session.commit()
    
    return jsonify({
        'message': '顧客が正常に作成されました。',
        'status': 'success',
        'customer': new_customer.to_dict()
    }), 201

@customers_bp.route('/<int:customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    """Update a customer (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or not current_user.is_admin():
        return jsonify({
            'message': '管理者権限が必要です。',
            'status': 'error'
        }), 403
    
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({
            'message': '顧客が見つかりません。',
            'status': 'error'
        }), 404
    
    data = request.get_json()
    
    if 'name' in data:
        customer.name = data['name']
    if 'email' in data:
        customer.email = data['email']
    if 'phone' in data:
        customer.phone = data['phone']
    if 'address' in data:
        customer.address = data['address']
    if 'case_id' in data:
        case = Case.query.get(data['case_id'])
        if not case:
            return jsonify({
                'message': '指定されたケースが見つかりません。',
                'status': 'error'
            }), 404
        customer.case_id = data['case_id']
    
    db.session.commit()
    
    return jsonify({
        'message': '顧客が正常に更新されました。',
        'status': 'success',
        'customer': customer.to_dict()
    }), 200

@customers_bp.route('/<int:customer_id>', methods=['DELETE'])
@jwt_required()
def delete_customer(customer_id):
    """Delete a customer (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or not current_user.is_admin():
        return jsonify({
            'message': '管理者権限が必要です。',
            'status': 'error'
        }), 403
    
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({
            'message': '顧客が見つかりません。',
            'status': 'error'
        }), 404
    
    db.session.delete(customer)
    db.session.commit()
    
    return jsonify({
        'message': '顧客が正常に削除されました。',
        'status': 'success'
    }), 200

@customers_bp.route('/case/<int:case_id>', methods=['GET'])
@jwt_required()
def get_customers_by_case(case_id):
    """Get customers for a specific case"""
    case = Case.query.get(case_id)
    if not case:
        return jsonify({
            'message': 'ケースが見つかりません。',
            'status': 'error'
        }), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    customers_pagination = Customer.query.filter_by(case_id=case_id).paginate(page=page, per_page=per_page)
    
    customers_data = [customer.to_dict() for customer in customers_pagination.items]
    
    return jsonify({
        'message': 'ケースの顧客一覧を取得しました。',
        'status': 'success',
        'customers': customers_data,
        'pagination': {
            'total': customers_pagination.total,
            'pages': customers_pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': customers_pagination.has_next,
            'has_prev': customers_pagination.has_prev
        }
    }), 200
