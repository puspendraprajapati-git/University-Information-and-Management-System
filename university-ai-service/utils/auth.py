import jwt
import logging

logger = logging.getLogger(__name__)

def extract_user_info_from_token(token: str) -> dict:
    """
    Decodes the JWT token without verification to extract payload.
    Signature verification is intentionally skipped here because the
    Node.js API Gateway and Spring Boot Backend will strictly verify it.
    """
    if not token:
        return {}
        
    try:
        # Strip 'Bearer ' if present
        if token.startswith('Bearer '):
            token = token[7:]
            
        payload = jwt.decode(token, options={"verify_signature": False})
        
        user_info = {
            "userId": payload.get("userId"),
            "role": payload.get("role"),
            "sub": payload.get("sub") # Usually the username/email
        }
        return user_info
    except Exception as e:
        logger.warning(f"Failed to decode token: {str(e)}")
        return {}
