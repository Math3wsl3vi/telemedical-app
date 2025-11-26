'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Calendar, DollarSign } from 'lucide-react';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Doctors', href: '/admin/doctors', icon: User },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Finances', href: '/admin/finances', icon: DollarSign },
  ];

  return (
    <div className="w-64 h-screen bg-white shadow-md">
        
      <div className="p-4">
        <Image width={500} height={500} src="/logo.png" alt="DaktariConnect" className="h-8" />
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center p-4 text-gray-600 hover:bg-primary hover:text-white ${
              pathname === item.href ? 'bg-primary text-white' : ''
            }`}
          >
            <item.icon className="w-5 h-5 mr-2" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}