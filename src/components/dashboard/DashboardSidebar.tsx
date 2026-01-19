import { Shield, Activity, ClipboardList, Map, Download, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TabType } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onDownloadReport: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems: { id: TabType; label: string; sublabel: string; icon: typeof Shield; path: string }[] = [
  { id: 'satark', label: 'Satark', sublabel: 'Security & Fraud', icon: Shield, path: '/satark' },
  { id: 'saksham', label: 'Saksham', sublabel: 'MBU Compliance', icon: Activity, path: '/saksham' },
  { id: 'kartavya', label: 'Kartavya', sublabel: 'Field Operations', icon: ClipboardList, path: '/kartavya' },
  { id: 'pravas', label: 'Pravas', sublabel: 'Migration Trends', icon: Map, path: '/pravas' },
];

export function DashboardSidebar({ 
  activeTab, 
  onTabChange, 
  onDownloadReport, 
  isOpen, 
  onToggle 
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out h-screen overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo/Title */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">UIDAI</h1>
              <p className="text-xs text-sidebar-foreground/70">OpsCommand</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className={cn(
                    "text-xs",
                    isActive ? "text-accent-foreground/70" : "text-sidebar-foreground/50"
                  )}>
                    {item.sublabel}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Download Report Button */}
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
            <Button
            onClick={onDownloadReport}
            variant="default"
            className="w-full bg-[#ff9933] text-black hover:bg-[#fcf0c0] shadow-sm"
            >
            <Download className="w-4 h-4 mr-2" />
            Download Report
            </Button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-xs text-sidebar-foreground/50 flex-shrink-0">
            <p>© {new Date().getFullYear()} UIDAI</p>
            <p>Government of India</p>
        </div>
      </aside>
    </>
  );
}

