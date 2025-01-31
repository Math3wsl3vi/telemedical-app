import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import MobileNav from './MobileNav'
import { SignedIn, UserButton } from '@clerk/nextjs'

const Navbar = () => {
  return (
    <nav className='flex-between fixed z-50 w-full px-32 py-3 lg:px-10 items-center overflow-x-hidden'>
      <Link href='/' className='flex items-center gap-1'>
      <Image
      src='/icons/logo.png'
      alt='logo'
      width={32}
      height={32}
      className='max-sm:size-10 text-red-400'
      />
      <p className='text-[26px] font-extrabold'>Virual Doctor</p>
      </Link>
      <div className='md:flex gap-10 hidden border p-5 shadow-md rounded-full'>
        <Link href={'/doctor-page'} className='text-lg font-semibold font-poppins text-green-1'>Find A Doctor</Link>
        <Link href={'/'} className='text-lg font-semibold font-poppins text-green-1'>Pharmacies</Link>
        <Link href={'/'} className='text-lg font-semibold font-poppins text-green-1'>Hospitals</Link>
        <Link href={'/'} className='text-lg font-semibold font-poppins text-green-1'>Contact</Link>

      </div>
      <div className='flex-between gap-5 text-black'>
        {/* clerk user management */}
        <SignedIn>
              <UserButton/>
        </SignedIn>
      <MobileNav/>

      </div>
    </nav>
  )
}

export default Navbar