from calendar import monthrange
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


def _add_months(d: date, n: int) -> date:
    total = d.month - 1 + n
    year = d.year + total // 12
    month = total % 12 + 1
    day = min(d.day, monthrange(year, month)[1])
    return date(year, month, day)


def calc_next_billing(start: date, cycle: str) -> date:
    today = date.today()
    d = start
    if cycle == "monthly":
        while d < today:
            d = _add_months(d, 1)
    else:
        while d < today:
            d = date(d.year + 1, d.month, d.day)
    return d


@router.post("/", response_model=SubscriptionResponse, status_code=201)
def create_subscription(
    payload: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = Subscription(
        user_id=current_user.id,
        name=payload.name,
        amount=payload.amount,
        category=payload.category,
        billing_cycle=payload.billing_cycle,
        next_billing_date=calc_next_billing(payload.start_date, payload.billing_cycle),
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/", response_model=list[SubscriptionResponse])
def get_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Subscription)
        .filter(Subscription.user_id == current_user.id)
        .order_by(Subscription.next_billing_date)
        .all()
    )


@router.put("/{sub_id}", response_model=SubscriptionResponse)
def update_subscription(
    sub_id: int,
    payload: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.query(Subscription).filter(
        Subscription.id == sub_id, Subscription.user_id == current_user.id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.name = payload.name
    sub.amount = payload.amount
    sub.category = payload.category
    sub.billing_cycle = payload.billing_cycle
    sub.next_billing_date = calc_next_billing(payload.start_date, payload.billing_cycle)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/{sub_id}", status_code=204)
def delete_subscription(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.query(Subscription).filter(
        Subscription.id == sub_id, Subscription.user_id == current_user.id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(sub)
    db.commit()
