'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import FormattedNumberText from "@/components/FormattedNumberText";
import ErrorMessage from '@/components/ErrorMessage';
import { getServerStats } from "@/utils/db";


export default function Home() {

  const [serverData, setServerData] = useState({});   // Server data as name, url
  const [serverStats, setServerStats] = useState({}); // Server overall stats of all players
  const [isLoading, setIsLoading] = useState(true);   // Data loading state
  const [error, setError] = useState(null);           // Error state (if any)

  // Icon map for each stat
  const iconMap = {
    "Player count": "/assets/icons/multiplayer.webp",
    "Play time": "/assets/icons/clock.webp",
    "Damage dealt": "/assets/icons/strength.webp",
    "Travelled distance": "/assets/icons/sprint.webp",
    "Broken tools": "/assets/icons/broken-tools.webp",
    "Crafted items": "/assets/icons/crafting-table.webp",
    "Mined blocks": "/assets/icons/iron-pickaxe.webp",
    "Killed mobs": "/assets/icons/experience-orb.webp",
    "Dropped items": "/assets/icons/bundle.webp",
    "Pickedup items": "/assets/icons/bundle.webp",
  }

  // Fetch server data and stats on page load
  useEffect(() => {
    getServerStats().then((data) => {
      if (data.success) {

        // Save server data
        setServerData({
          name: data.data.server_name,
          url: data.data.server_url,
        });

        const formattedStats = {};

        // Iterate over each stat and format it
        for (const key in data.data.stats) {
          if (data.data.stats.hasOwnProperty(key)) {
            const value = data.data.stats[key];

            // Remove "total" and underscores "_", then set first letter to uppercase
            const formattedKey = key
              .replace(/total/g, "")
              .replace(/_/g, " ")
              .trim() // Remove leading and trailing whitespaces
              .replace(/^\w/, (c) => c.toUpperCase());

            // Format play time and travelled distance to better readable format
            if (key === "total_play_time") {
              formattedStats[formattedKey] = formatPlayTime(value);
            } else if (key === "total_travelled_distance") {
              formattedStats[formattedKey] = formatTravelledDistance(value);
            } else {
              formattedStats[formattedKey] = value;
            }
          }
        }

        // Save formatted stats and finish loading
        setServerStats(formattedStats);
        setIsLoading(false);
      } else {
        setError(data.error);
      }
    });
  }, []);

  /**
   * Format play time in Minecraft ticks to human readable format
   * Returns formatted play time in biggest units (eg. years or months) then two smaller units
   * @param {number} playTime - Play time in ticks
   * @returns {string} - Formatted play time
   */
  const formatPlayTime = (playTime) => {
    const totalSeconds = playTime / 20; // Convert ticks to seconds

    // Calculate years, months, days and hours
    const years = Math.floor(totalSeconds / (365 * 24 * 60 * 60));
    const months = Math.floor((totalSeconds % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60));
    const days = Math.floor((totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));

    // Helper function to get correct grammar for singular and plural
    const getGrammar = (value, singular, plural) => {
      return value === 1 ? singular : plural;
    };

    // Format play time based on biggest unit
    if (years > 0) {
      const yearsText = `${years} ${getGrammar(years, "year", "years")}`;
      const monthsText = months > 0 ? `${months} ${getGrammar(months, "month", "months")}` : "";
      const daysText = days > 0 ? `${days} ${getGrammar(days, "day", "days")}` : "";

      return [yearsText, monthsText, daysText].filter(Boolean).join(", ");
    } else {
      const monthsText = months > 0 ? `${months} ${getGrammar(months, "month", "months")}` : "";
      const daysText = days > 0 ? `${days} ${getGrammar(days, "day", "days")}` : "";
      const hoursText = hours > 0 ? `${hours} ${getGrammar(hours, "hour", "hours")}` : "";

      return [monthsText, daysText, hoursText].filter(Boolean).join(", ");
    }
  };

  /**
   * Format travelled distance in centimeters to kilometers
   * @param {number} travelledDistance - Travelled distance in centimeters
   * @returns {string} - Formatted travelled distance in kilometers
   */
  const formatTravelledDistance = (travelledDistance) => {
    const km = Number(travelledDistance) / 100000;
    return `${km.toFixed(0)} km`;
  };


  return (
    <div className="pb-8">
      <div className="flex flex-col items-center pb-8 text-4xl sm:text-5xl font-bold">
        {isLoading ? (
          <Link href="https://modrinth.com/mod/player-statistics" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-500 hover:scale-105 transition-all duration-300">
            Player Statistics
          </Link>
        ) : (
          <Link href={serverData.url} className="dark:text-white hover:text-blue-600 dark:hover:text-blue-500 hover:scale-105 transition-all duration-300">
            {serverData.name}
          </Link>
        )}

        <p className="sm:text-lg text-center text-gray-500 dark:text-gray-400 transition-all duration-300">
          Summary of all player statistics
        </p>
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
        serverStats &&
        <div className="flex flex-wrap justify-center gap-4 pt-4 lg:pt-16">
          {
            Object.keys(serverStats).map((stat, index) =>
              <div key={index} className="w-full lg:w-max bg-white/40 dark:bg-zinc-500/40 rounded-lg transition-all duration-300">
                <div className="flex flex-col items-center bg-white dark:bg-zinc-800 rounded-lg p-4 m-2 lg:w-max hover:scale-105 hover:shadow-lg transition-all duration-300">
                  <h2 className="text-xl font-bold text-center dark:text-gray-200 transition-all duration-300">{stat}</h2>
                  <div className="flex flex-col sm:flex-row pt-2 sm:pt-0 space-y-2 sm:space-y-0 sm:space-x-2 items-center">
                    <Image src={iconMap[stat]} alt="Icon" width={16} height={16} className="shrink-0 w-4 h-4" />
                    <p className="text-center sm:text-left text-pretty dark:text-gray-300 transition-all duration-300">
                      <FormattedNumberText text={String(serverStats[stat])} />
                    </p>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}