import { LngLat, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RMap, RMarker, RNavigationControl, RPopup, useMap } from 'maplibre-react-components';
import { getHoydeFromPunkt } from '../api/getHoydeFromPunkt';
import { useEffect, useState } from 'react';
import { Overlay } from './Overlay';
import DrawComponent from './DrawComponent';
import { SearchBar, type Address } from './SearchBar';

const trondheim: [number, number] = [10.40565401, 63.4156575];

export const MapLibreMap = () => {
  const [pointHoyde, setPointHoydeAtPunkt] = useState<number | undefined>(
    undefined
  );
  const [address, setAddress] = useState<Address | null>(null); // <--- Legg til dette!
  const [clickPoint, setClickPoint] = useState<LngLat | undefined>(undefined);

  useEffect(() => {
    console.log(pointHoyde, clickPoint);
  }, [clickPoint, pointHoyde]);

  const onMapClick = async (e: MapLayerMouseEvent) => {
    const hoyder = await getHoydeFromPunkt(e.lngLat.lng, e.lngLat.lat);
    setPointHoydeAtPunkt(hoyder[0].Z);
    setClickPoint(new LngLat(e.lngLat.lng, e.lngLat.lat));
  };
  const [showPopup, setPopup] = useState(true);

  return (
    <RMap
      minZoom={6}
      initialCenter={trondheim}
      initialZoom={12}
      mapStyle="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json"
      style={{
        height: `calc(100dvh - var(--header-height))`,
      }}
      onClick={onMapClick}
    >
      <Overlay>
        <SearchBar setAddress={setAddress}/> 
      </Overlay>
      <DrawComponent />
      {clickPoint && (
        <RMarker longitude={clickPoint.lng} latitude={clickPoint.lat} />
      )}
      <RNavigationControl position="top-right" />
      {clickPoint && showPopup && (
        <RPopup
          longitude={clickPoint?.lng}
          latitude={clickPoint?.lat}
      >
        Høyde: {pointHoyde}
      </RPopup>
      )}
      {address && (
      <MapFlyTo
         lngLat={
         new LngLat(address.PayLoad.Posisjon.X, address.PayLoad.Posisjon.Y)
         }
      />
      )}
    </RMap>
  );
};

function MapFlyTo({ lngLat }: { lngLat: LngLat }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 20, speed: 10 });
  }, [lngLat, map]);

  return null;
}
