import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Radio, MessageCircle, Reply } from 'lucide-react';
import { toast } from 'sonner';

import StatsCards from '@/components/dashboard/StatsCards';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import TruckDriverSidebar from '@/components/dashboard/TruckDriverSidebar';
import MapPlaceholder from '@/components/dashboard/MapPlaceholder';
import NewOrderModal from '@/components/modals/NewOrderModal';
import OrderDetailModal from '@/components/modals/OrderDetailModal';
import BroadcastModal from '@/components/modals/BroadcastModal';

const SAMPLE_COMPANIES_FOR_SIM = ['Grupo Roble', 'PanAmericana SA', 'Metro Holdings'];
const SAMPLE_MIXES = ['210', '245', '280', '315', '350'];

export default function Dashboard() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [broadcastOrder, setBroadcastOrder] = useState(null);

  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => base44.entities.Order.list('-created_date', 100) });
  const { data: trucks = [] } = useQuery({ queryKey: ['trucks'], queryFn: () => base44.entities.Truck.list() });
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: () => base44.entities.Driver.list() });
  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: () => base44.entities.Company.list() });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: () => base44.entities.DeliveryLocation.list() });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['trucks'] });
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
  };

  const simulateWhatsAppOrder = async () => {
    if (companies.length === 0 || locations.length === 0) {
      return toast.error('Need companies & locations first');
    }
    const company = companies[Math.floor(Math.random() * companies.length)];
    const companyLocations = locations.filter(l => l.company_id === company.id);
    const loc = companyLocations.length > 0 ? companyLocations[0] : locations[0];
    const mix = SAMPLE_MIXES[Math.floor(Math.random() * SAMPLE_MIXES.length)];
    const qty = Math.round((4 + Math.random() * 6) * 2) / 2;
    const orderNum = `ORD-${String(orders.length + 1).padStart(3, '0')}`;
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + 30 + Math.floor(Math.random() * 120));

    const newOrder = await base44.entities.Order.create({
      order_number: orderNum,
      company_id: company.id,
      company_name: company.name,
      delivery_location_id: loc.id,
      delivery_location_name: loc.name,
      delivery_address: loc.address || '',
      mix_type: mix,
      quantity_m3: qty,
      scheduled_time: scheduledTime.toISOString(),
      status: 'new',
      priority: Math.random() > 0.7 ? 'urgent' : 'normal',
    });
    toast.success(t('simulatedOrder'));
    refresh();
  };

  const simulateDriverReply = async () => {
    const newOrders = orders.filter(o => o.status === 'new');
    if (newOrders.length === 0) return toast.error('No new orders to assign');
    const availTrucks = trucks.filter(tr => tr.status === 'available');
    const availDrivers = drivers.filter(dr => dr.availability === 'available');
    if (availTrucks.length === 0 || availDrivers.length === 0) return toast.error('No available trucks/drivers');

    const order = newOrders[0];
    const truck = availTrucks[Math.floor(Math.random() * availTrucks.length)];
    const driver = availDrivers[Math.floor(Math.random() * availDrivers.length)];

    await base44.entities.Order.update(order.id, {
      status: 'assigned',
      assigned_truck_id: truck.id,
      assigned_truck_plate: truck.plate,
      assigned_driver_id: driver.id,
      assigned_driver_name: driver.name,
    });
    await base44.entities.Truck.update(truck.id, { status: 'loading', current_driver_id: driver.id, current_driver_name: driver.name });
    await base44.entities.Driver.update(driver.id, { availability: 'on_route' });

    toast.success(t('driverAccepted', { driver: driver.name, order: order.order_number, truck: truck.truck_id, eta: String(15 + Math.floor(Math.random() * 30)) }));
    refresh();
  };

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setShowNewOrder(true)} className="gap-2">
          <Plus className="w-4 h-4" /> {t('newOrder')}
        </Button>
        <Button variant="outline" onClick={() => {
          const newOrder = orders.find(o => o.status === 'new');
          if (newOrder) setBroadcastOrder(newOrder);
          else toast.error('No new orders');
        }} className="gap-2">
          <Radio className="w-4 h-4" /> {t('broadcastAssignment')}
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" onClick={simulateWhatsAppOrder} className="gap-2 text-xs">
          <MessageCircle className="w-3.5 h-3.5" /> {t('simulateWhatsApp')}
        </Button>
        <Button variant="secondary" onClick={simulateDriverReply} className="gap-2 text-xs">
          <Reply className="w-3.5 h-3.5" /> {t('simulateDriverReply')}
        </Button>
      </div>

      <StatsCards orders={orders} trucks={trucks} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-5">
          <KanbanBoard orders={orders} onOrderClick={setSelectedOrder} />
          <MapPlaceholder trucks={trucks} />
        </div>
        <TruckDriverSidebar trucks={trucks} drivers={drivers} />
      </div>

      <NewOrderModal
        open={showNewOrder}
        onClose={() => setShowNewOrder(false)}
        companies={companies}
        locations={locations}
        existingOrders={orders}
        onRefresh={refresh}
      />
      <OrderDetailModal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        trucks={trucks}
        drivers={drivers}
        onRefresh={refresh}
      />
      <BroadcastModal
        open={!!broadcastOrder}
        onClose={() => setBroadcastOrder(null)}
        order={broadcastOrder}
      />
    </div>
  );
}