import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart2, Download } from 'lucide-react';
import { exportDailyDispatch, exportDeliveryHistory } from '@/lib/pdfExport';
import { useRole } from '@/lib/useRole';
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
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" />
          {t('reports')}
        </h1>
        {canExportReports && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => exportDailyDispatch(orders)}>
              <Download className="w-3.5 h-3.5" /> Today's Dispatch
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => exportDeliveryHistory(orders, companies, locations)}>
              <Download className="w-3.5 h-3.5" /> Delivery History
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview" className="gap-1.5">{t('overview')}</TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5">{t('customers')}</TabsTrigger>
          <TabsTrigger value="locations" className="gap-1.5">{t('locations')}</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-1.5">{t('drivers')}</TabsTrigger>
          <TabsTrigger value="trucks" className="gap-1.5">{t('trucksReport')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab orders={orders} trucks={trucks} /></TabsContent>
        <TabsContent value="customers"><CustomersTab orders={orders} companies={companies} /></TabsContent>
        <TabsContent value="locations"><LocationsTab orders={orders} /></TabsContent>
        <TabsContent value="drivers"><DriversTab orders={orders} drivers={drivers} /></TabsContent>
        <TabsContent value="trucks"><TrucksTab orders={orders} trucks={trucks} /></TabsContent>
      </Tabs>
    </div>
  );
}