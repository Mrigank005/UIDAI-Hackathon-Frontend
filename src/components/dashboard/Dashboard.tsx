import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { FilterBar } from './FilterBar';
import { SatarkView } from './SatarkView';
import { SakshamView } from './SakshamView';
import { KartavyaView } from './KartavyaView';
import { PravasView } from './PravasView';
import { useAppData, useFilteredData } from '@/hooks/useAppData';
import { TabType, FilterState } from '@/types/dashboard';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  initialTab?: TabType;
}

export function Dashboard({ initialTab = 'satark' }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    state: '',
    district: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const { data, loading, error } = useAppData();
  const { toast } = useToast();

  const {
    filteredActionTickets,
    filteredComplianceData,
    filteredMigrationTickets,
    uniqueStates,
    uniqueDistricts,
  } = useFilteredData(data, filters);

  const handleDownloadReport = async () => {
    if (!data) {
      toast({
        title: 'Error',
        description: 'Data not loaded yet. Please wait.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Generating Report',
      description: 'Please wait while we prepare your PDF...',
    });

    try {
      await generatePDFReport(data, filters);
      toast({
        title: 'Report Downloaded',
        description: 'Your PDF report has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading UIDAI OpsCommand...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">Error loading data</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadReport={handleDownloadReport}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto ml-0 lg:ml-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            states={uniqueStates}
            districts={uniqueDistricts}
          />

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'satark' && data && (
                <SatarkView
                  actionTickets={filteredActionTickets}
                  complianceData={filteredComplianceData}
                  anomalySummary={data.anomaly_summary}
                  summary={data.summary}
                />
              )}
              {activeTab === 'saksham' && data && (
                <SakshamView
                  complianceData={filteredComplianceData}
                  totalBacklog={data.summary.mbu_backlog_total}
                />
              )}
              {activeTab === 'kartavya' && (
                <KartavyaView
                  actionTickets={filteredActionTickets}
                />
              )}
              {activeTab === 'pravas' && (
                <PravasView migrationTickets={filteredMigrationTickets} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
