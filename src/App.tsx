import { getHoydeFromPunkt } from './api/getHoydeFromPunkt';
import Header from './components/Header';
import { MapLibreMap } from './components/MapLibreMap';
import './index.css';
import { MapLayerMouseEvent } from "maplibre-gl";
import { RMap, RMarker, RNavigationControl, RPopup } from "maplibre-react-components";
import { use, useEffect, useState } from "react";

const trondheim: [number, number] = [10.39, 63.43];


function App() {
  const [markerPosition, setMarkerPosition] = useState<null | [number, number]>(
    null,
  );
  const [showPopup, setPopup] = useState(true);
  const [hoyde, setHoyde] = useState<number | null>(0);

  useEffect(()=> {
      async function fetchHoyde() {
        if (!markerPosition) return;
        const result =await getHoydeFromPunkt(markerPosition[0], markerPosition[1]);
        setHoyde(result);
      }
      fetchHoyde();
  }, [markerPosition]);

  function handleClick(e: MapLayerMouseEvent) {
    setMarkerPosition(e.lngLat.toArray());
  }

  return (
    <RMap
      minZoom={6}
      onClick={handleClick}
      initialCenter={trondheim}
      initialZoom={8}
      mapStyle="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json"
    >
      <RMarker longitude={trondheim[0]} latitude={trondheim[1]} />
      {markerPosition && (
        <RMarker longitude={markerPosition[0]} latitude={markerPosition[1]} />
      )}
      <RNavigationControl position="top-right" />
      {markerPosition && showPopup && hoyde !== null && hoyde.length > 0 && (
        <RPopup
          longitude={markerPosition[0]}
          latitude={markerPosition[1]}
      >
        Høyde: {hoyde[0].Z}
      </RPopup>
      )}
    </RMap>
  );
}

export default App;