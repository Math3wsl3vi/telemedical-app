'use client'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import React from 'react'

const Sidebar = () => {
    const pathname = usePathname();
  return (
    <section className='sticky left-0 top-0 bg-slate-50 text-black min-w-[250px] p-5 pt-32 overflow-y-auto h-screen'>
        <div className='flex flex-col flex-1 gap-10'>
            {sidebarLinks.map((link)=>{
                const isActive = pathname === link.route || pathname.startsWith(`${link.route}/`);

                return (
                    <Link href={link.route} 
                    key={link.label} 
                    className={cn('flex gap-6 items-center justify-start p-4 rounded-xl',{'bg-green-1 text-white':isActive})}>
                        <Image
                    src={link.imgUrl}
                    alt={link.label}
                    width={24}
                    height={24}
                    />
                    <p className='font-poppins max-lg:hidden'>{link.label}</p>
                    </Link>
                    
                )
            })}
        </div>
    </section>
  )
}

export default Sidebar