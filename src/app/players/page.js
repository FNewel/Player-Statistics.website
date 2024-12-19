'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getAllPlayers } from "@/utils/db";
import ErrorMessage from "@/components/ErrorMessage";


export default function PlayerPage() {
    const [players, setPlayers] = useState([]);                                     // List of all players
    const [filteredUsers, setfilteredUsers] = useState([]);                         // List of filtered players
    const [searchQuery, setSearchQuery] = useState("");                             // Search query
    const [isLoading, setIsLoading] = useState(true);                               // Loading state
    const [error, setError] = useState(null);                                       // Error state
    const [sortOption, setSortOption] = useState({ field: "date", order: "desc" });  // Sort option
    const [playerNumber, setPlayerNumber] = useState(0);                            // Number of all players
    const [currentPage, setCurrentPage] = useState(1);                              // Current page number of the table
    const [rowsPerPage, setRowsPerPage] = useState(20);                             // Rows per page of the table


    // Load players from database on page load
    useEffect(() => {
        getAllPlayers().then((data) => {
            if (data.success) {
                setPlayers(data.players);
                setPlayerNumber(data.players.length);
                setIsLoading(false);
            } else {
                setError(data.error);
            }
        });
    }, []);

    // Filter and sort players based on the search query and player's nick or date
    useEffect(() => {
        let filtered = [...players];

        // Apply search query
        if (searchQuery) {
            filtered = filtered.filter((player) =>
                player.nick.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        if (sortOption.field === "date") {
            filtered.sort((a, b) => {
                const dateA = new Date(a.last_online).getTime();
                const dateB = new Date(b.last_online).getTime();
                return sortOption.order === "asc" ? dateA - dateB : dateB - dateA;
            });
        } else if (sortOption.field === "nick") {
            filtered.sort((a, b) =>
                sortOption.order === "asc" ? a.nick.localeCompare(b.nick) : b.nick.localeCompare(a.nick)
            );
        }

        setfilteredUsers(filtered);
    }, [players, searchQuery, sortOption]);

    // Handle search query
    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page on search
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

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= Math.ceil(filteredUsers.length / rowsPerPage)) {
            setCurrentPage(newPage);
        }
    };

    // Handle rows per page change
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1); // Reset to first page when rows per page changes
    };

    // Paginate users
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );


    return (
        <div className="flex flex-col">
            <div className="flex flex-col items-center pb-8">
                <h2 className="text-3xl sm:text-4xl font-bold">
                    Player list
                </h2>
                <p className="text-gray-600">
                    {playerNumber} players total
                </p>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 mx-auto pb-4">
                <input
                    type="text"
                    placeholder="Search ..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="p-2 rounded-md w-full focus:outline-none"
                />
            </div>

            <div>
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
                        <table className="table-auto w-full rounded-xl overflow-hidden">
                            <thead className="bg-white">
                                <tr className="h-10">
                                    <th className="text-left pl-4">
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
                                    <th className="text-right pr-4">
                                        Last online
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            className="inline ml-1 cursor-pointer" onClick={() => toggleSort("date")}
                                        >
                                            {sortOption.field === "date" && sortOption.order === "asc" ? (
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
                            <tbody className='bg-white/40 text-xs sm:text-base'>
                                {paginatedUsers.map((user, index) => (
                                    <tr key={index} className="hover:bg-gray-300/40 even:bg-white/50 hover:font-bold">
                                        <td className="pl-4 py-1">
                                            <Link href={`/player?q=${user.id}&uuid=${user.uuid}`} className="flex items-center space-x-2">
                                                <Image
                                                    src={`https://crafatar.com/avatars/${user.uuid}?size=32`}
                                                    alt="Player Head"
                                                    width={32}
                                                    height={32}
                                                />
                                                <p>{user.nick}</p>
                                            </Link>
                                        </td>
                                        <td className="pr-4 text-right py-1">{user.last_online.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {user.last_online.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer for pagination */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                                <p>
                                    Showing {(currentPage - 1) * rowsPerPage + 1}-
                                    {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of{" "}
                                    {filteredUsers.length} results
                                </p>
                                <select
                                    value={rowsPerPage}
                                    onChange={handleRowsPerPageChange}
                                    className="border rounded p-1 focus:outline-none hover:cursor-pointer appearance-none pr-4 bg-white"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="p-1 border rounded disabled:opacity-50"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-1 border rounded disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === Math.ceil(filteredUsers.length / rowsPerPage)}
                                    className="p-1 border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(Math.ceil(filteredUsers.length / rowsPerPage))}
                                    disabled={currentPage === Math.ceil(filteredUsers.length / rowsPerPage)}
                                    className="p-1 border rounded disabled:opacity-50"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
}
