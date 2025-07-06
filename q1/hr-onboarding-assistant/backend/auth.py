import os
from fastapi.security import HTTPBasicCredentials
from dotenv import load_dotenv
import secrets

load_dotenv()

def verify_credentials(credentials: HTTPBasicCredentials) -> bool:
    """
    Verify HTTP Basic Auth credentials against environment variables
    """
    correct_username = os.getenv("ADMIN_USERNAME", "admin")
    correct_password = os.getenv("ADMIN_PASSWORD", "admin")
    
    is_correct_username = secrets.compare_digest(
        credentials.username.encode("utf8"),
        correct_username.encode("utf8")
    )
    is_correct_password = secrets.compare_digest(
        credentials.password.encode("utf8"),
        correct_password.encode("utf8")
    )
    
    return is_correct_username and is_correct_password 