'use client';

import { useEffect, useState } from "react";

import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import { getServerData } from "@/utils/db";


const MainPage = ({ children }) => {
    const [serverData, setServerData] = useState(null);     // Server data stats

    // Fetch server data on load
    useEffect(() => {
        getServerData().then((data) => {
            if (data.success) {
                setServerData(data.data);
            }
        });
    }, []);

    return (
        <div className="relative z-10 pt-2 grid grid-rows-[auto,1fr,auto] min-h-screen">
            {/* Menu */}
            {serverData === null ?
                <Menu desc="§cPowered by§r\n§a§lPlayer statistics §7§8(no motd found)" url="https://modrinth.com/mod/player-statistics" icon="/assets/server_missing_img.webp" />
                :
                <Menu desc={serverData.desc} url={serverData.url} icon={serverData.icon} />
            }

            {/* Page Content */}
            <div className="container mx-auto sm:px-8 transition-all duration-300">
                <div className="overflow-hidden sm:rounded-xl p-8"
                    style={{
                        backgroundImage: 'url("/assets/background/quartz.webp")',
                    }}
                >
                    <div className="opacity-30 pb-2">
                        <p className="text-xs text-right">Last update:</p>
                        <p className="text-xs text-right">{serverData?.last_update.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {serverData?.last_update.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}</p>
                    </div>
                    {children}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );

}

export default MainPage;