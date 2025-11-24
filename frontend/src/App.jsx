import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Destination from "./pages/Destination";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Swipes from "./pages/Swipes.jsx"
import RouteResult from "./pages/RouteResult.jsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>

                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/destination"
                        element={
                            <ProtectedRoute>
                                <Destination />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/swipes/:tripId"
                        element={
                            <ProtectedRoute>
                                <Swipes />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/route/:tripId"
                        element={
                            <ProtectedRoute>
                                <RouteResult />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
