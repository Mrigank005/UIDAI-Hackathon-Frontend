import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ComplianceMapData } from '@/types/dashboard';
import { MetricCard } from './MetricCard';
import { Pagination } from './Pagination';
import { usePagination } from '@/hooks/useAppData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SakshamViewProps {
  complianceData: ComplianceMapData[];
  totalBacklog: number;
}

export function SakshamView({ complianceData, totalBacklog }: SakshamViewProps) {
  // Get top districts by deficit
  const topDistrictsData = useMemo(() => {
    const districtDeficits: Record<string, number> = {};
    
    complianceData.forEach(item => {
      const key = `${item.district}, ${item.state}`;
      districtDeficits[key] = (districtDeficits[key] || 0) + item.deficit;
    });

    return Object.entries(districtDeficits)
      .map(([name, deficit]) => ({ name: name.split(',')[0], deficit }))
      .sort((a, b) => b.deficit - a.deficit)
      .slice(0, 10);
  }, [complianceData]);

  const totalDeficit = useMemo(() => 
    complianceData.reduce((acc, item) => acc + item.deficit, 0),
  [complianceData]);

  const avgDeficit = useMemo(() => 
    complianceData.length > 0 ? Math.round(totalDeficit / complianceData.length) : 0,
  [complianceData, totalDeficit]);

  const criticalPincodes = useMemo(() => 
    complianceData.filter(item => item.deficit > 1000).length,
  [complianceData]);

  // Sort by deficit for table
  const sortedData = useMemo(() => 
    [...complianceData].sort((a, b) => b.deficit - a.deficit),
  [complianceData]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(sortedData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent" />
          MBU (Mandatory Biometric Update) Saturation
        </h2>
        <p className="text-muted-foreground mt-1">
          Track enrollment gaps and biometric update compliance across regions
        </p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total MBU Backlog"
          value={totalBacklog}
          subtitle="Pending updates nationwide"
          icon={Users}
          variant="warning"
          delay={0.1}
        />
        <MetricCard
          title="Average Deficit per Pincode"
          value={avgDeficit}
          subtitle="Updates pending per area"
          icon={Activity}
          variant="accent"
          delay={0.2}
        />
        <MetricCard
          title="Critical Pincodes"
          value={criticalPincodes}
          subtitle="Deficit > 1000"
          icon={AlertCircle}
          variant="warning"
          delay={0.3}
        />
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">
          Top 10 Districts by MBU Deficit
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topDistrictsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Deficit']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="deficit" 
                fill="hsl(240, 100%, 25%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border overflow-hidden"
      >
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground">Pincode-wise MBU Deficit</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pincode</TableHead>
                <TableHead>District</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Deficit Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item, index) => (
                <TableRow key={`${item.pincode}-${index}`}>
                  <TableCell className="font-medium">{item.pincode}</TableCell>
                  <TableCell>{item.district}</TableCell>
                  <TableCell>{item.state}</TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={item.deficit > 1000 ? 'text-destructive' : ''}>
                      {item.deficit.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={goToPage}
            onNext={nextPage}
            onPrev={prevPage}
          />
        </div>
      </motion.div>
    </div>
  );
}
