import { Check, X, Clock } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { OrderStatus } from '@/shared/types/enums';

interface Step {
  key: OrderStatus;
  label: string;
}

const MAIN_STEPS: Step[] = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'COMPLETED', label: 'Completed' },
];

const STATUS_STEP_INDEX: Partial<Record<OrderStatus, number>> = {
  PENDING: 0,
  AWAITING_PAYMENT: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  COMPLETED: 5,
};

const TERMINAL_STATUSES: OrderStatus[] = ['CANCELLED', 'REFUNDED'];

interface OrderStatusStepperProps {
  status: OrderStatus;
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const isTerminal = TERMINAL_STATUSES.includes(status);
  const currentIndex = STATUS_STEP_INDEX[status] ?? 0;
  const isAwaitingPayment = status === 'AWAITING_PAYMENT';

  return (
    <div>
      {isTerminal ? (
        <div role="status" className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger-100">
            <X className="h-4 w-4 text-danger-600" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-danger-700">
              Order {status === 'CANCELLED' ? 'Cancelled' : 'Refunded'}
            </p>
            <p className="text-xs text-gray-400">This order is no longer active.</p>
          </div>
        </div>
      ) : (
        <ol role="list" aria-label="Order progress" className="flex items-start">
          {MAIN_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <li
                key={step.key}
                aria-current={isCurrent ? 'step' : undefined}
                className="flex flex-1 items-start"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
                      isCompleted && 'h-8 w-8 border-success-500 bg-success-500',
                      isCurrent && 'h-9 w-9 border-primary-600 bg-primary-600 ring-4 ring-primary-100 ring-offset-1',
                      isFuture && 'h-8 w-8 border-gray-200 bg-white',
                    )}
                    aria-hidden
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : isCurrent ? (
                      isAwaitingPayment && index === 0 ? (
                        <Clock className="h-4 w-4 text-white" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <p
                    className={cn(
                      'mt-2 text-center text-xs whitespace-nowrap',
                      isCompleted && 'font-medium text-success-700',
                      isCurrent && 'font-semibold text-primary-700',
                      isFuture && 'font-medium text-gray-400',
                    )}
                  >
                    {step.label}
                    {isCurrent && isAwaitingPayment && index === 0 && (
                      <span className="block text-warning-600">Awaiting payment</span>
                    )}
                  </p>
                </div>

                {index < MAIN_STEPS.length - 1 && (
                  <div className="mx-2 mt-[17px] h-1 flex-1" aria-hidden>
                    <div
                      className={cn(
                        'h-full rounded-full transition-colors duration-300',
                        index < currentIndex ? 'bg-success-400' : 'bg-gray-200',
                      )}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
