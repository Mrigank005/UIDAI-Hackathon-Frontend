import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Map, TrendingUp, Users, Building } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { ActionTicket } from '@/types/dashboard';
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

interface PravasViewProps {
  migrationTickets: ActionTicket[];
}

// Helper function to extract migration numbers from WhatsApp message
function extractMigrationData(msg: string): { adults: number; children: number } {
  const adultsMatch = msg.match(/Adult Migration:\s*(\d+)/i);
  const childrenMatch = msg.match(/Young Children:\s*(\d+)/i);

  return {
    adults: adultsMatch ? parseInt(adultsMatch[1]) : 0,
    children: childrenMatch ? parseInt(childrenMatch[1]) : 0,
  };
}

export function PravasView({ migrationTickets }: PravasViewProps) {
  // Calculate boom towns with high adult migration and low children
  const identifiedBoomTowns = useMemo(() => {
    return migrationTickets.filter(ticket => {
      const { adults, children } = extractMigrationData(ticket.whatsapp_msg);
      // Boom town: High adult migration (>3000) with low child ratio (<0.01)
      return adults > 3000 && (children / adults) < 0.01;
    });
  }, [migrationTickets]);

  const criticalMigration = useMemo(() =>
    migrationTickets.filter(t => t.priority === 'Critical').length,
    [migrationTickets]);

  const totalRegions = useMemo(() => {
    const regions = new Set(migrationTickets.map(t => t.district).filter(Boolean));
    return regions.size;
  }, [migrationTickets]);

  // Scatter chart data
  const scatterData = useMemo(() => {
    return migrationTickets.slice(0, 100).map(ticket => {
      const { adults, children } = extractMigrationData(ticket.whatsapp_msg);
      return {
        x: adults,
        y: children,
        z: Math.max(adults + children, 100),
        name: ticket.district || 'Unknown',
        pincode: ticket.pincode,
      };
    }).filter(d => d.x > 0 || d.y > 0);
  }, [migrationTickets]);

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
  } = usePagination(migrationTickets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Map className="w-6 h-6 text-accent" />
          Migration Trends & Urban Planning
        </h2>
        <p className="text-muted-foreground mt-1">
          Analyze population movements and identify emerging urban centers
        </p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Boom Towns Identified"
          value={identifiedBoomTowns.length}
          subtitle="High adult migration, low births"
          icon={Building}
          variant="accent"
          delay={0.1}
        />
        <MetricCard
          title="Total Surveys"
          value={migrationTickets.length}
          subtitle="Migration surveys conducted"
          icon={TrendingUp}
          variant="default"
          delay={0.2}
        />
        <MetricCard
          title="Critical Areas"
          value={criticalMigration}
          subtitle="Requiring attention"
          icon={Users}
          variant="warning"
          delay={0.3}
        />
        <MetricCard
          title="Regions Covered"
          value={totalRegions}
          subtitle="Districts surveyed"
          icon={Map}
          variant="success"
          delay={0.4}
        />
      </div>

      {/* Scatter Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">
          Migration Clusters: Adults vs. Children
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Bubble size represents total population movement. Bottom-right quadrant indicates potential boom towns.
        </p>
        <div className="h-[400px]">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Adults"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Adult Migration', position: 'bottom', offset: 0 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Children"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Young Children', angle: -90, position: 'left' }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border rounded-lg shadow-lg p-3">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm text-muted-foreground">Pincode: {data.pincode}</p>
                          <p className="text-sm">Adults: {data.x.toLocaleString()}</p>
                          <p className="text-sm">Children: {data.y}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={scatterData}
                  fill="hsl(30, 100%, 60%)"
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No migration data available for the current filters
            </div>
          )}
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
          <h3 className="font-semibold text-foreground">Migration Survey Data</h3>
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
              {paginatedItems.length > 0 ? (
                paginatedItems.map((ticket, index) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No migration surveys found for the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {paginatedItems.length > 0 && (
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
        )}
      </motion.div>
    </div>
  );
}
