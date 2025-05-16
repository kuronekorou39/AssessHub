from datetime import datetime
from app import db

class Case(db.Model):
    """Case model representing a case in the system"""
    __tablename__ = 'cases'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True) # TODO
    description = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=True, default='open') # TODO
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customers = db.relationship('Customer', backref='case', lazy='dynamic', cascade='all, delete-orphan')
    investigations = db.relationship('Investigation', backref='case', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert case object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'customer_count': self.customers.count(),
            'investigation_count': self.investigations.count()
        }
    
    def __repr__(self):
        return f'<Case {self.name}>'
