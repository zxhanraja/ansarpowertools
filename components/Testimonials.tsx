import React, { useState, useEffect } from 'react';
import { Star, Quote, User } from 'lucide-react';

const TESTIMONIALS = [
    {
        id: 1,
        name: "Rajesh Kumar",
        role: "Contractor, Mumbai",
        content: "Ansar Tools has been a lifesaver for my business. The spare parts are genuine and the delivery is super fast. Highly recommended!",
        rating: 5,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=60&w=100"
    },
    {
        id: 2,
        name: "Priya Sharma",
        role: "DIY Enthusiast, Delhi",
        content: "I repaired my washing machine using a motor from here. It works like new! Support team guided me on which part to buy.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=60&w=100"
    },
    {
        id: 3,
        name: "Amit Patel",
        role: "Workshop Owner, Surat",
        content: "Best prices for bulk orders. I source all my angle grinder armatures from Ansar. Quality is consistent.",
        rating: 4,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=60&w=100"
    },
    {
        id: 4,
        name: "Vikram Singh",
        role: "Industrial Mechanic, Bangalore",
        content: "Finding specific carbon brushes is hard, but they had exactly what I needed. Shipping was secure and professional.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=60&w=100"
    }
];

export const Testimonials: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="py-10 sm:py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
            {/* Background Elements - Scaled Down */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-orange-600 font-bold tracking-wide uppercase text-xs mb-1">Customer Stories</h2>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Trusted by Professionals</h3>
                </div>

                <div className="relative max-w-2xl mx-auto min-h-[220px] sm:min-h-[250px]">
                    {TESTIMONIALS.map((testimonial, index) => {
                        let position = 'opacity-0 scale-95 pointer-events-none absolute inset-0';
                        if (index === activeIndex) {
                            position = 'opacity-100 scale-100 z-20 relative';
                        } else if (index === (activeIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length) {
                            position = 'opacity-0 -translate-x-10 scale-95 absolute inset-0 transition-all duration-500';
                        } else if (index === (activeIndex + 1) % TESTIMONIALS.length) {
                            position = 'opacity-0 translate-x-10 scale-95 absolute inset-0 transition-all duration-500';
                        }

                        return (
                            <div
                                key={testimonial.id}
                                className={`transition-all duration-700 ease-in-out transform ${position}`}
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 border border-gray-100 dark:border-gray-700">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-orange-100 dark:border-orange-900/30 mb-3 sm:mb-4 shadow-sm">
                                            <img src={testimonial.image} alt={testimonial.name} loading="lazy" className="w-full h-full object-cover" />
                                        </div>

                                        <div className="mb-3 sm:mb-4 relative px-3 sm:px-4">
                                            <Quote className="absolute -top-2 sm:-top-3 -left-1 sm:-left-2 text-gray-200 dark:text-gray-700 h-5 w-5 sm:h-6 sm:w-6 transform -scale-x-100" />
                                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                                "{testimonial.content}"
                                            </p>
                                            <Quote className="absolute -bottom-2 sm:-bottom-3 -right-1 sm:-right-2 text-gray-200 dark:text-gray-700 h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{testimonial.name}</h4>
                                            <p className="text-orange-600 text-xs font-medium mb-1.5">{testimonial.role}</p>
                                            <div className="flex justify-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={`${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} transition-colors`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Controls */}
                    <div className="flex justify-center mt-5 sm:mt-6 gap-2">
                        {TESTIMONIALS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex
                                    ? 'bg-orange-600 key-scale-125 w-4'
                                    : 'bg-gray-300 dark:bg-gray-700 hover:bg-orange-400'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
