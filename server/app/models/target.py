from datetime import datetime
from app import db

class Target(db.Model):
    """Target model representing a target associated with an investigation"""
    __tablename__ = 'targets'
    
    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=True) # TODO
    name = db.Column(db.String(100), nullable=True) # TODO
    type = db.Column(db.String(50))
    details = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=True, default='open') # TODO
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert target object to dictionary"""
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'name': self.name,
            'type': self.type,
            'details': self.details,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Target {self.name}>'
