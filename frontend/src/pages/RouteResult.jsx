import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function RouteResult() {
    const { tripId } = useParams();
    const [routeData, setRouteData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`http://localhost:8000/routes/generate/${tripId}`);
                const data = await res.json();
                setRouteData(data);
            } catch (err) {
                setError("No se pudo cargar la ruta.");
            }
        }
        load();
    }, [tripId]);

    useEffect(() => {
        if (!routeData) return;

        const azureKey = "TU_LLAVE";
        const map = new atlas.Map("route-map", {
            authOptions: { authType: "subscriptionKey", subscriptionKey: azureKey },
            center: [routeData.routes[0].legs[0].startLocation.longitude, routeData.routes[0].legs[0].startLocation.latitude],
            zoom: 12
        });

        map.events.add("ready", () => {
            const coords = routeData.routes[0].legs.flatMap(leg =>
                leg.points.map(p => [p.longitude, p.latitude])
            );

            const line = new atlas.data.LineString(coords);

            map.sources.add(new atlas.source.DataSource("route", { data: line }));

            map.layers.add(
                new atlas.layer.LineLayer("route", "route", {
                    strokeColor: "#0078D7",
                    strokeWidth: 5
                })
            );
        });

    }, [routeData]);

    if (error) return <div>{error}</div>;
    if (!routeData) return <div>Cargando ruta...</div>;

    return (
        <div className="h-screen w-full">
            <div id="route-map" className="w-full h-full"></div>
        </div>
    );
}
