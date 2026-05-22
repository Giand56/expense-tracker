from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    description: str | None = None
    date: date


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: float
    category: str
    description: str | None
    date: date
    created_at: datetime
