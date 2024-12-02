import datetime
import random
import string

import uvicorn
from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
)
from fastapi.middleware.cors import CORSMiddleware

from deps import db_dep, get_current_user
from models import *
from routers.operator import router as operator_router
from routers.stock import router as stock_router
from routers.supervisor import router as supervisor_router
from validation import *

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(stock_router)
app.include_router(operator_router)
app.include_router(supervisor_router)


@app.post("/auth")
def auth(db: db_dep, data: LoginSchema):
    user = db.query(User).filter(User.login == data.login).first()
    if user is not None:
        if user.password == data.password:
            session = Session()
            session.user_id = user.id
            session.session_key = "".join(
                random.choice(string.ascii_uppercase + string.digits)
                for _ in range(32)
            )

            db.add(session)
            db.commit()

            user = db.query(User).filter(User.login == data.login).first()
            return {"user": user, "session_key": session.session_key}

        return {"error": "Неверный пароль"}
    return {"error": "Неверный логин"}


@app.get("/current-user")
async def get_user(db: db_dep, user: User | None = Depends(get_current_user)):
    if user is None:
        return None
    user = user.__dict__
    user["manufacture"] = (
        db.query(Manufacture)
        .filter(Manufacture.id == user["manufacture"])
        .first()
        .name
    )
    del user["password"]
    return user


@app.get("/manufacture")
async def get_manufacture(
    db: db_dep, user: User | None = Depends(get_current_user)
):
    if user is None:
        return {"name": "Войдите в аккаунт"}
    return {
        "name": db.query(Manufacture)
        .filter(Manufacture.id == user.manufacture)
        .first()
        .name
    }


@app.get("/storage-history")
async def get_lines(db: db_dep, user: User = Depends(get_current_user)):
    local = user.role == 3
    ret_list = []
    data_supplies = (
        db.query(MaterialsSupply)
        .join(Storage)
        .filter(
            Storage.manufacture_id == user.manufacture, Storage.local == local
        )
        .all()
    )
    # 1 - кладовщик
    data_sends = (
        db.query(TransferMaterial)
        .join(Storage, Storage.id == TransferMaterial.from_storage_id)
        .filter(
            Storage.manufacture_id == user.manufacture, Storage.local == local
        )
        .all()
    )
    data_receive = (
        db.query(TransferMaterial)
        .join(Storage, Storage.id == TransferMaterial.to_storage_id)
        .filter(
            Storage.manufacture_id == user.manufacture, Storage.local == local
        )
        .all()
    )
    pipe_receive = (
        db.query(TransferPipe)
        .join(Storage, Storage.id == TransferPipe.to_storage_id)
        .filter(
            Storage.manufacture_id == user.manufacture, Storage.local == local
        )
        .all()
    )
    pipe_send = (
        db.query(TransferPipe)
        .join(Storage, Storage.id == TransferPipe.from_storage_id)
        .filter(
            Storage.manufacture_id == user.manufacture, Storage.local == local
        )
        .all()
    )

    for element in pipe_receive:
        ret = {}
        ret["type"] = "Поступление трубы"
        ret["date"] = (
            element.date.strftime("%d.%m.%Y %H:%M") if element.date else None
        )
        ret["item"] = (
            db.query(Pipe).filter(Pipe.id == element.pipe_id).first().name
        )
        ret["amount"] = element.amount
        ret_list.append(ret)
    for element in pipe_send:
        ret = {}
        ret["type"] = "Отправка трубы"
        ret["date"] = (
            element.date.strftime("%d.%m.%Y %H:%M") if element.date else None
        )
        ret["item"] = (
            db.query(Pipe).filter(Pipe.id == element.pipe_id).first().name
        )
        ret["amount"] = element.amount
        ret_list.append(ret)
    for element in data_supplies:
        ret = {}
        ret["type"] = "Поступление сырья"
        ret["date"] = (
            element.date.strftime("%d.%m.%Y %H:%M") if element.date else None
        )
        ret["item"] = (
            db.query(Material)
            .filter(Material.id == element.material_id)
            .first()
            .name
        )
        ret["amount"] = element.amount
        ret_list.append(ret)

    for element in data_sends:
        ret = {}
        ret["type"] = "Отправка Сырья"
        ret["date"] = (
            element.date.strftime("%d.%m.%Y %H:%M") if element.date else None
        )
        ret["item"] = (
            db.query(Material)
            .filter(Material.id == element.material_id)
            .first()
            .name
        )
        ret["amount"] = element.amount
        ret_list.append(ret)

    for element in data_receive:
        ret = {}
        ret["type"] = "Получение Сырья"
        ret["date"] = (
            element.date.strftime("%d.%m.%Y %H:%M") if element.date else None
        )
        ret["item"] = (
            db.query(Material)
            .filter(Material.id == element.material_id)
            .first()
            .name
        )
        ret["amount"] = element.amount

        ret_list.append(ret)

    # date is in format d.m.y . make it sortable
    ret_list.sort(
        key=lambda x: datetime.datetime.strptime(
            x["date"] if x["date"] else "", "%d.%m.%Y %H:%M"
        ),
        reverse=True,
    )

    return ret_list


@app.get("/storage-pipes")
async def get_storage_pipes(
    db: db_dep, user: User = Depends(get_current_user)
):
    pipes = (
        db.query(PipeInStock)
        .join(Storage)
        .filter(Storage.manufacture_id == user.manufacture)
        .filter(Storage.local == (user.role == 3))
        .all()
    )
    # кто прочитал тот пидор

    ret_list = []

    for pipe in pipes:
        ret = {}

        pipe_name = db.query(Pipe).filter(Pipe.id == pipe.pipe_id).first().name

        ret["name"] = pipe_name
        ret["amount"] = pipe.amount

        ret_list.append(ret)

    return ret_list


@app.get("/storage")
async def get_cur_materials(
    db: db_dep, user: User = Depends(get_current_user)
):
    return (
        db.query(MaterialInStock)
        .join(Material)
        .join(Storage)
        .filter(Storage.manufacture_id == user.manufacture)
        .filter(Storage.local == (user.role == 3))
        .add_columns(
            Material.name,
            MaterialInStock.amount,
        )
        .all()
    )


#
@app.post("/users/", response_model=UserSchema)
def create_user(user: UserSchema, db: db_dep):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# общие функции
@app.get("/manufacturer/{id}")
def get_manufacturer_from_id(id: int, db: db_dep):
    materials = db.query(Manufacturer).filter(Manufacturer.id == id).first()
    if materials is None:
        raise HTTPException(status_code=404, detail="Manufacturer not found")
    return materials


# прием сырья
@app.get("/materials")
def get_all_materials(db: db_dep):
    materials = db.query(Material).all()
    return materials


@app.get("/pipes")
async def get_all_pipes(db: db_dep):
    return db.query(Pipe).all()


# трансфер между складами (from - to)
@app.post("/send_to_manufacture")
async def send_to_manufacture(
    db: db_dep, data: MaterialsSchema, user: User = Depends(get_current_user)
):
    materials = data.materials
    from_local = user.role == 3
    from_storage = (
        db.query(Storage)
        .filter(Storage.manufacture_id == user.manufacture)
        .filter(Storage.local == from_local)
        .first()
    )
    to_storage = (
        db.query(Storage)
        .filter(Storage.manufacture_id == user.manufacture)
        .filter(Storage.local != from_local)
        .first()
    )

    for i in range(len(materials)):
        if (
            not db.query(MaterialInStock)
            .filter(MaterialInStock.storage_id == to_storage.id)
            .filter(MaterialInStock.material_id == materials[i].id)
            .first()
        ):
            material = MaterialInStock()
            material.amount = 0
            material.material_id = materials[i].id
            material.storage_id = to_storage.id
            db.add(material)
            db.commit()

        material = (
            db.query(MaterialInStock)
            .filter(MaterialInStock.storage_id == to_storage.id)
            .filter(MaterialInStock.material_id == materials[i].id)
            .first()
        )
        material.amount += materials[i].amount
        db.commit()

        material_decrease = (
            db.query(MaterialInStock)
            .filter(MaterialInStock.material_id == materials[i].id)
            .filter(MaterialInStock.storage_id == from_storage.id)
        ).first()
        material_decrease.amount -= materials[i].amount

        transfer = TransferMaterial()
        transfer.amount = materials[i].amount
        transfer.date = datetime.datetime.now()
        transfer.material_id = materials[i].id
        transfer.from_storage_id = from_storage.id
        transfer.to_storage_id = to_storage.id
        db.add(transfer)
        db.commit()

    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", reload=True)
