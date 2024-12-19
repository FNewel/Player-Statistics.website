'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import AppearanceSwitch from '@/components/AppearanceSwitch';
import MinecraftText from '@/components/MinecraftText';


const Menu = ({ desc, url, icon }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);     // Mobile menu state

    return (
        <div className="container z-50 mx-auto sticky top-2 mb-6 flex-col sm:space-y-2 px-2 transition-all duration-300 ">
            {/* Menu */}
            <div className='hidden sm:flex sm:space-x-2 h-16'>
                <div className="w-full rounded-xl border-2 border-gray-100 shadow-lg inline-flex items-center justify-between p-2"
                    style={{
                        backgroundImage: 'url("/assets/background/quartz.webp")',
                    }}
                >
                    <div className="flex space-x-2 ">
                        <Link href="/" className="hover:font-bold p-2"> Home </Link>
                        <Link href="/hof" className="hover:font-bold p-2 truncate"> Hall of Fame </Link>
                        <Link href="/players" className="hover:font-bold p-2"> Players </Link>
                    </div>

                    {/* Language selector */}
                    <div className="flex items-center space-x-2">
                        {/* Dark/Light mode */}
                        <AppearanceSwitch />

                        <select
                            className="p-2 px-3 rounded-lg appearance-none focus:outline-none cursor-pointer bg-white"
                        >
                            <option value="en">English</option>
                            <option value="sk">Slovak</option>
                            <option value="cz">Czech</option>
                        </select>
                    </div>
                </div>

                <Link href={url}>
                    <div className="rounded-xl border-2 p-0.5 border-gray-100 shadow-lg inline-flex space-x-2 items-center justify-end w-fit"
                        style={{
                            backgroundImage: 'url("/assets/background/quartz.webp")',
                        }}
                    >
                        <div className="w-[56px] h-[56px] rounded-lg ">
                            <Image src={icon} alt="Sever Icon" width={56} height={56} className="rounded-lg" />
                        </div>
                        <div className="bg-gray-900 p-1 px-2 rounded-lg w-[420px] h-14 overflow-hidden hidden lg:block ">
                            <MinecraftText text={desc} />
                            {/* Colors are hardcoded because they are not updated when MinecraftText is rendered, this is a workaround */}
                            <div className="hidden text-mc_black text-mc_dark_blue text-mc_dark_green text-mc_dark_green text-mc_dark_aqua text-mc_dark_red text-mc_dark_purple text-mc_gold text-mc_gray text-mc_dark_gray text-mc_blue text-mc_green text-mc_aqua text-mc_red text-mc_light_purple text-mc_yellow text-mc_white"></div>
                        </div>
                    </div>
                </Link>
            </div>


            {/* Mobile menu */}
            <div className='sm:hidden'>
                <div className="w-full rounded-xl border-2 border-gray-100 shadow-lg flex items-center justify-between p-2"
                    style={{
                        backgroundImage: 'url("/assets/background/quartz.webp")',
                    }}
                >
                    <div className='flex space-x-2'>
                        <Link href={url} className="w-[56px] h-[56px] rounded-lg">
                            <Image src={icon} alt="User Image" width={56} height={56} className="rounded-lg" />
                        </Link>
                        <div className="flex items-center space-x-2">
                            <select
                                className="p-2 px-3 rounded-lg appearance-none focus:outline-none cursor-pointer bg-white"
                            >
                                <option value="en">English</option>
                                <option value="sk">Slovak</option>
                                <option value="cz">Czech</option>
                            </select>
                            <AppearanceSwitch />
                        </div>
                    </div>

                    <button
                        className="lg:hidden p-2 rounded-md border bg-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>

                <div className='h-40 absolute w-svw right-0 overflow-hidden pointer-events-none'>
                    <div className={`pointer-events-auto rounded-xl border-2 border-gray-100 shadow-lg flex items-center justify-between p-2 mt-2 absolute right-2 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-52'}`}
                        style={{
                            backgroundImage: 'url("/assets/background/quartz.webp")',
                        }}
                    >
                        <div className="flex flex-col space-x-2 items-end w-full">
                            <div className={`flex flex-col`}>
                                <Link href="/" className="hover:font-bold p-2 px-3 text-right" onClick={() => setMobileMenuOpen(false)}> Home </Link>
                                <Link href="/hof" className="hover:font-bold p-2 px-3 text-right" onClick={() => setMobileMenuOpen(false)}> Hall of Fame </Link>
                                <Link href="/players" className="hover:font-bold p-2 px-3 text-right" onClick={() => setMobileMenuOpen(false)}> Players </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Menu;