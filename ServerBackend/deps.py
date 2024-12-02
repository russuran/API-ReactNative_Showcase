from typing import Annotated

from fastapi import (
    Depends,
    Header,
)
from sqlalchemy.orm import Session

import models
from database import SessionLocal
from models import *
from validation import *


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dep = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: Session = Depends(get_db), authorization: str | None = Header(None)
):
    if authorization is None:
        return None
    session_key = authorization.strip()

    user = (
        db.query(User)
        .join(models.Session)
        .filter(models.Session.session_key == session_key)
        .first()
    )
    return user
