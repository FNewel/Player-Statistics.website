'use client';

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useEffect, useState } from "react";
import { getStatData } from "@/utils/db";

import ErrorMessage from "@/components/ErrorMessage";
import FormattedNumberText from "@/components/FormattedNumberText";


export default function StatPage() {
    const [stat, setStat] = useState(null);                                             // Stat name
    const [statCategory, setStatCategory] = useState(null);                             // Stat category
    const [statData, setStatData] = useState(null);                                     // Stat data
    const [filteredStats, setFilteredStats] = useState([]);                             // Filtered stats
    const [isLoading, setIsLoading] = useState(true);                                   // Loading state
    const [searchQuery, setSearchQuery] = useState("");                                 // Search query
    const [sortOption, setSortOption] = useState({ field: "score", order: "desc" });    // Sort option (score or nick)
    const [error, setError] = useState(null);                                           // Error state

    const searchParams = useSearchParams();

    useEffect(() => {
        const urlQueryStat = searchParams.get('q');
        const urlQueryCategory = searchParams.get('c');

        if (!urlQueryStat || !urlQueryCategory) {
            setError("Missing required query parameters.");
            setIsLoading(false);
            return;
        }

        setStat(urlQueryStat.replace(/_/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase()));
        setStatCategory(urlQueryCategory.replace(/_/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase()));

        getStatData(urlQueryCategory, urlQueryStat).then((data) => {
            if (data.success && data.data && data.data.length > 0) {
                setStatData(data.data);
                setIsLoading(false);
            } else {
                if (data.error) {
                    setError(data.error);
                } else {
                    setError("No data found");
                }
                setIsLoading(false);
            }
        });
    }, [searchParams]);

    // Filter and sort players based on the search query and player's nick or date
    useEffect(() => {
        if (!statData) {
            return;
        }

        let filtered = [...statData];

        // Apply search query
        if (searchQuery) {
            filtered = filtered.filter((stat) =>
                stat.player_nick.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        if (sortOption.field === "score") {
            filtered.sort((a, b) => {
                return sortOption.order === "asc" ? a.score - b.score : b.score - a.score;
            });
        } else if (sortOption.field === "nick") {
            filtered.sort((a, b) =>
                sortOption.order === "asc" ? a.player_nick.localeCompare(b.player_nick) : b.player_nick.localeCompare(a.player_nick)
            );
        }

        setFilteredStats(filtered);
    }, [searchQuery, sortOption, statData]);

    // Handle search query
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    // Handle sorting (when clicking on sort buttons)
    const toggleSort = (field) => {
        setSortOption((prev) => {
            if (prev.field === field) {
                return { field, order: prev.order === "asc" ? "desc" : "asc" };
            }
            return { field, order: "asc" };
        });
    };


    return (
        <Suspense fallback={<div className="flex justify-center py-4">Loading...</div>}>
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Image src="/assets/loading_clock.gif" alt="Loading" width={80} height={80} />
                </div>
            ) : (
                error ? (
                    ErrorMessage({ error })
                ) : (
                    <>
                        <div className="flex flex-col items-center pb-8">
                            <h3 className="text-3xl sm:text-4xl text-center font-bold">{stat}</h3>
                            <p className="text-gray-600 text-sm">({statCategory})</p>
                        </div>

                        <div>
                            <div className="w-full md:w-1/2 lg:w-1/3 mx-auto pb-4">
                                <input
                                    type="text"
                                    placeholder="Search by nick ..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="p-2 rounded-md w-full focus:outline-none"
                                />
                            </div>

                            <table className="table-auto w-full rounded-xl overflow-hidden">
                                <thead className="bg-white/80">
                                    <tr className="text-xs sm:text-base">
                                        <th className="px-2 py-2 w-6">Rank</th>
                                        <th className="px-2 py-2 text-left">
                                            Player
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                className="inline ml-1 cursor-pointer" onClick={() => toggleSort("nick")}
                                            >
                                                {sortOption.field === "nick" && sortOption.order === "asc" ? (
                                                    <>
                                                        <path d="m3 8 4-4 4 4" />
                                                        <path d="M7 4v16" />
                                                        <path d="M20 8h-5" />
                                                        <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
                                                        <path d="M15 14h5l-5 6h5" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <path d="m3 8 4-4 4 4" />
                                                        <path d="M7 4v16" />
                                                        <path d="M15 4h5l-5 6h5" />
                                                        <path d="M15 20v-3.5a2.5 2.5 0 0 1 5 0V20" />
                                                        <path d="M20 18h-5" />
                                                    </>
                                                )}
                                            </svg>
                                        </th>
                                        <th className="px-2 py-2 text-right ">
                                            <div className="inline-flex items-center space-x-1">
                                                <span>Score</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                    className="inline ml-1 cursor-pointer" onClick={() => toggleSort("score")}
                                                >
                                                    {sortOption.field === "score" && sortOption.order === "asc" ? (
                                                        <>
                                                            <path d="m3 8 4-4 4 4" />
                                                            <path d="M7 4v16" />
                                                            <rect x="15" y="4" width="4" height="6" ry="2" />
                                                            <path d="M17 20v-6h-2" />
                                                            <path d="M15 20h4" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <path d="m3 8 4-4 4 4" />
                                                            <path d="M7 4v16" />
                                                            <path d="M17 10V4h-2" />
                                                            <path d="M15 10h4" />
                                                            <rect x="15" y="14" width="4" height="6" ry="2" />
                                                        </>
                                                    )}
                                                </svg>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white/40 text-xs sm:text-base'>
                                    {
                                        filteredStats.map((stat, index) => (
                                            <tr key={index} className="hover:bg-gray-300/40 even:bg-white/50 hover:font-bold">
                                                <td className="px-2 sm:px-4 py-1 text-center">{stat.rank}</td>
                                                <td className="px-2 sm:px-4 py-1">
                                                    <Link href={`/player?q=${stat.player_id}&uuid=${stat.player_uuid}`}>
                                                        <div className="flex items-center  space-x-2">
                                                            <Image
                                                                src={`https://crafatar.com/avatars/${stat.player_uuid}?size=${index < 10 ? 24 : 16}`}
                                                                alt="Player Head"
                                                                width={index < 10 ? 24 : 16}
                                                                height={index < 10 ? 24 : 16}
                                                            />
                                                            <p className="truncate overflow-hidden">{stat.player_nick}</p>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-2 sm:px-4 py-1 text-right whitespace-nowrap"><FormattedNumberText text={String(stat.score)} /></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </>
                )
            )
            }
        </Suspense>
    );
}