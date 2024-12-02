import datetime

from fastapi import (
    APIRouter,
    Depends,
)

from deps import db_dep, get_current_user
from models import *
from validation import *

router = APIRouter(prefix="/stock")


@router.post("/materials-supply")
def send_supply(
    db: db_dep,
    data: MaterialsSupplySchema,
    user: User = Depends(get_current_user),
):
    for material_data in data.materials:
        material = (
            db.query(MaterialInStock)
            .join(Storage)
            .filter(
                MaterialInStock.id == material_data.id,
                Storage.manufacture_id == user.manufacture,
                Storage.local == False,
            )
            .first()
        )

        if material is not None:
            st_id = material.storage_id
            material.amount += material_data.amount
        else:
            storage = (
                db.query(Storage)
                .filter(
                    Storage.manufacture_id == user.manufacture,
                    Storage.local == False,
                )
                .first()
            )
            storage_id = storage.id
            stock = MaterialInStock()
            stock.material_id = material_data.id
            stock.amount = material_data.amount
            stock.storage_id = storage_id
            db.add(stock)

            st_id = storage.id

        supply = MaterialsSupply()
        supply.date = datetime.datetime.now()
        supply.car_num = data.car_num
        supply.amount = material_data.amount
        supply.material_id = material_data.id
        supply.storage_id = st_id
        db.add(supply)
    db.commit()
    return {"status": "ok"}


# 1 - оператор
# 2 - кладовщик
# 3 - супервизор
