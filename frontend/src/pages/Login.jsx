import { useState } from "react";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Sparkles, AlertCircle } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const user = await loginUser(email, password);
            login(user);
            navigate("/destination");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-8">
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
                        Bienvenido de nuevo
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-orange-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Iniciar Sesión
                    </h2>

                    {error && (
                        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl py-4 font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group mt-6"
                        >
                            <LogIn className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            <span>Entrar</span>
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            ¿No tienes cuenta?{" "}
                            <a
                                href="/signup"
                                className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors"
                            >
                                Crear una cuenta
                            </a>
                        </p>
                    </div>
                </div>

                {/* Bottom hint */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        ✨ Descubre lugares increíbles en tu próximo viaje
                    </p>
                </div>
            </div>
        </div>
    );
}