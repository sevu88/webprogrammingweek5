import "./styles.css";

import L from "leaflet";

let positivemoving;
let negativemoving;

const fetchData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const res = await fetch(url);
  const data = await res.json();

  console.log(data);

  const positiveurl =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const positiveveres = await fetch(positiveurl);
  const positivedata = await positiveveres.json();

  positivemoving = positivedata.dataset;

  const negativeurl =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  const negativeveres = await fetch(negativeurl);
  const negativedata = await negativeveres.json();

  negativemoving = negativedata.dataset;

  createmap(data);
};

const createmap = (data) => {
  let map = L.map("map", {
    minZoom: -3
  });

  let geoJSOn = L.geoJSON(data, {
    onEachFeature: getallnames,
    style: getstyles
  }).addTo(map);

  let openstreetmap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }
  ).addTo(map);

  map.fitBounds(geoJSOn.getBounds());
};

const getallnames = async (feature, layer, index) => {
  if (!feature.id) return;
  const id = feature.properties.kunta;
  const idkunta = "KU" + id;
  const indexi = positivemoving.dimension.Tuloalue.category.index[idkunta];
  const cname = feature.properties.name;
  const positivevalue = positivemoving.value[indexi];
  const negativevalue = negativemoving.value[indexi];

  layer.bindPopup(
    `<ul>
        <li>Name: ${cname} </li>
        <li>Positive migration: ${positivevalue}</li>
        <li>Negative migration: ${negativevalue}</li>
    </ul>
  `
  );
  layer.bindTooltip(cname);
};

const getstyles = (feature) => {
  if (!feature.id) return;
  const id = feature.properties.kunta;
  const idkunta = "KU" + id;
  const indexi = positivemoving.dimension.Tuloalue.category.index[idkunta];
  const positivevalue = positivemoving.value[indexi];
  const negativevalue = negativemoving.value[indexi];

  const hue = (positivevalue / negativevalue) ** 3 * 60;
  if (hue > 120)
    return {
      weight: 2
    };
  return {
    weight: 2,
    color: `hsl(${hue}, 75%,50%)`
  };
};

fetchData();
