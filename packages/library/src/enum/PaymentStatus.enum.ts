// ref to stripe docs
//  type Status =
//         | 'active'
//         | 'canceled'
//         | 'incomplete'
//         | 'incomplete_expired'
//         | 'past_due'
//         | 'paused'
//         | 'trialing'
//         | 'unpaid';

export enum PaymentStatusEnum {
    ACTIVE = "active",
    CANCELED = "canceled",
    INCOMPLETE = "incomplete",
    INCOMPLETE_EXPIRED = "incomplete_expired",
    PAST_DUE = "past_due",
    PAUSED = "paused",
    TRIALING = "trialing",
    UNPAID = "unpaid",
    WTS_PAID = "wts_paid",
}
