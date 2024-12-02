from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import (
    Manufacture,
    Manufacturer,
    Material,
    MaterialInStock,
    MaterialsSupply,
    Pipe,
    ProductionLine,
    Role,
    Shift,
    ShiftSpent,
    Storage,
    TransferMaterial,
    User,
)

# Создаем базу данных и сессию
URL_DATABASE = "sqlite:///db/data.db"

engine = create_engine(
    URL_DATABASE, echo=False, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()


def add_test_data():
    # Создаем роли
    role_admin = Role(
        name="Admin",
        can_view_stock=True,
        can_manage_people=True,
        can_operate=True,
        can_stockware=True,
    )
    role_user = Role(
        name="User",
        can_view_stock=True,
        can_manage_people=False,
        can_operate=False,
        can_stockware=False,
    )

    session.add_all([role_admin, role_user])
    session.commit()

    # Создаем пользователей
    user1 = User(
        name="Alice",
        login="alice",
        password="password123",
        manufacture=1,
        role=1,
    )
    user2 = User(
        name="Bob", login="bob", password="password123", manufacture=1, role=2
    )

    session.add_all([user1, user2])
    session.commit()

    # Создаем производственные линии
    manufacture = Manufacture(name="Manufacture A")
    session.add(manufacture)
    session.commit()

    production_line = ProductionLine(
        name="Line 1", max_production=100, manufacture_id=manufacture.id
    )
    session.add(production_line)
    session.commit()

    # Создаем трубы
    pipe1 = Pipe(name="Pipe A", sdr="SDR 11", diam=100, length=500, weight=50)
    session.add(pipe1)
    session.commit()

    # Создаем смены
    shift1 = Shift(
        time_start=datetime.now(),
        time_end=datetime.now() + timedelta(hours=8),
        lines=1,
        pipe_id=pipe1.id,
        planned_amount=100.0,
        person_id=user1.id,
        done=False,
        approved=False,
        defect=0,
        defectReason="",
    )
    session.add(shift1)
    session.commit()

    # Создаем материалы
    manufacturer = Manufacturer(name="Manufacturer A")
    session.add(manufacturer)
    session.commit()

    material1 = Material(name="Material A", manufacturer_id=manufacturer.id)
    session.add(material1)
    session.commit()

    # Создаем склады
    local_storage = Storage(
        manufacture_id=manufacture.id, local=True, name="Local Storage A"
    )
    external_storage = Storage(
        manufacture_id=manufacture.id, local=False, name="External Storage A"
    )

    session.add_all([local_storage, external_storage])
    session.commit()

    # Создаем запасы материалов
    material_in_local_storage = MaterialInStock(
        storage_id=local_storage.id, amount=100, material_id=material1.id
    )
    material_in_external_storage = MaterialInStock(
        storage_id=external_storage.id, amount=50, material_id=material1.id
    )

    session.add_all([material_in_local_storage, material_in_external_storage])
    session.commit()

    # Создаем поставки материалов
    materials_supply = MaterialsSupply(
        date=datetime.now(),
        details="Supply of Material A",
        amount=50,
        material_id=material1.id,
        storage_id=local_storage.id,
    )
    session.add(materials_supply)
    session.commit()

    # Создаем перемещения материалов
    transfer_material = TransferMaterial(
        date=datetime.now(),
        from_storage_id=local_storage.id,
        to_storage_id=external_storage.id,
        material_id=material1.id,
        amount=20,
    )
    session.add(transfer_material)
    session.commit()

    # Создаем записи о потратах смены
    shift_spent = ShiftSpent(
        shift_id=shift1.id, material_id=material1.id, spent=30
    )
    session.add(shift_spent)
    session.commit()


# Добавляем тестовые данные
add_test_data()

# Проверяем, что данные добавлены
for user in session.query(User).all():
    print(f"User: {user.name}, Role ID: {user.role}")

for role in session.query(Role).all():
    print(f"Role: {role.name}")

for shift in session.query(Shift).all():
    print(f"Shift ID: {shift.id}, Time Start: {shift.time_start}")

for storage in session.query(Storage).all():
    print(f"Storage: {storage.name}, Local: {storage.local}")

# Закрываем сессию
session.close()
