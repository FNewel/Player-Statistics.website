"use client";

export default function FormattedNumberText({ text }) {
    /**
     * Formats numbers with spaces
     *
     * @param {string} input - input string (e.g. "123456")
     * @returns {string} formatted string (e.g. "123 456")
     */
    const formatNumbersWithSpaces = (input) => {
        return input.replace(/\d+/g, (match) => {
            return Number(match).toLocaleString("en-US").replace(/,/g, " ");
        });
    };

    return (
        formatNumbersWithSpaces(text)
    );
}
