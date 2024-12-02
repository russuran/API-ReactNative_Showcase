from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

URL_DATABASE = "sqlite:///db/data.db"

engine = create_engine(
    URL_DATABASE, echo=False, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)


Base = declarative_base()
