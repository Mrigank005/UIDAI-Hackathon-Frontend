import { useState, useEffect, useMemo } from 'react';
import { AppData, FilterState, ActionTicket, ComplianceMapData } from '@/types/dashboard';

// Helper function to extract district and state from WhatsApp message
function extractLocationFromMessage(msg: string): { district: string; state: string } {
  // Pattern: 📍 District, State
  const match = msg.match(/📍\s*([^,\n]+),\s*([^\n]+)/);
  if (match) {
    return { district: match[1].trim(), state: match[2].trim() };
  }
  return { district: 'Unknown', state: 'Unknown' };
}

// Enrich action_tickets with extracted location data
function enrichActionTickets(tickets: ActionTicket[]): ActionTicket[] {
  return tickets.map(ticket => {
    const location = extractLocationFromMessage(ticket.whatsapp_msg);
    return {
      ...ticket,
      district: location.district,
      state: location.state,
    };
  });
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/app_data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData: AppData = await response.json();
        // Enrich action_tickets with extracted location data
        if (jsonData.action_tickets) {
          jsonData.action_tickets = enrichActionTickets(jsonData.action_tickets);
        }
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useFilteredData(data: AppData | null, filters: FilterState) {
  const filteredActionTickets = useMemo(() => {
    if (!data?.action_tickets) return [];

    return data.action_tickets.filter((ticket) => {
      if (filters.state && ticket.state !== filters.state) return false;
      if (filters.district && ticket.district !== filters.district) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          ticket.pincode.toLowerCase().includes(searchLower) ||
          (ticket.district?.toLowerCase().includes(searchLower) ?? false) ||
          ticket.task.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [data, filters]);

  const filteredComplianceData = useMemo(() => {
    if (!data?.compliance_map_data) return [];

    return data.compliance_map_data.filter((item) => {
      if (filters.state && item.state !== filters.state) return false;
      if (filters.district && item.district !== filters.district) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          item.pincode.toLowerCase().includes(searchLower) ||
          item.district.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [data, filters]);

  // Filter for migration-specific tickets (Urban Planning Survey tasks)
  const filteredMigrationTickets = useMemo(() => {
    return filteredActionTickets.filter(ticket =>
      ticket.task.includes('Urban Planning') ||
      ticket.whatsapp_msg.includes('MIGRATION')
    );
  }, [filteredActionTickets]);

  const uniqueStates = useMemo(() => {
    if (!data) return [];
    const states = new Set<string>();
    data.compliance_map_data?.forEach(t => states.add(t.state));
    data.action_tickets?.forEach(t => {
      if (t.state) states.add(t.state);
    });
    // Remove obviously invalid entries
    states.delete('Unknown');
    states.delete('100000');
    return Array.from(states).sort();
  }, [data]);

  const uniqueDistricts = useMemo(() => {
    if (!data) return [];
    const districts = new Set<string>();
    const selectedState = filters.state;

    if (selectedState) {
      data.compliance_map_data?.filter(t => t.state === selectedState).forEach(t => districts.add(t.district));
      data.action_tickets?.filter(t => t.state === selectedState).forEach(t => {
        if (t.district) districts.add(t.district);
      });
    } else {
      data.compliance_map_data?.forEach(t => districts.add(t.district));
      data.action_tickets?.forEach(t => {
        if (t.district) districts.add(t.district);
      });
    }

    // Remove obviously invalid entries
    districts.delete('Unknown');
    districts.delete('100000');
    return Array.from(districts).sort();
  }, [data, filters.state]);

  return {
    filteredActionTickets,
    filteredComplianceData,
    filteredMigrationTickets,
    uniqueStates,
    uniqueDistricts,
  };
}

export function usePagination<T>(items: T[], itemsPerPage: number = 25) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    totalItems: items.length,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, items.length),
  };
}
