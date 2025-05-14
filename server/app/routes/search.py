from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import or_, and_
from app.models.case import Case
from app.models.customer import Customer
from app.models.investigation import Investigation
from app.models.target import Target

search_bp = Blueprint('search', __name__)

@search_bp.route('', methods=['POST'])
@jwt_required()
def advanced_search():
    """Advanced search across all entities"""
    data = request.get_json()
    
    if not data:
        return jsonify({
            'message': '検索条件が必要です。',
            'status': 'error'
        }), 400
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    entities = data.get('entities', ['cases', 'customers', 'investigations', 'targets'])
    
    results = {
        'cases': [],
        'customers': [],
        'investigations': [],
        'targets': []
    }
    
    if 'cases' in entities:
        case_filters = []
        
        if 'name' in data:
            case_filters.append(Case.name.ilike(f"%{data['name']}%"))
        if 'status' in data:
            case_filters.append(Case.status == data['status'])
        if 'description' in data:
            case_filters.append(Case.description.ilike(f"%{data['description']}%"))
        
        if case_filters:
            cases_query = Case.query.filter(and_(*case_filters))
        else:
            cases_query = Case.query
        
        cases_pagination = cases_query.paginate(page=page, per_page=per_page)
        results['cases'] = [case.to_dict() for case in cases_pagination.items]
    
    if 'customers' in entities:
        customer_filters = []
        
        if 'name' in data:
            customer_filters.append(Customer.name.ilike(f"%{data['name']}%"))
        if 'email' in data:
            customer_filters.append(Customer.email.ilike(f"%{data['email']}%"))
        if 'phone' in data:
            customer_filters.append(Customer.phone.ilike(f"%{data['phone']}%"))
        if 'address' in data:
            customer_filters.append(Customer.address.ilike(f"%{data['address']}%"))
        if 'case_id' in data:
            customer_filters.append(Customer.case_id == data['case_id'])
        
        if customer_filters:
            customers_query = Customer.query.filter(and_(*customer_filters))
        else:
            customers_query = Customer.query
        
        customers_pagination = customers_query.paginate(page=page, per_page=per_page)
        results['customers'] = [customer.to_dict() for customer in customers_pagination.items]
    
    if 'investigations' in entities:
        investigation_filters = []
        
        if 'title' in data:
            investigation_filters.append(Investigation.title.ilike(f"%{data['title']}%"))
        if 'status' in data:
            investigation_filters.append(Investigation.status == data['status'])
        if 'description' in data:
            investigation_filters.append(Investigation.description.ilike(f"%{data['description']}%"))
        if 'case_id' in data:
            investigation_filters.append(Investigation.case_id == data['case_id'])
        
        if investigation_filters:
            investigations_query = Investigation.query.filter(and_(*investigation_filters))
        else:
            investigations_query = Investigation.query
        
        investigations_pagination = investigations_query.paginate(page=page, per_page=per_page)
        results['investigations'] = [investigation.to_dict() for investigation in investigations_pagination.items]
    
    if 'targets' in entities:
        target_filters = []
        
        if 'name' in data:
            target_filters.append(Target.name.ilike(f"%{data['name']}%"))
        if 'type' in data:
            target_filters.append(Target.type.ilike(f"%{data['type']}%"))
        if 'status' in data:
            target_filters.append(Target.status == data['status'])
        if 'details' in data:
            target_filters.append(Target.details.ilike(f"%{data['details']}%"))
        if 'investigation_id' in data:
            target_filters.append(Target.investigation_id == data['investigation_id'])
        
        if target_filters:
            targets_query = Target.query.filter(and_(*target_filters))
        else:
            targets_query = Target.query
        
        targets_pagination = targets_query.paginate(page=page, per_page=per_page)
        results['targets'] = [target.to_dict() for target in targets_pagination.items]
    
    if 'cross_entity' in data and data['cross_entity']:
        if 'customer_name' in data and 'cases' in entities:
            customer_case_ids = [c.case_id for c in Customer.query.filter(
                Customer.name.ilike(f"%{data['customer_name']}%")
            ).all()]
            
            if customer_case_ids:
                cases_query = Case.query.filter(Case.id.in_(customer_case_ids))
                cases_pagination = cases_query.paginate(page=page, per_page=per_page)
                results['cases'] = [case.to_dict() for case in cases_pagination.items]
        
        if 'target_name' in data and 'investigations' in entities:
            target_investigation_ids = [t.investigation_id for t in Target.query.filter(
                Target.name.ilike(f"%{data['target_name']}%")
            ).all()]
            
            if target_investigation_ids:
                investigations_query = Investigation.query.filter(Investigation.id.in_(target_investigation_ids))
                investigations_pagination = investigations_query.paginate(page=page, per_page=per_page)
                results['investigations'] = [investigation.to_dict() for investigation in investigations_pagination.items]
    
    return jsonify({
        'message': '検索結果を取得しました。',
        'status': 'success',
        'results': results
    }), 200
