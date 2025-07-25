'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Users, 
  Package, 
  PieChart, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  Bell, 
  LogOut,
  TrendingUp,
  UserCheck,
  Users2,
  Calculator,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'KYC Submissions', href: '/admin/kyc-submissions', icon: UserCheck },
  { name: 'Deposits', href: '/admin/deposits', icon: ArrowUpCircle },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: ArrowDownCircle },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users,
    subItems: [
      { name: 'Individual Accounts', href: '/admin/users/individual', icon: UserCheck },
      { name: 'Joint Accounts', href: '/admin/users/joint', icon: Users2 },
    ]
  },
  { name: 'Calculator', href: '/admin/calculator', icon: Calculator },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Portfolios', href: '/admin/portfolios', icon: PieChart },
  { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
  { name: 'Transaction Requests', href: '/admin/transaction-requests', icon: Clock },
  { name: 'Memos', href: '/admin/memos', icon: MessageSquare },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActiveItem = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Estien Capital</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = isActiveItem(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            return (
              <div key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant={isActive && !hasSubItems ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && !hasSubItems && "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
                
                {hasSubItems && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link key={subItem.name} href={subItem.href}>
                          <Button
                            variant={isSubActive ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm",
                              isSubActive && "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                          >
                            <subItem.icon className="mr-2 h-3 w-3" />
                            {subItem.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">{user?.firstName?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}