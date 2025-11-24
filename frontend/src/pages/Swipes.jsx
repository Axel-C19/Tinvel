import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Heart, X, Star, Clock, Info } from "lucide-react";

export default function Swipes() {
    const { tripId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [places, setPlaces] = useState([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const cardRef = useRef(null);

    const current = places[index];
    const progress = ((index) / places.length) * 100;

    useEffect(() => {
        async function load() {
            const tripRes = await fetch(`http://localhost:8000/trips/${tripId}`);
            const trip = await tripRes.json();

            const res = await fetch(
                `http://localhost:8000/places/by-city/${trip.destination_city}`
            );

            const data = await res.json();
            setPlaces(data);
            setLoading(false);
        }
        load();
    }, [tripId]);

    const handleDragStart = (clientX, clientY) => {
        if (isAnimating) return;
        setIsDragging(true);
        setDragStart({ x: clientX, y: clientY });
    };

    const handleDragMove = (clientX, clientY) => {
        if (!isDragging || isAnimating) return;

        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;
        setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleDragEnd = () => {
        if (!isDragging || isAnimating) return;
        setIsDragging(false);

        const threshold = 100;

        if (Math.abs(dragOffset.x) > threshold) {
            // Swipe confirmed - execute immediately
            const liked = dragOffset.x > 0;
            handleSwipe(liked);
        } else {
            // Not enough drag - return to center
            setDragOffset({ x: 0, y: 0 });
        }
    };

    async function handleSwipe(liked) {
        if (isAnimating) return;

        setIsAnimating(true);

        // Animación de salida inmediata
        const direction = liked ? 1 : -1;
        setDragOffset({ x: direction * 1000, y: -100 });

        // Llamada al backend en paralelo con la animación
        const apiCall = fetch("http://localhost:8000/swipes/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.id,
                trip_id: Number(tripId),
                place_id: current.id,
                liked
            }),
        });

        // Esperar que termine la animación
        setTimeout(async () => {
            // Asegurar que el API call termine
            await apiCall;

            const next = index + 1;

            if (next >= places.length) {
                navigate(`/route/${tripId}`);
                return;
            }

            setIndex(next);
            setDragOffset({ x: 0, y: 0 });
            setIsAnimating(false);
        }, 300);
    }

    // Event handlers para mouse
    const onMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDragStart(e.clientX, e.clientY);
    };

    const onMouseMove = (e) => {
        e.preventDefault();
        handleDragMove(e.clientX, e.clientY);
    };

    const onMouseUp = (e) => {
        e.preventDefault();
        handleDragEnd();
    };

    // Event handlers para touch
    const onTouchStart = (e) => {
        e.stopPropagation();
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
    };

    const onTouchEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDragEnd();
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);

            return () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
            };
        }
    }, [isDragging, dragStart, dragOffset]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando lugares...</p>
                </div>
            </div>
        );
    }

    if (!current) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">No hay más lugares para esta ciudad.</h2>
                </div>
            </div>
        );
    }

    const getCardStyle = () => {
        const rotation = dragOffset.x * 0.03;
        const opacity = 1 - Math.abs(dragOffset.x) / 500;

        return {
            transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            opacity: opacity,
            touchAction: 'none'
        };
    };

    const getOverlayOpacity = () => {
        return Math.min(Math.abs(dragOffset.x) / 300, 0.5);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
            {/* Header */}
            <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-orange-200">
                <div className="max-w-md mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            Descubre Lugares
                        </h1>
                        <div className="text-sm font-medium text-gray-600">
                            {index + 1} / {places.length}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Cards Stack Container */}
            <div className="relative flex items-center justify-center px-4 py-8 min-h-[calc(100vh-120px)]">
                <div className="relative w-full max-w-md h-[600px]">
                    {/* Next card preview (underneath) */}
                    {places[index + 1] && (
                        <div className="absolute inset-0 w-full">
                            <div
                                className="w-full h-full bg-white rounded-3xl shadow-xl transform scale-95 opacity-50 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${places[index + 1].image_url || "https://placehold.co/400x250?text=No+Image"})`
                                }}
                            />
                        </div>
                    )}

                    {/* Current card */}
                    <div
                        ref={cardRef}
                        className="absolute inset-0 w-full cursor-grab active:cursor-grabbing select-none"
                        style={getCardStyle()}
                        onMouseDown={onMouseDown}
                        onTouchStart={onTouchStart}
                    >
                        <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                            {/* Image */}
                            <div className="relative h-[400px] overflow-hidden">
                                <img
                                    src={current.image_url || "https://placehold.co/400x250?text=No+Image"}
                                    alt={current.name}
                                    className="w-full h-full object-cover select-none"
                                    draggable="false"
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Category badge */}
                                {current.category && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-orange-600 border border-orange-200">
                                        {current.category}
                                    </div>
                                )}

                                {/* Color overlay based on swipe direction */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        backgroundColor: dragOffset.x > 0
                                            ? `rgba(34, 197, 94, ${getOverlayOpacity()})`
                                            : dragOffset.x < 0
                                                ? `rgba(239, 68, 68, ${getOverlayOpacity()})`
                                                : 'transparent'
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {current.name}
                                    </h2>

                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        {current.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{current.rating}</span>
                                            </div>
                                        )}
                                        {current.estimated_time && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{current.estimated_time}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-600 leading-relaxed">
                                        {current.description}
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center justify-center gap-6 pt-4">
                                    <button
                                        onClick={() => handleSwipe(false)}
                                        disabled={isAnimating}
                                        className="group relative w-16 h-16 bg-white border-2 border-red-500 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-8 h-8 text-red-500 mx-auto group-hover:scale-110 transition-transform" />
                                    </button>

                                    <button
                                        onClick={() => alert('Más información próximamente')}
                                        className="w-12 h-12 bg-white border-2 border-orange-400 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
                                    >
                                        <Info className="w-5 h-5 text-orange-400 mx-auto" />
                                    </button>

                                    <button
                                        onClick={() => handleSwipe(true)}
                                        disabled={isAnimating}
                                        className="group relative w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Heart className="w-8 h-8 text-white mx-auto group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions hint */}
            <div className="fixed bottom-6 left-0 right-0 text-center">
                <div className="inline-flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm">
                    <span>Desliza o usa los botones</span>
                    <span className="text-xl">👆</span>
                </div>
            </div>
        </div>
    );
}