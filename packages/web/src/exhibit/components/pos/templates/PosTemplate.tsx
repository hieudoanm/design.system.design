'use client';

import { type FC } from 'react';
import { ViewToolbar } from '@/exhibit/components/pos/molecules';
import {
  Cart,
  DailySummary,
  DigitalReceipt,
  DiscountManager,
  GiftCardManager,
  InventoryManager,
  ItemCatalog,
  PaymentPanel,
  ReportingDashboard,
  ShiftManager,
  TaxConfigPanel,
  TransactionHistory,
  UserManager,
} from '@/exhibit/components/pos/organisms';
import type { PosView } from '@/exhibit/components/pos/types';
import { usePosState } from './usePosState';

export const PosTemplate: FC = () => {
  const pos = usePosState();
  const { view, setView } = pos;

  const goToSale = () => setView('sale');

  return (
    <div className="bg-base-100 flex h-screen flex-col overflow-hidden">
      {view === 'sale' && (
        <main className="container mx-auto flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-8">
          <ViewToolbar onSelect={(next) => setView(next)} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="col-span-1 md:col-span-2">
              <ItemCatalog items={pos.items} onAdd={pos.addItem} />
            </div>
            <div className="col-span-1">
              <Cart
                items={pos.cartItems}
                onUpdateQuantity={pos.setQuantity}
                onRemove={pos.removeItem}
                onCheckout={() => setView('payment')}
              />
            </div>
          </div>
        </main>
      )}

      {view === 'payment' && (
        <PaymentPanel
          total={pos.total}
          giftCards={pos.giftCards}
          discounts={pos.discounts}
          onPayment={pos.completePayment}
          onBack={goToSale}
        />
      )}

      {view === 'receipt' && pos.transaction && (
        <DigitalReceipt transaction={pos.transaction} onNewSale={pos.newSale} />
      )}

      {view === 'history' && (
        <TransactionHistory
          transactions={pos.transactions}
          onBack={goToSale}
          onVoid={pos.voidTransaction}
        />
      )}

      {view === 'daily' && (
        <DailySummary transactions={pos.transactions} onBack={goToSale} />
      )}

      {view === 'reports' && (
        <ReportingDashboard transactions={pos.transactions} onBack={goToSale} />
      )}

      {view === 'inventory' && (
        <InventoryManager
          items={pos.items}
          adjustments={pos.adjustments}
          onUpdateStock={pos.updateStock}
          onBack={goToSale}
        />
      )}

      {view === 'tax' && (
        <div className="container mx-auto max-w-md p-4 md:p-8">
          <TaxConfigPanel config={pos.taxConfig} onSave={pos.setTaxConfig} />
          <button className="btn btn-ghost btn-sm mt-4" onClick={goToSale}>
            Back
          </button>
        </div>
      )}

      {view === 'discounts' && (
        <DiscountManager
          discounts={pos.discounts}
          onAdd={(d) => pos.setDiscounts((prev) => [...prev, d])}
          onRemove={(id) =>
            pos.setDiscounts((prev) => prev.filter((d) => d.id !== id))
          }
          onBack={goToSale}
        />
      )}

      {view === 'gift-cards' && (
        <GiftCardManager
          giftCards={pos.giftCards}
          onAdd={(gc) => pos.setGiftCards((prev) => [...prev, gc])}
          onRemove={(id) =>
            pos.setGiftCards((prev) => prev.filter((g) => g.id !== id))
          }
          onBack={goToSale}
        />
      )}

      {view === 'users' && (
        <UserManager
          users={pos.users}
          currentUser={pos.currentUser}
          onAdd={(u) => pos.setUsers((prev) => [...prev, u])}
          onRemove={(id) =>
            pos.setUsers((prev) => prev.filter((u) => u.id !== id))
          }
          onBack={goToSale}
        />
      )}

      {view === 'shifts' && (
        <ShiftManager
          shifts={pos.shifts}
          currentShift={pos.currentShift}
          onOpen={pos.openShift}
          onClose={pos.closeShift}
          onBack={goToSale}
        />
      )}
    </div>
  );
};

export type { PosView };
