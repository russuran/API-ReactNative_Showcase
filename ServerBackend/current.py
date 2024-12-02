from fastapi import (
    APIRouter,
    Depends,
)

from deps import db_dep, get_current_user
from models import *
from validation import *

router = APIRouter(prefix="/current")


@router.get("/user")
async def get_user(db: db_dep, user: User = Depends(get_current_user)):
    user = user.__dict__
    user["manufacture"] = (
        db.query(Manufacture)
        .filter(Manufacture.id == user["manufacture"])
        .first()
        .name
    )
    return user


@router.get("/shift")
async def get_shift(db: db_dep, user: User = Depends(get_current_user)):
    shift = (
        db.query(Shift)
        .filter(Shift.person_id == user.id and Shift.time_start is None)
        .first()
    )
    if shift is None:
        return None
    shift.lines = (
        db.query(ProductionLine)
        .filter(ProductionLine.id == shift.lines)
        .first()
    )

    return {"planned_amount": shift.planned_amount, "line": shift.lines.name}


@router.get("/shifts")
async def get_shifts(db: db_dep, user: User = Depends(get_current_user)):
    ret_list = []

    all_shifts = db.query(Shift).all()

    for shift in all_shifts:
        ret = {}
        shift_person = (
            db.query(User).filter(User.id == shift.person_id).first()
        )
        if shift_person.manufacture == user.manufacture:
            ret["time_start"] = shift.time_start
            ret["time_end"] = shift.time_end
            ret["line"] = (
                db.query(ProductionLine)
                .filter(ProductionLine.id == shift.lines)
                .first()
                .name
            )
            ret["operator"] = shift_person.name
        ret_list.append(ret)

    return ret_list


@router.get("/operators")
async def get_operators(db: db_dep, user: User = Depends(get_current_user)):
    operators = (
        db.query(User)
        .filter(User.manufacture == user.manufacture and User.Role == 2)
        .all()
    )
    return [
        {"name": operator.name, "id": operator.id} for operator in operators
    ]


# 1 - супервизор
# 2 - оператор
# 3 - кладовщик


@router.get("/lines")
async def get_lines(db: db_dep, user: User = Depends(get_current_user)):
    lines = (
        db.query(ProductionLine)
        .filter(ProductionLine.manufacture_id == user.manufacture)
        .all()
    )
    return [{"name": line.name, "id": line.id} for line in lines]


@router.get("/manufacture")
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


@router.get("/storage-history")
async def storage_history(db: db_dep, user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user.id).first()

    data_supplies = (
        db.query(MaterialsSupply)
        .filter(MaterialsSupply.storage_id == user.manufacture)
        .all()
    )
    # 1 - кладовщик
    data_sends = (
        db.query(TransferMaterial)
        .filter(
            TransferMaterial.from_storage_id == user.manufacture
        )  # 2 - нащальника
        .all()
    )

    data_supplies = sorted(data_supplies, key=lambda x: x.date)

    data_sends = sorted(data_sends, key=lambda x: x.date)

    ret_list = []

    for element in data_supplies:
        ret = {}
        ret["type"] = "Поступление сырья"
        ret["date"] = element.date
        ret["material"] = (
            db.query(Material)
            .filter(Material.id == element.material_id)
            .first()
            .name
        )

        ret_list.append(ret)

    for element in data_supplies:
        ret = {}
        ret["type"] = "Отправка сырья"
        ret["date"] = element.date
        ret["material"] = (
            db.query(Material)
            .filter(Material.id == element.material_id)
            .first()
            .name
        )

        ret_list.append(ret)

    return ret_list



@router.get("/storage-pipes")
async def get_storage_pipes(
    db: db_dep, user: User = Depends(get_current_user)
):
    pipes = (
        db.query(PipeInStock)
        .filter(PipeInStock.storage_id == user.manufacture)
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


@router.get("/storage")
async def get_cur_materials(
    db: db_dep, user: User = Depends(get_current_user)
):
    return (
        db.query(MaterialInStock)
        .join(Material)
        .join(Storage)
        .filter(Storage.manufacture_id == user.manufacture)
        .add_columns(
            Material.name,
            MaterialInStock.amount,
        )
        .add_columns(Material.name)
        .all()
    )
