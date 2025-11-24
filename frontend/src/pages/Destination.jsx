import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Globe, ArrowRight, Sparkles } from "lucide-react";

export default function Destination() {
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");

    const [locations, setLocations] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Cargar ciudades y países disponibles del backend
    useEffect(() => {
        async function loadLocations() {
            const res = await fetch("http://localhost:8000/places/available-locations");
            const data = await res.json();
            setLocations(data);
        }
        loadLocations();
    }, []);

    // Filtrar ciudades según input
    useEffect(() => {
        if (!city) {
            setFilteredCities([]);
            return;
        }

        const matches = locations
            .filter((loc) =>
                loc.city.toLowerCase().includes(city.toLowerCase())
            )
            .slice(0, 5);

        setFilteredCities(matches);
    }, [city, locations]);

    // Filtrar países según input
    useEffect(() => {
        if (!country) {
            setFilteredCountries([]);
            return;
        }

        const matches = locations
            .filter((loc) =>
                loc.country.toLowerCase().includes(country.toLowerCase())
            )
            .slice(0, 5);

        setFilteredCountries(matches);
    }, [country, locations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:8000/trips/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.id,
                city,
                country,
            }),
        });

        const data = await res.json();
        navigate(`/swipes/${data.id}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-8">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full mb-4 shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                        Tinvel
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Descubre tu próxima aventura
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-orange-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                        ¿A dónde quieres viajar?
                    </h2>
                    <p className="text-gray-600 text-center mb-6 text-sm">
                        Selecciona tu destino y descubre lugares increíbles
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* CITY INPUT */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ciudad
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                                <input
                                    type="text"
                                    placeholder="Ej. París, Tokio, Nueva York..."
                                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onBlur={() => setTimeout(() => setFilteredCities([]), 200)}
                                />
                            </div>

                            {filteredCities.length > 0 && (
                                <ul className="absolute bg-white border-2 border-orange-200 shadow-lg rounded-xl w-full mt-2 z-20 overflow-hidden">
                                    {filteredCities.map((loc, idx) => (
                                        <li
                                            key={idx}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                setCity(loc.city);
                                                setFilteredCities([]);
                                            }}
                                            className="px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                        >
                                            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                            <span className="text-gray-800 font-medium">{loc.city}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* COUNTRY INPUT */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                País
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                                <input
                                    type="text"
                                    placeholder="Ej. Francia, Japón, Estados Unidos..."
                                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    onBlur={() => setTimeout(() => setFilteredCountries([]), 200)}
                                />
                            </div>

                            {filteredCountries.length > 0 && (
                                <ul className="absolute bg-white border-2 border-orange-200 shadow-lg rounded-xl w-full mt-2 z-20 overflow-hidden">
                                    {filteredCountries.map((loc, idx) => (
                                        <li
                                            key={idx}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                setCountry(loc.country);
                                                setFilteredCountries([]);
                                            }}
                                            className="px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                        >
                                            <Globe className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                            <span className="text-gray-800 font-medium">{loc.country}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl py-4 font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group mt-6"
                        >
                            <span>Comenzar aventura</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                {/* Footer hint */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        🌍 Explora lugares increíbles en tu destino
                    </p>
                </div>
            </div>
        </div>
    );
}