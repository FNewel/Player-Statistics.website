"use client";

export default function FormattedStatText({ text }) {
    const formatStat = (input) => {
        /* Remove "_" from the text and set first character to uppercase */
        return input.replace(/_/g, " ").charAt(0).toUpperCase() + input.replace(/_/g, " ").slice(1);
    };

    return (
        formatStat(text)
    );
}
