'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Calendar } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Doctors', href: '/admin/doctors', icon: User },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      
      {/* Logo */}
      <div className="flex items-center justify-center py-8 border-b">
        <Link href="/" className="flex items-center gap-2">
          <p className="text-2xl font-extrabold text-green-600">
          DaktariConnect
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mt-6 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <div
                className={`
                  p-2 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600 group-hover:bg-green-600 group-hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
              </div>

              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto p-4 text-xs text-gray-400 border-t">
        © 2025 DaktariConnect
      </div>
    </div>
  );
}
