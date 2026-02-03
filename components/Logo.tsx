import React from 'react';

interface LogoProps {
    className?: string;
    style?: React.CSSProperties;
    variant?: 'brand' | 'simple';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10", style, variant = 'brand' }) => {
    const logoUrl = "https://ik.imagekit.io/ioktbcewp/ChatGPT%20Image%20Jan%2026,%202026,%2012_56_43%20PM.png";

    return (
        <img
            src={logoUrl}
            alt="Ansar Power Tools Logo"
            className={`${className} object-contain ${variant === 'brand' ? 'rounded-xl shadow-lg' : ''}`}
            style={style}
        />
    );
};
