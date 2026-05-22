from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SubscriptionCreate(BaseModel):
    name: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    billing_cycle: Literal["monthly", "yearly"]
    start_date: date


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    amount: float
    category: str
    billing_cycle: str
    next_billing_date: date
    created_at: datetime
