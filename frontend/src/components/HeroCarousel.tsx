import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
    {
        id: 1,
        title: "The Future of Shopping",
        subtitle: "Experience decentralized commerce on Cronos",
        description: "Shop with crypto, earn rewards, and own your data. The new standard in e-commerce.",
        cta: "Start Shopping",
        link: "/marketplace",
        bgClass: "bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900",
        image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=3540&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Gaming & Metaverse",
        subtitle: "New Collection",
        description: "Discover exclusive NFTs and gaming assets available only on CronoSmart.",
        cta: "View Collection",
        link: "/marketplace?category=gaming",
        bgClass: "bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900",
        image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Deals of the Day",
        subtitle: "Up to 50% Off",
        description: "Grab the best deals on electronics, fashion, and more before they expire.",
        cta: "See Deals",
        link: "/marketplace?category=deals",
        bgClass: "bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=3398&auto=format&fit=crop"
    }
];

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((c) => (c + 1) % slides.length);
    const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full h-[400px] md:h-[500px] bg-slate-900 overflow-hidden group">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image / Color */}
                    <div className={`absolute inset-0 ${slide.bgClass}`}>
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#131921] to-transparent" />
                        <div className="absolute inset-0 bg-black/40" />
                        {/* Note: In a real app we'd use the image, but for now gradient + overlay is safer if image fails */}
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover mix-blend-overlay opacity-50" />
                    </div>

                    <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center max-w-5xl">
                        <span className="text-amazon-DEFAULT font-bold text-sm md:text-base tracking-wider uppercase mb-2 animate-fadeInUp">
                            {slide.subtitle}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 shadow-sm animate-fadeInUp delay-100">
                            {slide.title}
                        </h2>
                        <p className="text-gray-200 text-lg md:text-xl max-w-xl mb-8 animate-fadeInUp delay-200">
                            {slide.description}
                        </p>
                        <div className="animate-fadeInUp delay-300">
                            <Link
                                to={slide.link}
                                className="inline-flex items-center gap-2 bg-amazon-DEFAULT text-slate-900 px-8 py-3 rounded-md font-bold hover:bg-amazon-hover transition-colors shadow-lg shadow-orange-900/20"
                            >
                                {slide.cta} <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-transparent border-2 border-white/30 text-white rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-transparent border-2 border-white/30 text-white rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === current ? 'bg-amazon-DEFAULT w-8' : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
