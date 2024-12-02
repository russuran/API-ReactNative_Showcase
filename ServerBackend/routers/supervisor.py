import datetime

from fastapi import (
    APIRouter,
    Depends,
)

from deps import db_dep, get_current_user
from models import *
from validation import *

router = APIRouter(prefix="/supervisor")


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
            ret["id"] = shift.id
            ret["time_start"] = (
                shift.time_start.strftime("%d.%m.%Y %H:%M")
                if shift.time_start
                else None
            )
            ret["time_end"] = (
                shift.time_end.strftime("%d.%m.%Y %H:%M")
                if shift.time_end
                else None
            )
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
async def get_shift(db: db_dep, user: User = Depends(get_current_user)):
    operators = (
        db.query(User)
        .filter(User.manufacture == user.manufacture, User.role == 1)
        .all()
    )
    return [
        {"name": operator.name, "id": operator.id} for operator in operators
    ]


@router.get("/lines")
async def get_lines(db: db_dep, user: User = Depends(get_current_user)):
    lines = (
        db.query(ProductionLine)
        .filter(ProductionLine.manufacture_id == user.manufacture)
        .all()
    )
    return [{"name": line.name, "id": line.id} for line in lines]


@router.get("/shift/{shift_id}")
async def get_shift_data(shift_id: int, db: db_dep):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    shift_lines = (
        db.query(ProductionLine)
        .filter(ProductionLine.id == shift.lines)
        .first()
    )
    shift_pipes = (
        db.query(ShiftPipe).filter(ShiftPipe.shift_id == shift.id).all()
    )

    for pipe in shift_pipes:
        pipe_obj: Pipe = db.query(Pipe).filter(Pipe.id == pipe.pipe_id).first()
        pipe.name = pipe_obj.name
        pipe.expected_mass = pipe_obj.meter_mass * pipe.produced
        spent = (
            db.query(ShiftSpent)
            .filter(ShiftSpent.shift_pipe_id == pipe.id)
            .all()
        )
        pipe.materials = []
        for s in spent:
            material = {}
            material["name"] = (
                db.query(Material)
                .filter(Material.id == s.material_id)
                .first()
                .name
            )
            material["amount"] = s.spent

            pipe.materials.append(material)


    return {
        "line": shift_lines.name,
        "time_start": shift.time_start.strftime("%d.%m.%Y %H:%M")
        if shift.time_start
        else None,
        "time_end": shift.time_end.strftime("%d.%m.%Y %H:%M")
        if shift.time_end
        else None,
        "done": shift.done,
        "approved": shift.approved,
        "pipes": shift_pipes,
    }


@router.post("/approve_shift/{shift_id}")
async def approve_shift(
    shift_id: int, db: db_dep, user: User = Depends(get_current_user)
):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()

    shift.approved = True

    db.commit()

    shift_pipes = (
        db.query(ShiftPipe).filter(ShiftPipe.shift_id == shift.id).all()
    )

    for shift_pipe in shift_pipes:
        pipe = (
            db.query(PipeInStock)
            .join(Storage)
            .filter(
                PipeInStock.pipe_id == shift_pipe.pipe_id,
                Storage.manufacture_id == user.manufacture,
            )
            .first()
        )

        if pipe is None:
            pipe_stock = PipeInStock()
            pipe_stock.amount = shift_pipe.produced
            pipe_stock.pipe_id = shift_pipe.pipe_id
            pipe_stock.storage_id = (
                db.query(Storage)
                .filter(Storage.local == True, Storage.id == user.manufacture)
                .first()
                .id
            )
            db.add(pipe_stock)
        else:
            pipe.amount += shift_pipe.produced
        db.commit()
    return {"status": "ok"}


@router.post("/create_shift")
async def create_shift(db: db_dep, data: ShiftSchema):
    shift = Shift(person_id=data.operator, lines=data.line)
    db.add(shift)
    db.commit()
    for pipe in data.pipes:
        shift_pipe = ShiftPipe()
        shift_pipe.planned_amount = pipe.amount
        shift_pipe.pipe_id = pipe.id
        shift_pipe.shift_id = shift.id
        db.add(shift_pipe)
    db.commit()
    return {"status": "ok"}


@router.post("/send-pipes")
async def send_pipes(
    db: db_dep,
    data: TransferPipesSchema,
    user: User = Depends(get_current_user),
):
    pipes = data.pipes
    from_storage = (
        db.query(Storage)
        .filter(Storage.manufacture_id == user.manufacture)
        .filter(Storage.local == True)
        .first()
    )
    to_storage = (
        db.query(Storage)
        .filter(Storage.manufacture_id == user.manufacture)
        .filter(Storage.local == False)
        .first()
    )

    for pipe in pipes:
        if (
            not db.query(PipeInStock)
            .filter(PipeInStock.storage_id == to_storage.id)
            .filter(PipeInStock.pipe_id == pipe.id)
            .first()
        ):
            material = PipeInStock()
            material.amount = 0
            material.pipe_id = pipe.id
            material.storage_id = to_storage.id
            db.add(material)
            db.commit()

        pipe_to = (
            db.query(PipeInStock)
            .filter(PipeInStock.storage_id == to_storage.id)
            .filter(PipeInStock.pipe_id == pipe.id)
            .first()
        )
        pipe_to.amount += pipe.amount
        db.commit()

        pipe_from = (
            db.query(PipeInStock)
            .filter(PipeInStock.pipe_id == pipe.id)
            .filter(PipeInStock.storage_id == from_storage.id)
        ).first()
        pipe_from.amount -= pipe.amount

        transfer = TransferPipe()
        transfer.amount = pipe.amount
        transfer.date = datetime.datetime.now()
        transfer.from_storage_id = from_storage.id
        transfer.to_storage_id = to_storage.id
        transfer.pipe_id = pipe.id

        db.add(transfer)

        db.commit()

    return {"status": "ok"}
