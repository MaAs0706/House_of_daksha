import getpass
import os
import re
import sys
import uuid

import bcrypt
from dotenv import load_dotenv
from psycopg import connect
from psycopg.rows import dict_row

load_dotenv()


def main() -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise SystemExit("Set DATABASE_URL before creating an admin account.")
    email = (sys.argv[1] if len(sys.argv) > 1 else input("Admin email: ")).strip().lower()
    password = getpass.getpass("Admin password (12+ characters): ")
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise SystemExit("Enter a valid email address.")
    if not 12 <= len(password) <= 200:
        raise SystemExit("Password must be 12 to 200 characters.")
    if len(password.encode()) > 72:
        raise SystemExit("Password must be no more than 72 UTF-8 bytes.")
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
    with connect(database_url, row_factory=dict_row) as connection:
        connection.execute(
            "INSERT INTO admins(id,email,password_hash) VALUES(%s,%s,%s)",
            (str(uuid.uuid4()), email, password_hash),
        )
    print(f"Admin account created for {email}.")


if __name__ == "__main__":
    main()
