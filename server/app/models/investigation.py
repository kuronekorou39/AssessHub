from datetime import datetime
from app import db

class Investigation(db.Model):
    """Investigation model representing an investigation associated with a case"""
    __tablename__ = 'investigations'
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default='open')
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    targets = db.relationship('Target', backref='investigation', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert investigation object to dictionary"""
        return {
            'id': self.id,
            'case_id': self.case_id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'target_count': self.targets.count()
        }
    
    def __repr__(self):
        return f'<Investigation {self.title}>'
