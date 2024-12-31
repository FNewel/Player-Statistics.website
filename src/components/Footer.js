'use client';

import React from "react";
import Link from "next/link";
import { useState } from 'react';

const Footer = () => {

    const [commitHash, setCommitHash] = useState("TODO");

    return (
        <div className="w-full mx-auto self-end mt-4 px-6 py-4 bg-black/40 text-gray-300">
            <div className="container mx-auto">
                <div className="flex justify-between">
                    <div>
                        <Link href="https://modrinth.com/mod/player-statistics" className="text-xs sm:text-lg font-bold">
                            Player Statistics
                        </Link>
                        <div className="text-xs sm:text-base">
                            <span className="">prod@</span>
                            <Link href="https://github.com/FNewel/Player-Statistics.website/releases/tag/1.1.2" className="text-green-600">
                                {commitHash}
                            </Link>
                        </div>
                    </div>

                    <div className="text-xs sm:text-base">
                        <p className="text-right">
                            Written by
                            <Link href="https://github.com/fnewel" className="font-bold"> FNewell</Link>
                        </p>
                        <p className="text-right">with <span className="text-red-600">❤️</span> and lots of ☕</p>

                    </div>
                </div>

                <p className="text-center text-xs text-gray-500 pt-1">NOT AN OFFICIAL MINECRAFT SERVICE. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.</p>
            </div>
        </div>
    );
}

export default Footer;