'use client';

import React from "react";

// Color map for formatting codes
const colorMap = {
    "0": "mc_black",
    "1": "mc_dark_blue",
    "2": "mc_dark_green",
    "3": "mc_dark_aqua",
    "4": "mc_dark_red",
    "5": "mc_dark_purple",
    "6": "mc_gold",
    "7": "mc_gray",
    "8": "mc_dark_gray",
    "9": "mc_blue",
    "a": "mc_green",
    "b": "mc_aqua",
    "c": "mc_red",
    "d": "mc_light_purple",
    "e": "mc_yellow",
    "f": "mc_white",
};

// Style map for formatting codes
const styleMap = {
    "l": "font-bold",
    "o": "italic",
    "n": "underline",
    "m": "line-through",
    "r": "reset",
};

const MinecraftText = ({ text }) => {
    const parseText = (text) => {
        const regex = /§([0-9a-fklmnor])|([^§]+)/g;
        let currentStyles = [];
        const elements = [];

        let match;
        while ((match = regex.exec(text)) !== null) {

            // It's a formatting code
            if (match[1]) {
                const code = match[1];
                if (colorMap[code]) {
                    currentStyles = [`text-${colorMap[code]}`]; // Set the color
                } else if (styleMap[code]) {
                    if (code === "r") {
                        currentStyles = []; // Reset styles
                    } else {
                        currentStyles.push(styleMap[code]); // Add style
                    }
                }
            }

            // It's plain text
            else if (match[2]) {
                const content = match[2];
                if (content === "\\n") {
                    elements.push(<br key={elements.length} />);
                    continue;
                }

                elements.push(
                    <span key={elements.length} className={currentStyles.join(" ")}>
                        {content}
                    </span>
                );
            }
        }

        return elements;
    };

    const parsedElements = parseText(text);

    return (
        <p className="whitespace-pre-wrap">
            {parsedElements.map((element, index) => (
                <React.Fragment key={index}>{element}</React.Fragment>
            ))}
        </p>
    );
};

export default MinecraftText;
