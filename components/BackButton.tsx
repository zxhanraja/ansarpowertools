import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on home page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-all duration-300 mb-6"
        >
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
            </div>
            <span>Back</span>
        </button>
    );
};
