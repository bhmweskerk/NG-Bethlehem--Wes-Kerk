import {useEffect, useState} from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {ExternalLink, MapPin} from 'lucide-react';

interface ChurchLocationMapProps {
  mapsUrl: string;
  address: string;
}

const MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  (typeof globalThis !== 'undefined'
    ? (globalThis as {GOOGLE_MAPS_API_KEY?: string}).GOOGLE_MAPS_API_KEY
    : undefined) ||
  '';

interface ResolvedPlace {
  location: {lat: number; lng: number};
  displayName: string;
  formattedAddress: string;
}

function InteractiveChurchMap({
  mapsUrl,
  fallbackAddress,
}: {
  mapsUrl: string;
  fallbackAddress: string;
}) {
  const status = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');
  const [placeInfo, setPlaceInfo] = useState<ResolvedPlace | null>(null);
  const [lookupFailed, setLookupFailed] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    if (status === APILoadingStatus.AUTH_FAILURE) {
      setLookupFailed(true);
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    } else if (status === APILoadingStatus.FAILED) {
      setLookupFailed(true);
    }
  }, [status]);

  useEffect(() => {
    if (!placesLib) return;
    let active = true;

    const resolveChurchLocation = async () => {
      try {
        const {places} = await placesLib.Place.searchByText({
          textQuery:
            'Nederduitse Gereformeerde Kerk - Bethlehem-Wes, 48 Kerk St, Bethlehem, 9701',
          fields: ['location', 'displayName', 'formattedAddress'],
          maxResultCount: 1,
        });
        if (!active) return;
        const first = places?.[0];
        if (first?.location) {
          setPlaceInfo({
            location: {
              lat: first.location.lat(),
              lng: first.location.lng(),
            },
            displayName: first.displayName || 'NG Kerk Bethlehem-Wes',
            formattedAddress: first.formattedAddress || fallbackAddress,
          });
        } else {
          setLookupFailed(true);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('Quota') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (active) {
          setLookupFailed(true);
        }
      }
    };

    void resolveChurchLocation();
    return () => {
      active = false;
    };
  }, [placesLib, fallbackAddress]);

  if (lookupFailed || status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="bg-[#F4EFE6] border border-stone-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#1B4332] mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-stone-950">
              NG Kerk Bethlehem-Wes
            </p>
            <p className="text-xs text-stone-600 mt-0.5">{fallbackAddress}</p>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap shrink-0"
        >
          Maak oop in Google Maps
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    );
  }

  if (!placeInfo) {
    return (
      <div className="h-[320px] rounded-xl border border-stone-200 bg-[#F4EFE6] flex items-center justify-center text-xs text-stone-600">
        Laai kerk se ligging op Google Maps...
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-stone-200 bg-white">
      <div className="w-full h-[320px]">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={placeInfo.location}
          defaultZoom={16}
          gestureHandling="greedy"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{width: '100%', height: '100%'}}
        >
          <AdvancedMarker
            ref={markerRef}
            position={placeInfo.location}
            title={placeInfo.displayName}
            onClick={() => setInfoOpen(true)}
          >
            <Pin
              background="#1B4332"
              borderColor="#143326"
              glyphColor="#FFFFFF"
            />
          </AdvancedMarker>

          {infoOpen && marker && (
            <InfoWindow
              anchor={marker}
              maxWidth={260}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="p-1 text-stone-900">
                <p className="font-semibold text-xs">{placeInfo.displayName}</p>
                <p className="text-xs text-stone-600 mt-0.5">
                  {placeInfo.formattedAddress}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline mt-1.5"
                >
                  Kry aanwysings
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      <div className="px-4 py-3 bg-[#FBF9F5] border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-600">{placeInfo.formattedAddress}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline whitespace-nowrap"
        >
          Maak oop in Google Maps
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function ChurchLocationMap({mapsUrl, address}: ChurchLocationMapProps) {
  if (!MAPS_API_KEY) {
    return (
      <div className="bg-[#F4EFE6] border border-stone-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#1B4332] mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-stone-950">
              Vind NG Kerk Bethlehem-Wes op Google Maps
            </p>
            <p className="text-xs text-stone-600 mt-0.5">{address}</p>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap shrink-0"
        >
          Maak oop in Google Maps
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <APIProvider apiKey={MAPS_API_KEY} language="af" region="ZA">
      <InteractiveChurchMap mapsUrl={mapsUrl} fallbackAddress={address} />
    </APIProvider>
  );
}
