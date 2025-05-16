import os
import time
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy.exc import OperationalError

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


# def wait_for_db(app, db):
#     for i in range(10):
#         try:
#             with app.app_context():
#                 db.session.execute("SELECT 1")
#             print("✅ Database is ready.")
#             return
#         except OperationalError:
#             print(f"⏳ Waiting for database... ({i+1}/10)")
#             time.sleep(1)
#     print("❌ Could not connect to the database.")
#     # exit(1)

def create_app():
    """Application factory function"""
    app = Flask(__name__)
    
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes.auth import auth_bp
    from app.routes.cases import cases_bp
    from app.routes.customers import customers_bp
    from app.routes.investigations import investigations_bp
    from app.routes.targets import targets_bp
    from app.routes.search import search_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cases_bp, url_prefix='/api/cases')
    app.register_blueprint(customers_bp, url_prefix='/api/customers')
    app.register_blueprint(investigations_bp, url_prefix='/api/investigations')
    app.register_blueprint(targets_bp, url_prefix='/api/targets')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    
    # wait_for_db(app, db)  # ← ここでDB接続を待つ

    # ✅ DB作成はここで行う（wait_for_db成功後に）
    # with app.app_context():
    #     db.create_all()
        
    return app
