'use client';

import Image from "next/image";
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useEffect, useState } from "react";

import ErrorMessage from "@/components/ErrorMessage";
import { getPlayerDataByID, getPlayerDataByUUID } from "@/utils/db";
import FormattedStatText from "@/components/FormattedStatText";
import FormattedNumberText from "@/components/FormattedNumberText";


/**
 * Process query params from URL
 * This function is needed to properly export page as static HTML
 * @param {Function} onQuery - Function to process query
 * @returns {null} - Returns null, we don't need to render anything, just process query
 */
function QueryProcessor({ onQuery }) {
    const searchParams = useSearchParams();         // Get search params
    const urlQueryID = searchParams.get('q');       // User ID from query
    const urlQueryUUID = searchParams.get('uuid');  // User UUID from query

    onQuery({ id: urlQueryID, uuid: urlQueryUUID });
    return null;
}


export default function PlayerPage() {
    const [playerData, setPlayerData] = useState({});                                   // Player data
    const [playerStats, setPlayerStats] = useState({});                                 // Player stats
    const [totalPlaytime, setTotalPlaytime] = useState("");                             // Total playtime
    const [filteredStats, setFilteredStats] = useState([]);                             // Filtered stats
    const [searchQuery, setSearchQuery] = useState("");                                 // Search query
    const [isLoading, setIsLoading] = useState(true);                                   // Loading state
    const [error, setError] = useState(null);                                           // Error state
    const [sortOption, setSortOption] = useState({ field: "pos", order: "asc" });       // Sort option
    const [selectedStat, setSelectedStat] = useState("custom");                         // Selected stat (['broken', 'crafted', 'custom', 'dropped', 'killed', 'killed_by', 'mined', 'picked_up', 'used'])

    /**
     * Handle query from URL and data loading by ID or UUID
     * @param {Object} query - Query object
     * @returns {null} - No return value but data as states
     */
    const handleQuery = (query) => {
        if (!query.id || !query.uuid) {
            return;
        }

        // No need to process data, if player data already exists
        if (playerData.nick) {
            return;
        }

        // Load data by ID
        if (query.id) {
            getPlayerDataByID(query.id).then((data) => {
                if (data.success) {
                    setPlayerStats(data.player.stats);
                    setPlayerData({
                        nick: data.player.nick,
                        uuid: data.player.uuid,
                        hof_score: data.player.hof,
                        last_online: `${data.player.last_online.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${data.player.last_online.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`,
                    })
                    calculateTotalPlaytime(data.player.stats.custom);
                    setIsLoading(false);
                } else {
                    setError(data.error);
                }
            });
        }

        // Load data by UUID
        else if (query.uuid) {
            getPlayerDataByUUID(query.uuid).then((data) => {
                if (data.success) {
                    setPlayerStats(data.player.stats);
                    setPlayerData({
                        nick: data.player.nick,
                        uuid: data.player.uuid,
                        hof_score: data.player.hof,
                        last_online: `${data.player.last_online.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${data.player.last_online.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`,
                    })
                    setIsLoading(false);
                } else {
                    setError(data.error);
                }
            });
        }

        // Show error if no ID or UUID found in URL
        else {
            setIsLoading(false);
            setError("No player ID or UUID found in URL");
        }
    };

    // Handle search query
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    // Apply sorting and filtering to stats based on the current sortOption, searchQuery and selectedStat
    const applySortingAndFiltering = (stats, currentSortOption, query, statCategory) => {
        let filtered = stats[statCategory] || [];

        // Sorting by searchQuery
        if (query) {
            filtered = filtered.filter((stat) =>
                stat.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Sorting by sortOption
        filtered.sort((a, b) => {
            const { field, order } = currentSortOption;

            if (field === "score") {
                return order === "asc" ? a.value - b.value : b.value - a.value;
            } else if (field === "stat") {
                return order === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (field === "pos") {
                const aPos = a.position ?? (order === "asc" ? Infinity : -Infinity);
                const bPos = b.position ?? (order === "asc" ? Infinity : -Infinity);

                return order === "asc" ? aPos - bPos : bPos - aPos;
            }
            return 0; // No sorting
        });

        return filtered;
    };

    // Toggle sorting
    const toggleSort = (field) => {
        // Create new sort option
        const newSortOption = {
            field,
            order: sortOption.field === field && sortOption.order === "asc" ? "desc" : "asc",
        };

        // Apply sorting and filtering
        const sortedAndFilteredStats = applySortingAndFiltering(
            playerStats,
            newSortOption,
            searchQuery,
            selectedStat
        );

        setFilteredStats(sortedAndFilteredStats);
        setSortOption(newSortOption);
    };

    // Update filtered stats when playerStats, searchQuery, sortOption or selectedStat changes
    useEffect(() => {
        const sortedAndFilteredStats = applySortingAndFiltering(
            playerStats,
            sortOption,
            searchQuery,
            selectedStat
        );
        setFilteredStats(sortedAndFilteredStats);
    }, [playerStats, searchQuery, sortOption, selectedStat]);


    /**
     * Format play time in Minecraft ticks to human readable format
     * Returns formatted play time in month, day and hour
     * @param {number} playTime - Play time in ticks
     * @returns {string} - Formatted play time
     */
    const calculateTotalPlaytime = (customStats) => {
        // Find the total playtime in stats
        const playTimeStat = customStats.find((stat) => stat.name === "play_time");
        if (!playTimeStat || !playTimeStat.value) {
            setTotalPlaytime("No playtime data available");
            return;
        }

        const playTimeTicks = playTimeStat.value;
        const totalSeconds = playTimeTicks / 20;    // Convert Minecraft ticks to seconds

        // Calculate months, days, and hours
        const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
        const days = Math.floor((totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));

        // Helper function for proper singular/plural grammar
        const getGrammar = (value, singular, plural) => {
            return value === 1 ? singular : plural;
        };

        // Generate text with proper grammar
        const monthsText = months > 0 ? `${months} ${getGrammar(months, "month", "months")}` : "";
        const daysText = days > 0 ? `${days} ${getGrammar(days, "day", "days")}` : "";
        const hoursText = hours > 0 ? `${hours} ${getGrammar(hours, "hour", "hours")}` : "";

        // Combine the parts into the final string
        const totalPlaytime = [monthsText, daysText, hoursText].filter(Boolean).join(", ");
        setTotalPlaytime(totalPlaytime || "Less than 1 hour");
    };


    return (
        <Suspense fallback={<div className="flex justify-center py-4">Loading...</div>}>
            <QueryProcessor onQuery={handleQuery} />
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 justify-center pb-8">
                <div className="flex flex-col justify-center">
                    {playerData.uuid ? (
                        <Image
                            src={`https://crafatar.com/avatars/${playerData.uuid}?size=80`}
                            alt="Player Head"
                            width={80}
                            height={80}
                        />
                    ) : (
                        <Image
                            src="/assets/steve.webp"
                            alt="Player Head"
                            width={80}
                            height={80}
                        />
                    )}
                </div>
                <div className="flex flex-col justify-center items-center sm:items-start text-xs sm:text-base">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-xl sm:text-3xl font-bold">{playerData.nick}</h2>
                        <p>(<span className="text-mc_gold">{playerData.hof_score}⭐</span>)</p>
                    </div>
                    <p><b>Last played:</b> {playerData.last_online}</p>
                    <p><b>Total playtime:</b> {totalPlaytime}</p>
                    <p id="urlUUID" className="hidden">{playerData.uuid}</p>
                </div>
            </div>

            {/* Search bar */}
            <div className="flex items-center lg:space-x-2 pb-2 lg:pb-0">
                {/* On PC */}
                <div className="my-2 space-x-2 bg-white rounded-md p-1 shrink-0 hidden lg:flex text-xs xl:text-base">
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "custom" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("custom")}>Custom</button>
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "mined" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("mined")}>Mined</button>
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "crafted" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("crafted")}>Crafted</button>
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "used" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("used")}>Used</button>
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "broken" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("broken")}>Broken</button>
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "picked_up" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("picked_up")}>Picked Up</button>
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "dropped" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("dropped")}>Dropped</button>
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "killed" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("killed")}>Kills</button>
                    <button className={`hover:font-bold text-gray-800 px-2 py-1 rounded-md ${selectedStat === "killed_by" ? "bg-gray-200/80" : ""}`} onClick={() => setSelectedStat("killed_by")}>Deaths</button>
                </div>

                {/* On Mobile */}
                <select
                    className="p-2 px-3 rounded-lg appearance-none focus:outline-none mr-2 lg:hidden cursor-pointer bg-white"
                    onChange={(e) => setSelectedStat(e.target.value)}
                >
                    <option value="custom">Custom</option>
                    <option value="mined">Mined</option>
                    <option value="crafted">Crafted</option>
                    <option value="used">Used</option>
                    <option value="broken">Broken</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="dropped">Dropped</option>
                    <option value="killed">Kills</option>
                </select>

                <input
                    type="text"
                    placeholder="Search ..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="p-2 rounded-md w-full focus:outline-none text-base lg:text-xs xl:text-base"
                />
            </div>

            {/* Table with stats */}
            {isLoading ? (
                error ? (
                    ErrorMessage({ error })
                ) : (
                    <div className="flex justify-center py-4">
                        <Image src="/assets/loading_clock.gif" alt="Loading" width={80} height={80} />
                    </div>
                )
            ) : (
                <table className="table-auto w-full rounded-xl overflow-hidden">
                    <thead className="bg-white">
                        <tr className="h-10">
                            <th className="w-16 sm:w-24 ">
                                Pos
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="inline ml-1 cursor-pointer" onClick={() => toggleSort("pos")}
                                >
                                    {sortOption.field === "pos" && sortOption.order === "asc" ? (
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
                            </th>
                            <th className="text-left max-w-min">
                                Statistics
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="inline ml-1 cursor-pointer" onClick={() => toggleSort("stat")}
                                >
                                    {sortOption.field === "stat" && sortOption.order === "asc" ? (
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
                            <th className="text-right w-36 sm:w-auto pr-4">
                                Score
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
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white/40 text-xs md:text-base">
                        {filteredStats.map((stat, index) => (
                            <tr key={index} className="hover:bg-gray-300/40 even:bg-white/50 hover:font-bold">
                                <td className="text-center max-w-fit">
                                    {stat.position ?
                                        stat.position === 1 ?
                                            <span className="text-yellow-600 text-sm"><span className="text-yellow-600 text-xs">#</span>1</span>
                                            :
                                            stat.position === 2 ?
                                                <span className="text-orange-600 text-sm"><span className="text-orange-600 text-xs">#</span>2</span>
                                                :
                                                stat.position === 3 ?
                                                    <span className="text-gray-800 text-sm"><span className="text-gray-800 text-xs">#</span>3</span>
                                                    :
                                                    <span className="text-gray-500 text-sm"><span className="text-gray-400 text-xs">#</span>{stat.position}</span>
                                        :
                                        ""
                                    }
                                </td>
                                <td className="text-gray-700 truncate overflow-hidden max-w-20">
                                    <FormattedStatText text={stat.name} />
                                </td>
                                <td className="text-right pr-4 ">
                                    <FormattedNumberText text={String(stat.value)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table >
            )
            }
        </Suspense>
    );
}