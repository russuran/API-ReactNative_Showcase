from typing import List, Optional

from pydantic import BaseModel


class UserSchema(BaseModel):
    name: str
    login: str
    password: str
    manufacture: Optional[int]
    role: Optional[int]


class RoleSchema(BaseModel):
    name: str
    can_view_stock: bool
    can_manage_people: bool
    can_operate: bool
    can_stockware: bool


class PipeSchema(BaseModel):
    name: str
    sdr: str
    diam: int
    length: int
    weight: int


class ProductionLineSchema(BaseModel):
    name: str
    product_id: int
    max_production: int
    manufacture_id: int
    pipe_id: int


class ManufactureSchema(BaseModel):
    name: str


class ShiftSpentSchema(BaseModel):
    shift_id: int
    material_id: int
    given: int
    claimed_spent: int


class StorageSchema(BaseModel):
    manufacture_id: int
    local: bool
    name: str


class MaterialInStockSchema(BaseModel):
    storage_id: int


class MaterialSchema(BaseModel):
    name: str
    unit: str
    manufacturer: str


class PipeInStockSchema(BaseModel):
    pipe_id: int
    amount: int
    storage_id: int


class ListItem(BaseModel):
    id: int
    amount: int


class MaterialsSupplySchema(BaseModel):
    car_num: str
    # details: str
    materials: List[ListItem]


class TransferPipesSchema(BaseModel):
    pipes: List[ListItem]


class MaterialsSchema(BaseModel):
    materials: List[ListItem]


class CloseShiftPipeSchema(BaseModel):
    materials: List[ListItem]
    pipe_id: int
    defect: int
    defectReason: str
    produced: int
    producedMass: int


class ApproveShiftSchema(BaseModel):
    id: int


class LoginSchema(BaseModel):
    login: str
    password: str


class ShiftSchema(BaseModel):
    line: int
    operator: int
    pipes: List[ListItem]
