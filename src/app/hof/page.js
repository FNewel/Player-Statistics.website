'use client';

import { useState, useEffect } from 'react';

import Image from "next/image";
import Link from "next/link";
import Tilt from 'react-parallax-tilt';

import { base64Image } from '@/utils/playerImage';
import { getHallOfFameData } from '@/utils/db';
import FormattedNumberText from '@/components/FormattedNumberText';
import ErrorMessage from '@/components/ErrorMessage';


export default function HallOfFame() {
    const [hofData, setHofData] = useState({});         // Hall of Fame data
    const [isLoading, setIsLoading] = useState(true);   // Loading state
    const [error, setError] = useState(null);           // Error state (if any)
    const [scale, setScale] = useState(1.15);           // Tilt scale

    // Function to load Hall of Fame data from database on page load
    useEffect(() => {
        getHallOfFameData().then((data) => {
            if (data.success) {
                setHofData(data.data);
                setIsLoading(false);
            } else {
                setError(data.error);
            }
        });
    }, []);


    return (
        <>
            <div className="flex flex-col items-center pb-8">
                <h2 className="text-3xl sm:text-4xl font-bold">Hall of Fame</h2>
                <p className="text-gray-600 text-center sm:text-left">Top 15 players with the highest score</p>
            </div>

            {isLoading ? (
                error ? (
                    ErrorMessage({ error })
                ) : (
                    <div className="flex justify-center py-4">
                        <Image src="/assets/loading_clock.gif" alt="Loading" width={80} height={80} />
                    </div>
                )
            ) : (
                <>
                    <div className="flex flex-col items-center pt-4 lg:pt-16 pb-8">
                        <div className="flex lg:flex-row flex-col items-end lg:space-x-6 w-full xl:w-2/3 justify-center">

                            {/* Third place */}
                            <Tilt scale={scale} className="w-full lg:w-1/3 order-1 lg:order-none pt-10 lg:pt-0">
                                <Link href={`/player?q=${hofData[2].id}&uuid=${hofData[2].uuid}`}>
                                    <div className="relative flex items-center justify-center">
                                        <Image
                                            src={`https://nmsr.nickac.dev/bust/${hofData[2].uuid}`}
                                            alt="Third player"
                                            placeholder={`data:image/png;base64,${base64Image}`}
                                            width={128}
                                            height={128}
                                            className="absolute left-2 lg:left-auto -bottom-[90px] z-10 lg:bottom-[-26px]"
                                        />

                                    </div>

                                    <div className='bg-white/20 p-1 shadow-md rounded-md'>
                                        <div className="flex relative flex-col items-center justify-center bg-white/50 border-2 border-gray-400/20 rounded-md px-8 py-3 lg:pt-6">
                                            <h3 className="text-2xl font-bold">{hofData[2].nick}</h3>
                                            <p><span className="text-mc_gold text-lg"><FormattedNumberText text={String(hofData[2].score)} />⭐</span></p>
                                            <p className="absolute bottom-0 right-0 font-bold text-2xl text-gray-500/50">3.</p>
                                        </div>
                                    </div>
                                </Link>
                            </Tilt>

                            {/* First place */}
                            <Tilt scale={scale} className="w-full lg:w-1/3">
                                <Link href={`/player?q=${hofData[0].id}&uuid=${hofData[0].uuid}`}>
                                    <div className="relative flex items-center justify-center">
                                        <Image
                                            src={`https://nmsr.nickac.dev/bust/${hofData[0].uuid}`}
                                            alt="First player"
                                            placeholder={`data:image/png;base64,${base64Image}`}
                                            width={128}
                                            height={128}
                                            className="absolute left-2 lg:left-auto -bottom-[90px] z-10 lg:bottom-[-38px]"
                                        />
                                    </div>

                                    <div className='bg-yellow-200/30 p-1 shadow-md rounded-md'>
                                        <div className="flex relative flex-col items-center justify-center bg-yellow-200/50 border-2 border-yellow-400/30 rounded-md px-8 py-3 lg:py-12 lg:pt-16">
                                            <h3 className="text-2xl lg:text-4xl font-bold">{hofData[0].nick}</h3>
                                            <p><span className="text-mc_gold text-lg lg:text-2xl"><FormattedNumberText text={String(hofData[0].score)} />⭐</span></p>
                                            <p className="absolute bottom-0 right-0 font-bold text-2xl text-gray-500/50">1.</p>
                                        </div>
                                    </div>
                                </Link>
                            </Tilt>

                            {/* Second place */}
                            <Tilt scale={scale} className="w-full lg:w-1/3 pt-10 lg:pt-0">
                                <Link href={`/player?q=${hofData[1].id}&uuid=${hofData[1].uuid}`}>
                                    <div className="relative flex items-center justify-center">
                                        <Image
                                            src={`https://nmsr.nickac.dev/bust/${hofData[1].uuid}`}
                                            alt="Second player"
                                            placeholder={`data:image/png;base64,${base64Image}`}
                                            width={128}
                                            height={128}
                                            className="absolute left-2 lg:left-auto -bottom-[90px] z-10 lg:bottom-[-38px]"
                                        />
                                    </div>

                                    <div className='bg-orange-200/30 p-1 shadow-md rounded-md'>
                                        <div className="flex relative flex-col items-center justify-center bg-orange-200/50 border-2 border-orange-300/20 rounded-md px-8 py-3 lg:py-7 lg:pt-12">
                                            <h3 className="text-2xl lg:text-3xl font-bold">{hofData[1].nick}</h3>
                                            <p><span className="text-mc_gold text-lg lg:text-xl"><FormattedNumberText text={String(hofData[1].score)} />⭐</span></p>

                                            <p className="absolute bottom-0 right-0 font-bold text-2xl text-gray-500/50">2.</p>
                                        </div>
                                    </div>
                                </Link>
                            </Tilt>

                        </div>
                    </div>

                    <div>
                        <table className="table-auto w-full rounded-xl overflow-hidden">
                            <thead className="bg-white/80">
                                <tr>
                                    <th className="sm:px-4 py-2">Rank</th>
                                    <th className="sm:px-4 py-2 text-left">Player</th>
                                    <th className="sm:px-4 py-2">Score</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white/40 text-xs sm:text-base'>
                                {
                                    Array(12).fill(0).map((_, index) => (
                                        <tr key={index} className="hover:bg-gray-300/40 even:bg-white/50 hover:font-bold">
                                            <td className="sm:px-4 py-2 text-center">{index + 4}.</td>
                                            <td className="sm:px-4 py-2">
                                                <Link href={`/player?q=${hofData[index + 3].id}&uuid=${hofData[index + 3].uuid}`}>
                                                    <div className="flex items-center  space-x-2">
                                                        <Image
                                                            src={`https://crafatar.com/avatars/${hofData[index + 3].uuid}?size=80`}
                                                            alt="Player Head"
                                                            width={32}
                                                            height={32}
                                                        />
                                                        <p>{hofData[index + 3].nick}</p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="sm:px-4 py-2 text-center font-bold sm:font-normal"><span className="text-mc_gold sm:text-lg"><FormattedNumberText text={String(hofData[index + 3].score)} />⭐</span></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </>
    );
}