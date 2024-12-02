from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Float
)

from database import Base


class User(Base):
    __tablename__ = "User"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    login = Column(String)
    password = Column(String)
    manufacture = Column(Integer, ForeignKey("Manufacture.id"))
    role = Column(Integer, ForeignKey("Role.id"))


class Session(Base):
    __tablename__ = "Session"

    id = Column(Integer, primary_key=True)
    session_key = Column(String)
    user_id = Column(Integer, ForeignKey("User.id"))


class Role(Base):
    __tablename__ = "Role"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    can_view_stock = Column(Boolean)
    can_manage_people = Column(Boolean)
    can_operate = Column(Boolean)
    can_stockware = Column(Boolean)


class Pipe(Base):
    __tablename__ = "Pipe"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    sdr = Column(String)
    diam = Column(Integer)
    length = Column(Integer)
    weight = Column(Integer)
    meter_mass = Column(Float)


class ProductionLine(Base):
    __tablename__ = "ProductionLine"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    max_production = Column(Integer)
    manufacture_id = Column(Integer, ForeignKey("Manufacture.id"))


class Manufacture(Base):
    __tablename__ = "Manufacture"

    id = Column(Integer, primary_key=True)
    name = Column(String)


class Shift(Base):
    __tablename__ = "Shift"

    id = Column(Integer, primary_key=True)
    time_start = Column(DateTime, nullable=True)
    time_end = Column(DateTime, nullable=True)
    lines = Column(Integer)
    person_id = Column(Integer, ForeignKey("User.id"))
    done = Column(Boolean)
    approved = Column(Boolean)


class ShiftPipe(Base):
    __tablename__ = "ShiftPipe"

    id = Column(Integer, primary_key=True)
    shift_id = Column(Integer, ForeignKey("Shift.id"))
    pipe_id = Column(Integer, ForeignKey("Pipe.id"))
    planned_amount = Column(Integer)
    produced = Column(Integer)
    producedMass = Column(Integer)
    defect = Column(Integer)
    defectReason = Column(String)


class ShiftSpent(Base):
    __tablename__ = "ShiftSpent"

    id = Column(Integer, primary_key=True)
    shift_pipe_id = Column(Integer, ForeignKey("ShiftPipe.id"))
    material_id = Column(Integer, ForeignKey("Material.id"))
    spent = Column(Integer)


class Storage(Base):
    __tablename__ = "Storage"

    id = Column(Integer, primary_key=True)
    manufacture_id = Column(Integer, ForeignKey("Manufacture.id"))
    local = Column(Boolean)
    name = Column(String)


class MaterialInStock(Base):
    __tablename__ = "MaterialInStock"

    id = Column(Integer, primary_key=True)
    storage_id = Column(Integer, ForeignKey("Storage.id"))
    amount = Column(Integer)
    material_id = Column(Integer, ForeignKey("Material.id"))


class Material(Base):
    __tablename__ = "Material"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    manufacturer_id = Column(Integer, ForeignKey("Manufacturer.id"))


class Manufacturer(Base):
    __tablename__ = "Manufacturer"

    id = Column(Integer, primary_key=True)
    name = Column(String)


class PipeInStock(Base):
    __tablename__ = "PipeInStock"

    id = Column(Integer, primary_key=True)
    pipe_id = Column(Integer)
    amount = Column(Integer)
    storage_id = Column(Integer, ForeignKey("Storage.id"))


class MaterialsSupply(Base):
    __tablename__ = "MaterialsSupply"

    id = Column(Integer, primary_key=True)
    date = Column(DateTime)
    details = Column(String)
    amount = Column(Integer)
    material_id = Column(Integer, ForeignKey("Material.id"))
    storage_id = Column(Integer, ForeignKey("Storage.id"))


class TransferMaterial(Base):
    __tablename__ = "TransferMaterial"

    id = Column(Integer, primary_key=True)
    date = Column(DateTime)
    from_storage_id = Column(Integer, ForeignKey("Storage.id"))
    to_storage_id = Column(Integer, ForeignKey("Storage.id"))
    material_id = Column(Integer, ForeignKey("Material.id"))
    amount = Column(Integer)


class TransferPipe(Base):
    __tablename__ = "TransferPipe"

    id = Column(Integer, primary_key=True)
    date = Column(DateTime)
    from_storage_id = Column(Integer, ForeignKey("Storage.id"))
    to_storage_id = Column(Integer, ForeignKey("Storage.id"))
    pipe_id = Column(Integer, ForeignKey("Pipe.id"))
    amount = Column(Integer)
