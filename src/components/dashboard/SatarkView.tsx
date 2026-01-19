import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ActionTicket, ComplianceMapData, AnomalySummary, Summary } from '@/types/dashboard';
import { MetricCard } from './MetricCard';
import { PriorityBadge } from './PriorityBadge';
import { WhatsAppButton } from './WhatsAppButton';
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

interface SatarkViewProps {
  actionTickets: ActionTicket[];
  complianceData: ComplianceMapData[];
  anomalySummary: AnomalySummary;
  summary: Summary;
}

export function SatarkView({ actionTickets, complianceData, anomalySummary, summary }: SatarkViewProps) {
  // Filter for fraud-related tickets
  const fraudTickets = useMemo(() =>
    actionTickets.filter(t => t.task.includes('Fraud') || t.whatsapp_msg.includes('FRAUD')),
    [actionTickets]);

  const criticalCount = useMemo(() =>
    fraudTickets.filter(t => t.priority === 'Critical').length,
    [fraudTickets]);

  // Chart data - group by priority
  const chartData = useMemo(() => {
    const priorityCounts = { Critical: 0, Medium: 0, Low: 0 };
    fraudTickets.forEach(t => {
      priorityCounts[t.priority]++;
    });

    return [
      { name: 'Critical', count: priorityCounts.Critical, color: 'hsl(0, 84%, 60%)' },
      { name: 'Medium', count: priorityCounts.Medium, color: 'hsl(30, 100%, 60%)' },
      { name: 'Low', count: priorityCounts.Low, color: 'hsl(142, 76%, 36%)' },
    ].filter(item => item.count > 0);
  }, [fraudTickets]);

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
  } = usePagination(fraudTickets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          Fraud & Anomaly Detection
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitor and investigate suspicious activities across Aadhaar operations
        </p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Analyzed"
          value={anomalySummary.total_analyzed.toLocaleString()}
          subtitle="Records scanned"
          icon={AlertTriangle}
          variant="warning"
          delay={0.1}
        />
        <MetricCard
          title="Avg Confidence Score"
          value={`${anomalySummary.average_confidence.toFixed(1)}%`}
          subtitle="Detection accuracy"
          icon={TrendingUp}
          variant="accent"
          delay={0.2}
        />
        <MetricCard
          title="Critical Fraud Cases"
          value={criticalCount}
          subtitle="Requiring immediate action"
          icon={Shield}
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
          Fraud Cases by Priority Level
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Cases']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
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
          <h3 className="font-semibold text-foreground">Fraud Audit Tickets</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pincode</TableHead>
                <TableHead>District</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((ticket, index) => (
                <TableRow key={`${ticket.pincode}-${index}`}>
                  <TableCell className="font-medium">{ticket.pincode}</TableCell>
                  <TableCell>{ticket.district || 'Unknown'}</TableCell>
                  <TableCell>{ticket.state || 'Unknown'}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={ticket.priority} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{ticket.task}</TableCell>
                  <TableCell>
                    <WhatsAppButton message={ticket.whatsapp_msg} />
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
