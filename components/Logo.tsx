import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => {
    return (
        <svg
            viewBox="30 20 40 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Ansar Power Tools Logo"
        >
            {/* Lightning Bolt / Power Symbol */}
            <path
                d="M48 25L35 50H48L45 75L65 45H52L55 25H48Z"
                className="fill-orange-500"
            />
        </svg>
    );
};
