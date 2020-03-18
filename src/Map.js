import React, { useEffect, useRef } from "react";
import { Map, TileLayer } from "react-leaflet";
import L from "leaflet";
// import chroma from "chroma-js";
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
    var tiff =
      "https://ihcantabria.github.io/Leaflet.CanvasLayer.Field/data/tz850.tiff";
    fetch(tiff)
      .then(r => r.arrayBuffer())
      .then(function(buffer) {
        var ndvi = L.ScalarField.fromGeoTIFF(buffer);

        let layer = L.canvasLayer
          .scalarField(ndvi, {
            // color: chroma.scale("Spectral").domain(ndvi.range.reverse()),
            opacity: 1,
            inFilter: v => v !== 0
          })
          .addTo(map);
        layer.on("click", function(e) {
          if (e.value !== null) {
            let v = e.value.toFixed(2);
            let html = `<span class = "popupText">  ${v}</span>`;
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
        url="http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
    </Map>
  );
};
