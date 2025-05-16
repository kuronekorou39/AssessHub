from app import create_app, db
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
import time

app = create_app()

def wait_for_db(app):
    for i in range(10):
        try:
            with app.app_context():
                with db.engine.connect() as conn:  # ← これ！
                    conn.execute(text("SELECT 1"))
            print("✅ Database is ready.")
            return
        except OperationalError as e:
            print(f"⏳ Waiting for DB... ({i+1}/10): {e}")
            time.sleep(1)
    print("❌ Could not connect to the database.")
    exit(1)

wait_for_db(app)

with app.app_context():
    db.create_all()
    
if __name__ == '__main__':
    app.run()
