import datetime

from fastapi import (
    APIRouter,
    Depends,
)

from deps import db_dep, get_current_user
from models import *
from validation import *

router = APIRouter(prefix="/operator")


@router.get("/shift")
async def get_shift(db: db_dep, user: User = Depends(get_current_user)):
    print(user.id)
    shift = (
        db.query(Shift)
        .filter(Shift.person_id == user.id, Shift.done == None)
        .first()
    )

    if shift is None:
        return None

    shift.lines = (
        db.query(ProductionLine)
        .filter(ProductionLine.id == shift.lines)
        .first()
    )

    # pipe = db.query(Pipe).filter(Pipe.id == shift.pipe_id).first().name
    pipes = db.query(ShiftPipe).filter(ShiftPipe.shift_id == shift.id).all()
    for pipe in pipes:
        pipe.name = db.query(Pipe).filter(Pipe.id == pipe.pipe_id).first().name

    return {
        "line": shift.lines.name,
        "time_start": shift.time_start,
        "done": shift.done,
        "pipes": pipes,
    }


@router.post("/start_shift")
async def start_shift(db: db_dep, user: User = Depends(get_current_user)):
    shift = (
        db.query(Shift)
        .filter(Shift.person_id == user.id, Shift.time_start == None)
        .first()
    )
    shift.time_start = datetime.datetime.now()
    db.commit()

    return {"status": "ok"}


# конец смены
@router.post("/end_shift")
async def end_shift(
    db: db_dep,
    data: List[CloseShiftPipeSchema],
    user: User = Depends(get_current_user),
):
    shift = (
        db.query(Shift)
        .filter(Shift.person_id == user.id, Shift.done == None)  # wtf
        .first()
    )

    for pipe in data:
        for material in pipe.materials:
            material_in_stock = (
                db.query(MaterialInStock)
                .join(Storage)
                .filter(
                    MaterialInStock.material_id == material.id,
                    Storage.manufacture_id == user.manufacture,
                    Storage.local == True,
                )
                .first()
            )
            if (
                material_in_stock is None
                or material_in_stock.amount - material.amount < 0
            ):
                return {
                    "error": "На складе нет нужного количества сырья"
                    ", сообщите об ошибке начальнику смены"
                }
    for pipe in data:
        shift_pipe = (
            db.query(ShiftPipe).filter(ShiftPipe.id == pipe.pipe_id).first()
        )
        shift_pipe.produced = pipe.produced
        shift_pipe.producedMass = pipe.producedMass
        shift_pipe.defect = pipe.defect
        shift_pipe.defectReason = pipe.defectReason

        for material in pipe.materials:
            material_in_stock = (
                db.query(MaterialInStock)
                .join(Storage)
                .filter(
                    MaterialInStock.material_id == material.id,
                    Storage.manufacture_id == user.manufacture,
                    Storage.local == True,
                )
                .first()
            )
            material_in_stock.amount -= material.amount
            shift_spent = ShiftSpent()
            shift_spent.material_id = material.id
            shift_spent.shift_pipe_id = shift_pipe.id
            shift_spent.spent = material.amount
            db.add(shift_spent)

    shift.done = True
    shift.time_end = datetime.datetime.now()

    db.commit()

    return {"status": "ok"}
