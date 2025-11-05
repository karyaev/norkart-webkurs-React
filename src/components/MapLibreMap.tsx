import { LngLat, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RLayer, RMap, RSource, RMarker, RNavigationControl, RPopup, useMap } from 'maplibre-react-components';
import { getHoydeFromPunkt } from '../api/getHoydeFromPunkt';
import { useEffect, useState } from 'react';
import { Overlay } from './Overlay';
import DrawComponent from './DrawComponent';
import "maplibre-theme/icons.default.css";
import "maplibre-theme/modern.css";
import "maplibre-react-components/style.css";
import { getBygningAtPunkt } from '../api/getBygningAtPunkt';
import type { GeoJSON } from 'geojson';
import { SearchBar, type Address } from './SearchBar';

const TRONDHEIM_COORDS: [number, number] = [10.40565401, 63.4156575];

export const MapLibreMap = () => {
  const [pointHoyde, setPointHoydeAtPunkt] = useState<number | undefined>(
    undefined
  );
  const [address, setAddress] = useState<Address | null>(null); // <--- Legg til dette!
  const [clickPoint, setClickPoint] = useState<LngLat | undefined>(undefined);
  const [bygningsOmriss, setBygningsOmriss] = useState<GeoJSON | undefined>(undefined);
  const polygonStyle = {
    "fill-outline-color": "rgba(0,0,0,0.1)",
    "fill-color":  "rgba(18, 94, 45, 0.41)"
  }

  useEffect(() => {
    console.log(pointHoyde, clickPoint);
  }, [clickPoint, pointHoyde]);

  function LocationCard({
    height,
    lng,
    lat,
  }: {
    height?: number | null;
    lng: number;
    lat: number;
  }) {
    const fmt = (v: number, max = 3) =>
      new Intl.NumberFormat("nb-NO", { maximumFractionDigits: max }).format(v);
  
    return (
      <div className="min-w-[220px] rounded-xl bg-white shadow-md ring-1 ring-black/5">
        <div className="px-4 py-3 text-[13px] leading-6">
          <div className="flex gap-2">
            <span className="text-slate-600">Høyde: </span>
            <span className="font-medium">{height == null ? "Ukjent" : `${fmt(height)} m`}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-600">Lengdegrad: </span>
            <span className="font-mono">{fmt(lng, 6)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-600">Breddegrad: </span>
            <span className="font-mono">{fmt(lat, 6)}</span>
          </div>
        </div>
      </div>
    );
  }

  const onMapClick = async (e: MapLayerMouseEvent) => {
    const bygningResponse = await getBygningAtPunkt(e.lngLat.lng, e.lngLat.lat)
    if (bygningResponse?.FkbData?.BygningsOmriss) {
        const geoJsonObject = JSON.parse(bygningResponse.FkbData.BygningsOmriss);
        setBygningsOmriss(geoJsonObject);
    } else {
        setBygningsOmriss(undefined);
    }
    const hoyder = await getHoydeFromPunkt(e.lngLat.lng, e.lngLat.lat);
    setPointHoydeAtPunkt(hoyder[0].Z);
    setClickPoint(new LngLat(e.lngLat.lng, e.lngLat.lat));
  };
  const [showPopup, setPopup] = useState(true);

  return (
    <RMap
      minZoom={6}
      initialCenter={TRONDHEIM_COORDS}
      initialZoom={12}
      mapStyle="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json"
      style={{
        height: `calc(100dvh - var(--header-height))`,
      }}
      onClick={onMapClick}
    >
      {clickPoint && (
        <RMarker longitude={clickPoint.lng} latitude={clickPoint.lat} />
      )}
      {bygningsOmriss &&
         <>
            <RSource id="bygning" type="geojson" data={bygningsOmriss} />
            <RLayer
               source="bygning"
               id="bygning-fill"
               type="fill"
               paint={polygonStyle}
            />
         </>
      }
      {clickPoint && (
        <RPopup longitude={clickPoint.lng} latitude={clickPoint.lat}>
          <LocationCard
            height={pointHoyde}
            lng={clickPoint.lng}
            lat={clickPoint.lat}
          />
        </RPopup>
      )}
      <Overlay>
        <SearchBar setAddress={setAddress}/> 
      </Overlay>
      <DrawComponent />
      {clickPoint && (
        <RMarker longitude={clickPoint.lng} latitude={clickPoint.lat} />
      )}
      <RNavigationControl position="top-right" />
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
