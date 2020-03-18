import React, { useEffect, useRef } from "react";
import { Map, TileLayer } from "react-leaflet";
import L from "leaflet";
import chroma from "chroma-js";
// import * as d3 from "d3";

export default () => {
  const mapRef = useRef();

  useEffect(() => {
    const map = mapRef.current.leafletElement;

    const script = document.createElement("script");
    script.src =
      "https://ihcantabria.github.io/Leaflet.CanvasLayer.Field/dist/leaflet.canvaslayer.field.js";
    script.async = true;
    script.onload = () => loaded(map);

    document.body.appendChild(script);
  }, []);

  const loaded = map => {
    var tiff = "./temp.tif";
    fetch(tiff)
      .then(r => r.arrayBuffer())
      .then(function(buffer) {
        var ndvi = L.ScalarField.fromGeoTIFF(buffer);
        ndvi.params.xllCorner = ndvi.params.xllCorner / 100000;
        ndvi.params.yllCorner = ndvi.params.yllCorner / 100000;
        ndvi.xllCorner = ndvi.xllCorner / 100000;
        ndvi.yllCorner = ndvi.yllCorner / 100000;
        ndvi.xurCorner = ndvi.xurCorner / 100000;
        ndvi.yurCorner = ndvi.yurCorner / 100000;
        ndvi.cellXSize = ndvi.cellXSize / 100000;
        ndvi.cellYSize = ndvi.cellYSize / 100000;
        ndvi.isContinuous = false;
        ndvi.longitudeNeedsToBeWrapped = false;

        let layer = L.canvasLayer
          .scalarField(ndvi, {
            color: chroma.scale("Spectral").domain(ndvi.range.reverse()),
            opacity: 1,
            inFilter: v => v !== 0
          })
          .addTo(map);
        layer.on("click", function(e) {
          if (e.value !== null) {
            let v = e.value.toFixed(2);
            let html = `<span class = "popupText"> Temperature ${v} °C</span>`;
            L.popup()
              .setLatLng(e.latlng)
              .setContent(html)
              .openOn(map);
          }
        });

        map.fitBounds(layer.getBounds());
      });
  };

  return (
    <Map ref={mapRef} zoom={2} style={{ height: "100vh" }}>
      <TileLayer
        url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
    </Map>
  );
};
