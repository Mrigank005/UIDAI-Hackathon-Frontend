import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ActionTicket } from '@/types/dashboard';
import { MetricCard } from './MetricCard';
import { PriorityBadge } from './PriorityBadge';
import { WhatsAppButton } from './WhatsAppButton';
import { Pagination } from './Pagination';
import { usePagination } from '@/hooks/useAppData';
import { cn } from '@/lib/utils';

interface KartavyaViewProps {
  actionTickets: ActionTicket[];
}

export function KartavyaView({ actionTickets }: KartavyaViewProps) {
  const criticalTasks = useMemo(() =>
    actionTickets.filter(t => t.priority === 'Critical').length,
    [actionTickets]);

  const mediumTasks = useMemo(() =>
    actionTickets.filter(t => t.priority === 'Medium').length,
    [actionTickets]);

  const lowTasks = useMemo(() =>
    actionTickets.filter(t => t.priority === 'Low').length,
    [actionTickets]);

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
  } = usePagination(actionTickets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-accent" />
          Field Operations & Task Allocation
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage and coordinate field team activities across regions
        </p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tasks"
          value={actionTickets.length}
          subtitle="All assigned tasks"
          icon={ClipboardList}
          variant="default"
          delay={0.1}
        />
        <MetricCard
          title="Critical Tasks"
          value={criticalTasks}
          subtitle="Immediate attention"
          icon={AlertTriangle}
          variant="warning"
          delay={0.2}
        />
        <MetricCard
          title="Medium Priority"
          value={mediumTasks}
          subtitle="Standard workflow"
          icon={Clock}
          variant="accent"
          delay={0.3}
        />
        <MetricCard
          title="Low Priority"
          value={lowTasks}
          subtitle="Can be scheduled"
          icon={CheckCircle}
          variant="success"
          delay={0.4}
        />
      </div>

      {/* Kanban-style Task Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((ticket, index) => (
            <motion.div
              key={`${ticket.pincode}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index % 9) }}
              className={cn(
                "bg-card rounded-xl border p-4 shadow-sm",
                "hover:shadow-md transition-shadow duration-200",
                ticket.priority === 'Critical' && "border-l-4 border-l-destructive"
              )}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h4 className="font-semibold text-foreground text-sm line-clamp-2">
                  {ticket.task}
                </h4>
                <PriorityBadge priority={ticket.priority} />
              </div>

              {/* Card Content */}
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground/70">Pincode:</span>
                  <span>{ticket.pincode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground/70">Location:</span>
                  <span>{ticket.district || 'Unknown'}, {ticket.state || 'Unknown'}</span>
                </div>
                {ticket.venue && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-foreground/70">Venue:</span>
                    <span className="line-clamp-2">{ticket.venue}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end pt-3 border-t">
                <WhatsAppButton message={ticket.whatsapp_msg} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
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
      </motion.div>
    </div>
  );
}
