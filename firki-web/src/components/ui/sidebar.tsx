'use client';

import { useState } from 'react';
import { 
  Home, 
  FileText, 
  Search, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Clock,
  Star
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '#' },
  { icon: <FileText className="w-5 h-5" />, label: 'Job Descriptions', href: '#', badge: 12 },
  { icon: <Search className="w-5 h-5" />, label: 'Boolean Searches', href: '#', badge: 8 },
  { icon: <Users className="w-5 h-5" />, label: 'Team', href: '#' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', href: '#' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '#' },
];

const recentAnalyses = [
  { id: 1, title: 'Senior React Developer', date: '2 hours ago', skills: ['React', 'TypeScript', 'Node.js'] },
  { id: 2, title: 'Data Scientist', date: '1 day ago', skills: ['Python', 'Machine Learning', 'SQL'] },
  { id: 3, title: 'Product Manager', date: '2 days ago', skills: ['Product Strategy', 'Agile', 'Analytics'] },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={clsx(
      "bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={clsx(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-gray-100 hover:text-gray-900",
                item.label === 'Job Descriptions' ? "bg-blue-600 text-white" : "text-gray-600"
              )}
            >
              {item.icon}
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </a>
          ))}
        </nav>

        {/* Recent Analyses */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Recent Analyses
            </h3>
            <div className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {analysis.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {analysis.date}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.skills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {analysis.skills.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{analysis.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <Star className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
