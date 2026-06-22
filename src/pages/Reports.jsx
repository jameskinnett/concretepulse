import React, { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart2, Download, FileSpreadsheet } from 'lucide-react';
import { exportDailyDispatch, exportDeliveryHistory } from '@/lib/pdfExport';
import { exportToCSV } from '@/lib/csvExport';
import { useRole } from '@/lib/useRole';
import { format } from 'date-fns';
import ReportFilters from '@/components/reports/ReportFilters';
import OverviewTab from '@/components/reports/OverviewTab';
import LocationsTab from '@/components/reports/LocationsTab';
import DriversTab from '@/components/reports/DriversTab';
import CustomersTab from '@/components/reports/CustomersTab';
import TrucksTab from '@/components/reports/TrucksTab';

export default function Reports() {
  const { t } = useI18n();
  const { canExportReports } = useRole();

  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: () => base44.entities.Company.list() });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: () => base44.entities.DeliveryLocation.list() });
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => base44.entities.Order.list('-completion_time', 500) });
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: () => base44.entities.Driver.list() });
  const { data: trucks = [] } = useQuery({ queryKey: ['trucks'], queryFn: () => base44.entities.Truck.list() });

  const [filters, setFilters] = useState({ dateFrom: null, dateTo: null, companyId: 'all', driverId: 'all', _preset: 'all' });

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderDate = o.scheduled_time || o.created_date;
      if (filters.dateFrom && (!orderDate || orderDate.slice(0, 10) < filters.dateFrom)) return false;
      if (filters.dateTo && (!orderDate || orderDate.slice(0, 10) > filters.dateTo)) return false;
      if (filters.companyId !== 'all' && o.company_id !== filters.companyId) return false;
      if (filters.driverId !== 'all' && o.assigned_driver_id !== filters.driverId) return false;
      return true;
    });
  }, [orders, filters]);

  const handleExportOrdersCSV = () => {
    const rows = filteredOrders.map((o) => ({
      'Order #': o.order_number || '',
      'Company': o.company_name || '',
      'Location': o.delivery_location_name || '',
      'Address': o.delivery_address || '',
      'Mix Type': o.mix_type || '',
      'Quantity (m³)': o.quantity_m3 || '',
      'Status': o.status || '',
      'Priority': o.priority || '',
      'Truck': o.assigned_truck_plate || '',
      'Driver': o.assigned_driver_name || '',
      'Scheduled': o.scheduled_time ? format(new Date(o.scheduled_time), 'yyyy-MM-dd HH:mm') : '',
      'Departed': o.departure_time ? format(new Date(o.departure_time), 'yyyy-MM-dd HH:mm') : '',
      'Completed': o.completion_time ? format(new Date(o.completion_time), 'yyyy-MM-dd HH:mm') : '',
      'Distance (km)': o.distance_km || '',
      'Notes': o.notes || '',
    }));
    exportToCSV(rows, `orders-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            {t('reports')}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('showingFiltered', { count: filteredOrders.length, total: orders.length })}
          </p>
        </div>
        {canExportReports && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={handleExportOrdersCSV}>
              <FileSpreadsheet className="w-3.5 h-3.5" /> {t('exportOrdersCSV')}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => exportDailyDispatch(filteredOrders)}>
              <Download className="w-3.5 h-3.5" /> Today's Dispatch
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => exportDeliveryHistory(filteredOrders, companies, locations)}>
              <Download className="w-3.5 h-3.5" /> Delivery History
            </Button>
          </div>
        )}
      </div>

      <ReportFilters filters={filters} onChange={setFilters} companies={companies} drivers={drivers} />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview" className="gap-1.5">{t('overview')}</TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5">{t('customers')}</TabsTrigger>
          <TabsTrigger value="locations" className="gap-1.5">{t('locations')}</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-1.5">{t('drivers')}</TabsTrigger>
          <TabsTrigger value="trucks" className="gap-1.5">{t('trucksReport')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab orders={filteredOrders} trucks={trucks} /></TabsContent>
        <TabsContent value="customers"><CustomersTab orders={filteredOrders} companies={companies} /></TabsContent>
        <TabsContent value="locations"><LocationsTab orders={filteredOrders} /></TabsContent>
        <TabsContent value="drivers"><DriversTab orders={filteredOrders} drivers={drivers} /></TabsContent>
        <TabsContent value="trucks"><TrucksTab orders={filteredOrders} trucks={trucks} /></TabsContent>
      </Tabs>
    </div>
  );
}