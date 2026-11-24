'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiTruck } from 'react-icons/fi';

type ShipmentStatus = 'Pending' | 'Shipped' | 'Delivered';
type ShipmentFilter = 'All' | ShipmentStatus;

interface Shipment {
  id: string;
  order: string;
  carrier: string;
  tracking: string;
  status: ShipmentStatus;
}

const SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-101',
    order: '#3001',
    carrier: 'FedEx',
    tracking: 'TRK-9F2K1A',
    status: 'Pending',
  },
  {
    id: 'SHP-102',
    order: '#3002',
    carrier: 'UPS',
    tracking: 'TRK-7B4X2C',
    status: 'Shipped',
  },
  {
    id: 'SHP-103',
    order: '#3003',
    carrier: 'DHL',
    tracking: 'TRK-3M8N5D',
    status: 'Delivered',
  },
  {
    id: 'SHP-104',
    order: '#3004',
    carrier: 'FedEx',
    tracking: 'TRK-6P1Q9E',
    status: 'Pending',
  },
  {
    id: 'SHP-105',
    order: '#3005',
    carrier: 'USPS',
    tracking: 'TRK-2R5T7F',
    status: 'Delivered',
  },
];

const FILTERS: ShipmentFilter[] = ['All', 'Pending', 'Shipped', 'Delivered'];

const getStatusBadge = (status: ShipmentStatus) => {
  switch (status) {
    case 'Shipped':
      return <span className="badge badge-info badge-sm">Shipped</span>;
    case 'Delivered':
      return <span className="badge badge-success badge-sm">Delivered</span>;
    default:
      return <span className="badge badge-warning badge-sm">Pending</span>;
  }
};

export const ShipmentsTemplate: FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>(SHIPMENTS);
  const [filter, setFilter] = useState<ShipmentFilter>('All');

  const visible = shipments.filter(
    (shipment) => filter === 'All' || shipment.status === filter
  );

  const markShipped = (id: string) => {
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === id ? { ...shipment, status: 'Shipped' } : shipment
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Manage fulfillment and tracking.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`tab ${filter === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Shipment</th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Carrier</th>
                    <th className="px-4 py-3 font-medium">Tracking</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {shipment.id}
                      </td>
                      <td className="px-4 py-3 text-sm">{shipment.order}</td>
                      <td className="px-4 py-3 text-sm">{shipment.carrier}</td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {shipment.tracking}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(shipment.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {shipment.status === 'Pending' && (
                          <button
                            onClick={() => markShipped(shipment.id)}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiTruck />
                            Mark shipped
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

ShipmentsTemplate.displayName = 'ShipmentsTemplate';
