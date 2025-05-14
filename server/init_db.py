"""
Script to initialize the database with sample data
"""
from app import create_app, db
from app.models.user import User
from app.models.case import Case
from app.models.customer import Customer
from app.models.investigation import Investigation
from app.models.target import Target
from datetime import datetime, timedelta
import random

def init_db():
    """Initialize the database with sample data"""
    app = create_app()
    
    with app.app_context():
        db.create_all()
        
        if User.query.count() > 0:
            print("Database already contains data. Skipping initialization.")
            return
        
        admin_user = User(
            username="admin",
            email="admin@example.com",
            password="admin123",
            role="admin"
        )
        
        general_user = User(
            username="user",
            email="user@example.com",
            password="user123",
            role="general"
        )
        
        db.session.add(admin_user)
        db.session.add(general_user)
        
        case_names = ["不正アクセス調査", "データ漏洩調査", "内部不正調査", "セキュリティ監査", "コンプライアンス調査"]
        case_descriptions = [
            "社内システムへの不正アクセスに関する調査",
            "顧客データの漏洩に関する調査",
            "従業員による内部不正の可能性に関する調査",
            "セキュリティ体制の監査",
            "コンプライアンス違反の可能性に関する調査"
        ]
        case_statuses = ["open", "in_progress", "closed", "on_hold"]
        
        cases = []
        for i in range(5):
            case = Case(
                name=case_names[i],
                description=case_descriptions[i],
                status=random.choice(case_statuses)
            )
            db.session.add(case)
            cases.append(case)
        
        customer_names = ["田中株式会社", "鈴木商事", "佐藤工業", "高橋電機", "伊藤物産", "渡辺建設", "山本製作所", "中村商店", "小林運輸", "加藤エンジニアリング"]
        
        for i in range(10):
            customer = Customer(
                case_id=random.choice(cases).id,
                name=customer_names[i],
                email=f"contact@{customer_names[i].lower().replace('株式会社', '')}.example.com",
                phone=f"03-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                address=f"東京都千代田区丸の内{random.randint(1, 3)}-{random.randint(1, 10)}-{random.randint(1, 20)}"
            )
            db.session.add(customer)
        
        investigation_titles = ["システムログ分析", "ネットワークトラフィック分析", "端末フォレンジック調査", "メールデータ調査", "アクセス権限調査", "バックアップデータ調査", "クラウドサービス利用状況調査"]
        investigation_descriptions = [
            "システムログの分析による不正アクセスの痕跡調査",
            "ネットワークトラフィックの分析による異常通信の調査",
            "対象端末のフォレンジック調査",
            "メールデータの調査による情報漏洩の痕跡確認",
            "システムアクセス権限の調査",
            "バックアップデータの調査によるデータ改ざんの確認",
            "クラウドサービスの利用状況調査"
        ]
        
        investigations = []
        for i in range(7):
            start_date = datetime.now() - timedelta(days=random.randint(30, 90))
            end_date = start_date + timedelta(days=random.randint(7, 30)) if random.random() > 0.3 else None
            
            investigation = Investigation(
                case_id=random.choice(cases).id,
                title=investigation_titles[i],
                description=investigation_descriptions[i],
                status=random.choice(case_statuses),
                start_date=start_date.date(),
                end_date=end_date.date() if end_date else None
            )
            db.session.add(investigation)
            investigations.append(investigation)
        
        target_names = ["ウェブサーバー", "データベースサーバー", "従業員PC", "ファイルサーバー", "メールサーバー", "クラウドストレージ", "バックアップサーバー", "ネットワーク機器", "モバイルデバイス"]
        target_types = ["サーバー", "PC", "ネットワーク機器", "モバイルデバイス", "クラウドサービス"]
        target_details = [
            "Apache 2.4.41を実行しているウェブサーバー",
            "PostgreSQL 12.4を実行しているデータベースサーバー",
            "Windows 10を実行している従業員のPC",
            "Samba 4.11.6を実行しているファイルサーバー",
            "Exchange 2019を実行しているメールサーバー",
            "AWS S3を使用しているクラウドストレージ",
            "Bacula 9.4.2を実行しているバックアップサーバー",
            "Cisco Catalyst 3850スイッチ",
            "iOS 14.4を実行しているiPhone"
        ]
        
        for i in range(9):
            target = Target(
                investigation_id=random.choice(investigations).id,
                name=target_names[i],
                type=random.choice(target_types),
                details=target_details[i],
                status=random.choice(case_statuses)
            )
            db.session.add(target)
        
        db.session.commit()
        
        print("Database initialized with sample data.")

if __name__ == "__main__":
    init_db()
