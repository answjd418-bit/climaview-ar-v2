"use strict";


/* =========================================================
   화면 비율
========================================================= */

const scene =
  document.getElementById(
    "scene"
  );


function fitScene() {

  const scale =
    Math.min(
      window.innerWidth / 1366,
      window.innerHeight / 1024
    );


  scene.style.setProperty(
    "--scene-scale",
    scale
  );


  scene.style.position =
    "absolute";


  scene.style.left =
    `${
      (
        window.innerWidth
        - 1366
      ) / 2
    }px`;


  scene.style.top =
    `${
      (
        window.innerHeight
        - 1024
      ) / 2
    }px`;

}


fitScene();


window.addEventListener(
  "resize",
  fitScene
);



/* =========================================================
   카메라
========================================================= */

const cameraFeed =
  document.getElementById(
    "camera-feed"
  );


const cameraStartButton =
  document.getElementById(
    "camera-start-button"
  );


let cameraStream =
  null;


let cameraStarted =
  false;



async function startCamera() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    console.warn(
      "이 브라우저에서는 카메라 접근을 사용할 수 없습니다."
    );


    cameraStartButton.hidden =
      true;


    return;

  }


  try {

    if (
      cameraStarted &&
      cameraStream
    ) {

      return;

    }


    cameraStream =
      await navigator.mediaDevices.getUserMedia({

        video: {

          facingMode: {
            ideal:
              "environment"
          },


          width: {
            ideal:
              1920
          },


          height: {
            ideal:
              1080
          }

        },


        audio:
          false

      });


    cameraFeed.srcObject =
      cameraStream;


    await cameraFeed.play();


    cameraStarted =
      true;


    cameraStartButton.hidden =
      true;


    console.log(
      "ClimaView 카메라 시작 완료"
    );

  }


  catch (error) {

    console.warn(
      "카메라 자동 시작 실패:",
      error
    );


    cameraStartButton.hidden =
      false;

  }

}



cameraStartButton.addEventListener(
  "click",
  async () => {

    await startCamera();

  }
);


startCamera();



/* =========================================================
   기준 기후 데이터
========================================================= */

const baseClimateData = {


  current: {

    yearLabel:
      "2026년",

    seaLevel:
      0,

    temperature:
      11.7,

    temperatureRise:
      0,

    chartValue:
      0,

    selectedX:
      null,

    selectedY:
      null,

    riskLeft:
      null,

    riskRight:
      null

  },


  2050: {

    yearLabel:
      "2030년",

    seaLevel:
      11.5,

    temperature:
      14.4,

    temperatureRise:
      2.7,

    chartValue:
      11.5,

    selectedX:
      102,

    selectedY:
      104,

    riskLeft:
      58,

    riskRight:
      150

  },


  2075: {

    yearLabel:
      "2050년",

    seaLevel:
      32.2,

    temperature:
      17.2,

    temperatureRise:
      5.5,

    chartValue:
      32.2,

    selectedX:
      224,

    selectedY:
      76,

    riskLeft:
      168,

    riskRight:
      277

  },


  2100: {

    yearLabel:
      "2090년",

    seaLevel:
      96.1,

    temperature:
      18.9,

    temperatureRise:
      7.2,

    chartValue:
      96.1,

    selectedX:
      265,

    selectedY:
      63,

    riskLeft:
      215,

    riskRight:
      310

  }

};



/* =========================================================
   위치별 시뮬레이션 프로필

   미래 수치는 프로토타입용
   시나리오 기반 추정값
========================================================= */

const locationProfiles = {


  banpo: {

    name:
      "반포 한강공원",

    shortName:
      "반포",

    lat:
      37.5107,

    lon:
      126.9959,

    seaFactor:
      1.00,

    tempOffset:
      0,

    impacts: {

      current:
        "없음",

      2050:
        "낮음",

      2075:
        "중간",

      2100:
        "높음"

    },

    warnings: {

      current:
        "해당 없음",

      2050:
        "반포 한강공원 저지대 일대",

      2075:
        "반포 한강공원, 한강 산책로",

      2100:
        "반포 한강공원, 한강변 전역"

    }

  },


  yeouido: {

    name:
      "여의도 한강공원",

    shortName:
      "여의도",

    lat:
      37.5284,

    lon:
      126.9333,

    seaFactor:
      1.06,

    tempOffset:
      0.2,

    impacts: {

      current:
        "없음",

      2050:
        "낮음",

      2075:
        "중간",

      2100:
        "높음"

    },

    warnings: {

      current:
        "해당 없음",

      2050:
        "여의도 수변 산책로 일대",

      2075:
        "여의도 한강공원 저지대",

      2100:
        "여의도 한강공원 수변 전역"

    }

  },


  jamsil: {

    name:
      "잠실 한강공원",

    shortName:
      "잠실",

    lat:
      37.5177,

    lon:
      127.0860,

    seaFactor:
      0.94,

    tempOffset:
      0.1,

    impacts: {

      current:
        "없음",

      2050:
        "낮음",

      2075:
        "중간",

      2100:
        "높음"

    },

    warnings: {

      current:
        "해당 없음",

      2050:
        "잠실 수변 저지대",

      2075:
        "잠실 한강공원 산책로",

      2100:
        "잠실 한강공원 수변 전역"

    }

  },


  mangwon: {

    name:
      "망원 한강공원",

    shortName:
      "망원",

    lat:
      37.5560,

    lon:
      126.8998,

    seaFactor:
      1.03,

    tempOffset:
      0.1,

    impacts: {

      current:
        "없음",

      2050:
        "낮음",

      2075:
        "중간",

      2100:
        "높음"

    },

    warnings: {

      current:
        "해당 없음",

      2050:
        "망원 수변 보행로",

      2075:
        "망원 한강공원 저지대",

      2100:
        "망원 한강공원 수변 전역"

    }

  },


  ttukseom: {

    name:
      "뚝섬 한강공원",

    shortName:
      "뚝섬",

    lat:
      37.5293,

    lon:
      127.0699,

    seaFactor:
      0.97,

    tempOffset:
      0.2,

    impacts: {

      current:
        "없음",

      2050:
        "낮음",

      2075:
        "중간",

      2100:
        "높음"

    },

    warnings: {

      current:
        "해당 없음",

      2050:
        "뚝섬 수변 저지대",

      2075:
        "뚝섬 한강공원 산책로",

      2100:
        "뚝섬 한강공원 수변 전역"

    }

  }

};



/* =========================================================
   현재 상태
========================================================= */

let currentYear =
  "current";


let currentLocationKey =
  "banpo";


let locationWatchId =
  null;


let lastLocationDistance =
  null;



/* =========================================================
   역지오코딩 상태
========================================================= */

let lastGeocodeLatitude =
  null;


let lastGeocodeLongitude =
  null;


let lastGeocodeTime =
  0;


const geocodeCache =
  new Map();



/* =========================================================
   DOM
========================================================= */

const yearButtons =
  document.querySelectorAll(
    ".year[data-year]"
  );


const infoCard =
  document.getElementById(
    "info-card"
  );


const infoTitle =
  document.getElementById(
    "info-title"
  );


const seaLevelValue =
  document.getElementById(
    "sea-level-value"
  );


const waterTemperature =
  document.getElementById(
    "water-temperature"
  );


const floodImpact =
  document.getElementById(
    "flood-impact"
  );


const warningArea =
  document.getElementById(
    "warning-area"
  );


const selectedPoint =
  document.getElementById(
    "chart-selected-point"
  );


const chartValueLabel =
  document.getElementById(
    "chart-value-label"
  );


const chartValueText =
  document.getElementById(
    "chart-value-text"
  );


const riskGradient =
  document.getElementById(
    "risk-gradient"
  );


const mapCard =
  document.getElementById(
    "map-card"
  );


const mapLocationName =
  document.getElementById(
    "map-location-name"
  );


const mapLocationStatus =
  document.getElementById(
    "map-location-status"
  );



/* =========================================================
   Leaflet 지도
========================================================= */

let locationMap =
  null;


let currentLocationMarker =
  null;


let accuracyCircle =
  null;



function initializeLocationMap() {

  if (
    locationMap ||
    !window.L
  ) {

    return;

  }


  locationMap =
    L.map(
      "location-map",
      {

        zoomControl:
          false,

        attributionControl:
          true,

        dragging:
          true,

        scrollWheelZoom:
          false,

        doubleClickZoom:
          true,

        boxZoom:
          false,

        keyboard:
          false,

        tap:
          true

      }
    )
    .setView(
      [
        37.5107,
        126.9959
      ],
      15
    );


  L.tileLayer(

    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

      minZoom:
        3,

      maxZoom:
        19,

      attribution:
        "&copy; OpenStreetMap contributors"

    }

  ).addTo(
    locationMap
  );


  currentLocationMarker =
    L.circleMarker(

      [
        37.5107,
        126.9959
      ],

      {

        radius:
          7,

        color:
          "#ffffff",

        weight:
          3,

        opacity:
          1,

        fillColor:
          "#a9d8e7",

        fillOpacity:
          1,

        className:
          "current-location-marker"

      }

    )
    .addTo(
      locationMap
    );


  setTimeout(
    () => {

      if (
        locationMap
      ) {

        locationMap.invalidateSize();

      }

    },
    100
  );

}



/* =========================================================
   숫자 유틸
========================================================= */

function roundToOne(
  value
) {

  return (
    Math.round(
      value * 10
    ) / 10
  );

}



/* =========================================================
   거리 계산
   단위 km
========================================================= */

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const earthRadius =
    6371;


  const toRadians =
    (degrees) =>
      degrees
      *
      Math.PI
      /
      180;


  const deltaLat =
    toRadians(
      lat2 - lat1
    );


  const deltaLon =
    toRadians(
      lon2 - lon1
    );


  const latitude1 =
    toRadians(
      lat1
    );


  const latitude2 =
    toRadians(
      lat2
    );


  const a =
    Math.sin(
      deltaLat / 2
    ) ** 2
    +
    Math.cos(
      latitude1
    )
    *
    Math.cos(
      latitude2
    )
    *
    Math.sin(
      deltaLon / 2
    ) ** 2;


  const c =
    2
    *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return (
    earthRadius
    *
    c
  );

}



/* =========================================================
   가장 가까운 지원 한강공원
   기후 데이터 계산용
========================================================= */

function findNearestLocation(
  latitude,
  longitude
) {

  let nearestKey =
    "banpo";


  let nearestDistance =
    Infinity;


  Object.entries(
    locationProfiles
  ).forEach(
    ([key, location]) => {

      const distance =
        calculateDistance(

          latitude,
          longitude,

          location.lat,
          location.lon

        );


      if (
        distance <
        nearestDistance
      ) {

        nearestDistance =
          distance;


        nearestKey =
          key;

      }

    }
  );


  return {

    key:
      nearestKey,

    distance:
      nearestDistance

  };

}



/* =========================================================
   기후 데이터 계산
========================================================= */

function getClimateData(
  yearKey,
  locationKey
) {

  const base =
    baseClimateData[
      yearKey
    ];


  const location =
    locationProfiles[
      locationKey
    ];


  if (
    !base ||
    !location
  ) {

    return null;

  }


  const seaLevel =
    yearKey === "current"
      ? 0
      : roundToOne(
          base.seaLevel
          *
          location.seaFactor
        );


  const temperature =
    roundToOne(
      base.temperature
      +
      location.tempOffset
    );


  return {

    title:
      `${base.yearLabel} ${location.shortName}의 한강`,

    seaLevel:
      seaLevel,

    temperature:
      temperature,

    temperatureRise:
      base.temperatureRise,

    floodImpact:
      location.impacts[
        yearKey
      ],

    warningArea:
      location.warnings[
        yearKey
      ],

    chartValue:
      seaLevel,

    selectedX:
      base.selectedX,

    selectedY:
      base.selectedY,

    riskLeft:
      base.riskLeft,

    riskRight:
      base.riskRight

  };

}



/* =========================================================
   지도 위치 이동
========================================================= */

function updateMapPosition(
  latitude,
  longitude,
  accuracy
) {

  if (
    !locationMap ||
    !currentLocationMarker
  ) {

    return;

  }


  const coordinates =
    [
      latitude,
      longitude
    ];


  locationMap.setView(

    coordinates,

    16,

    {

      animate:
        true,

      duration:
        0.6

    }

  );


  currentLocationMarker.setLatLng(
    coordinates
  );


  if (
    accuracyCircle
  ) {

    accuracyCircle.setLatLng(
      coordinates
    );


    accuracyCircle.setRadius(
      accuracy
    );

  }

  else {

    accuracyCircle =
      L.circle(

        coordinates,

        {

          radius:
            accuracy,

          color:
            "#ffffff",

          weight:
            1,

          opacity:
            .4,

          fillColor:
            "#a9d8e7",

          fillOpacity:
            .10,

          interactive:
            false

        }

      )
      .addTo(
        locationMap
      );

  }

}



/* =========================================================
   주소 가공
========================================================= */

function buildReadableAddress(
  data
) {

  const address =
    data.address || {};


  const region =
    address.state
    ||
    address.city
    ||
    address.province
    ||
    "";


  const district =
    address.city_district
    ||
    address.borough
    ||
    address.county
    ||
    "";


  const neighbourhood =
    address.suburb
    ||
    address.quarter
    ||
    address.neighbourhood
    ||
    address.town
    ||
    address.village
    ||
    "";


  const road =
    address.road
    ||
    address.pedestrian
    ||
    address.path
    ||
    "";


  const pieces =
    [
      region,
      district,
      neighbourhood,
      road
    ]
    .filter(
      (value, index, array) =>
        value
        &&
        array.indexOf(value)
          === index
    );


  if (
    pieces.length > 0
  ) {

    return pieces
      .slice(
        0,
        3
      )
      .join(
        " "
      );

  }


  if (
    data.display_name
  ) {

    return data.display_name
      .split(",")
      .slice(0, 3)
      .join(",")
      .trim();

  }


  return "현재 위치";

}



/* =========================================================
   실제 장소명 선택
========================================================= */

function getPlaceName(
  data
) {

  const address =
    data.address || {};


  const namedetails =
    data.namedetails || {};


  /*
   * 실제 POI / 공원 / 시설명 우선
   */

  const placeName =
    namedetails["name:ko"]
    ||
    namedetails.name
    ||
    address.park
    ||
    address.leisure
    ||
    address.amenity
    ||
    address.attraction
    ||
    address.building
    ||
    address.neighbourhood
    ||
    address.quarter
    ||
    address.suburb
    ||
    address.road
    ||
    address.village
    ||
    address.town
    ||
    address.city_district
    ||
    address.city
    ||
    "현재 위치";


  return placeName;

}



/* =========================================================
   역지오코딩
   OpenStreetMap Nominatim
========================================================= */

async function reverseGeocode(
  latitude,
  longitude
) {

  /*
   * 약 100m 단위로 캐시
   */

  const cacheKey =
    `${latitude.toFixed(3)},${longitude.toFixed(3)}`;


  if (
    geocodeCache.has(
      cacheKey
    )
  ) {

    return geocodeCache.get(
      cacheKey
    );

  }


  try {

    const url =
      "https://nominatim.openstreetmap.org/reverse"
      +
      "?format=jsonv2"
      +
      `&lat=${encodeURIComponent(latitude)}`
      +
      `&lon=${encodeURIComponent(longitude)}`
      +
      "&zoom=18"
      +
      "&addressdetails=1"
      +
      "&namedetails=1"
      +
      "&accept-language=ko";


    const response =
      await fetch(
        url,
        {

          headers: {

            Accept:
              "application/json"

          }

        }
      );


    if (
      !response.ok
    ) {

      throw new Error(
        `Reverse geocoding error: ${response.status}`
      );

    }


    const data =
      await response.json();


    const result = {

      placeName:
        getPlaceName(
          data
        ),

      address:
        buildReadableAddress(
          data
        )

    };


    geocodeCache.set(
      cacheKey,
      result
    );


    return result;

  }


  catch (error) {

    console.warn(
      "주소 조회 실패:",
      error
    );


    return null;

  }

}



/* =========================================================
   주소 / 장소명 업데이트

   너무 자주 호출하지 않도록 제한
========================================================= */

async function updateReverseGeocode(
  latitude,
  longitude
) {

  const now =
    Date.now();


  /*
   * 5초 이내 반복 요청 방지
   */

  if (
    now
    -
    lastGeocodeTime
    <
    5000
  ) {

    return;

  }


  /*
   * 이전 역지오코딩 지점에서
   * 약 100m 이상 이동했을 때만 갱신
   */

  if (
    lastGeocodeLatitude !== null &&
    lastGeocodeLongitude !== null
  ) {

    const movedDistance =
      calculateDistance(

        lastGeocodeLatitude,
        lastGeocodeLongitude,

        latitude,
        longitude

      );


    if (
      movedDistance <
      0.10
    ) {

      return;

    }

  }


  lastGeocodeTime =
    now;


  lastGeocodeLatitude =
    latitude;


  lastGeocodeLongitude =
    longitude;


  /*
   * 실제 주소 검색 중
   */

  mapLocationStatus.textContent =
    "현재 위치 확인 중...";


  const locationResult =
    await reverseGeocode(
      latitude,
      longitude
    );


  if (
    !locationResult
  ) {

    mapLocationStatus.textContent =
      "GPS 위치 사용 중";


    return;

  }


  /*
   * 큰 텍스트:
   * 실제 GPS 기반 장소명
   */

  mapLocationName.textContent =
    locationResult.placeName;


  /*
   * 작은 텍스트:
   * 실제 GPS 기반 주소
   */

  mapLocationStatus.textContent =
    locationResult.address;


  mapCard.setAttribute(
    "aria-label",
    `${locationResult.placeName} 현재 위치`
  );

}



/* =========================================================
   위치 카드 초기 상태

   중요:
   등록된 한강공원 이름으로
   큰 텍스트를 덮어쓰지 않는다.
========================================================= */

function updateLocationCard(
  locationKey,
  distance
) {

  if (
    lastGeocodeLatitude === null
  ) {

    mapLocationName.textContent =
      "위치 확인 중";


    mapLocationStatus.textContent =
      "GPS 연결 중...";

  }


  mapCard.setAttribute(
    "aria-label",
    "GPS 기반 현재 위치"
  );

}



/* =========================================================
   오른쪽 기후 정보 갱신
========================================================= */

function updateClimateInterface() {

  const data =
    getClimateData(
      currentYear,
      currentLocationKey
    );


  if (
    !data
  ) {

    return;

  }


  infoTitle.textContent =
    data.title;


  seaLevelValue.textContent =
    data.seaLevel === 0
      ? "+0"
      : `+${data.seaLevel.toFixed(1)}`;


  if (
    currentYear === "current"
  ) {

    waterTemperature.textContent =
      `${data.temperature.toFixed(1)}°C`;

  }

  else {

    waterTemperature.textContent =
      `${data.temperature.toFixed(1)}°C  (약 ${data.temperatureRise.toFixed(1)}°C 상승)`;

  }


  floodImpact.textContent =
    data.floodImpact;


  warningArea.textContent =
    data.warningArea;


  infoCard.setAttribute(
    "aria-label",
    `${data.title} 기후 정보`
  );


  /*
   * 현재
   */

  if (
    currentYear === "current"
  ) {

    selectedPoint.style.display =
      "none";


    chartValueLabel.style.opacity =
      "0";


    return;

  }


  /*
   * 미래 연도
   */

  selectedPoint.style.display =
    "block";


  selectedPoint.setAttribute(
    "cx",
    data.selectedX
  );


  selectedPoint.setAttribute(
    "cy",
    data.selectedY
  );


  chartValueText.textContent =
    `+${data.chartValue.toFixed(1)} cm`;


  chartValueLabel.style.opacity =
    "1";


  chartValueLabel.setAttribute(
    "transform",
    `translate(${data.selectedX} ${data.selectedY - 8})`
  );


  riskGradient.setAttribute(
    "x1",
    data.riskLeft
  );


  riskGradient.setAttribute(
    "x2",
    data.riskRight
  );

}



/* =========================================================
   연도 변경
========================================================= */

function changeYear(
  key
) {

  if (
    !baseClimateData[
      key
    ]
  ) {

    return;

  }


  currentYear =
    key;


  document.body.dataset.year =
    key;


  if (
    !cameraStarted
  ) {

    startCamera();

  }


  yearButtons.forEach(
    (button) => {

      const selected =
        button.dataset.year
        ===
        key;


      button.classList.toggle(
        "selected",
        selected
      );


      button.setAttribute(
        "aria-pressed",
        String(
          selected
        )
      );

    }
  );


  updateClimateInterface();

}



/* =========================================================
   연도 버튼
========================================================= */

yearButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        changeYear(
          button.dataset.year
        );

      }
    );

  }
);



/* =========================================================
   GPS 성공
========================================================= */

function handleLocationSuccess(
  position
) {

  const latitude =
    position.coords.latitude;


  const longitude =
    position.coords.longitude;


  const accuracy =
    Math.max(
      position.coords.accuracy || 20,
      5
    );


  /*
   * 실제 지도 이동
   */

  updateMapPosition(
    latitude,
    longitude,
    accuracy
  );


  /*
   * 기후 데이터 계산용으로
   * 가장 가까운 한강공원 선택
   */

  const nearest =
    findNearestLocation(
      latitude,
      longitude
    );


  const locationChanged =
    nearest.key
    !==
    currentLocationKey;


  currentLocationKey =
    nearest.key;


  lastLocationDistance =
    nearest.distance;


  /*
   * 여기서는 큰 텍스트를
   * 한강공원 이름으로 덮어쓰지 않는다.
   */

  updateLocationCard(
    currentLocationKey,
    lastLocationDistance
  );


  /*
   * 실제 GPS 장소명 / 주소 업데이트
   */

  updateReverseGeocode(
    latitude,
    longitude
  );


  /*
   * 기후정보 갱신
   */

  if (
    locationChanged
  ) {

    console.log(
      "ClimaView 기후 데이터 기준 위치 변경:",
      locationProfiles[
        currentLocationKey
      ].name
    );

  }


  updateClimateInterface();

}



/* =========================================================
   GPS 오류
========================================================= */

function handleLocationError(
  error
) {

  console.warn(
    "ClimaView 위치 확인 실패:",
    error
  );


  currentLocationKey =
    "banpo";


  lastLocationDistance =
    null;


  if (
    error.code === 1
  ) {

    mapLocationName.textContent =
      "위치 권한 필요";


    mapLocationStatus.textContent =
      "브라우저 위치 권한을 허용해주세요";

  }

  else if (
    error.code === 2
  ) {

    mapLocationName.textContent =
      "위치 확인 불가";


    mapLocationStatus.textContent =
      "현재 GPS 위치를 확인할 수 없습니다";

  }

  else if (
    error.code === 3
  ) {

    mapLocationName.textContent =
      "위치 확인 지연";


    mapLocationStatus.textContent =
      "GPS 응답을 기다리는 중입니다";

  }

  else {

    mapLocationName.textContent =
      "현재 위치";


    mapLocationStatus.textContent =
      "위치 정보 없음";

  }


  updateClimateInterface();

}



/* =========================================================
   GPS 추적 시작
========================================================= */

function startLocationTracking() {

  initializeLocationMap();


  if (
    !navigator.geolocation
  ) {

    console.warn(
      "이 브라우저에서는 위치 기능을 사용할 수 없습니다."
    );


    mapLocationName.textContent =
      "위치 기능 미지원";


    mapLocationStatus.textContent =
      "GPS를 사용할 수 없습니다";


    updateClimateInterface();


    return;

  }


  mapLocationName.textContent =
    "위치 확인 중";


  mapLocationStatus.textContent =
    "GPS 연결 중...";


  locationWatchId =
    navigator.geolocation.watchPosition(

      handleLocationSuccess,

      handleLocationError,

      {

        enableHighAccuracy:
          true,

        maximumAge:
          5000,

        timeout:
          15000

      }

    );

}



/* =========================================================
   페이지 종료 시 GPS 추적 종료
========================================================= */

window.addEventListener(
  "pagehide",
  () => {

    if (
      locationWatchId !== null &&
      navigator.geolocation
    ) {

      navigator.geolocation.clearWatch(
        locationWatchId
      );


      locationWatchId =
        null;

    }

  }
);



/* =========================================================
   메뉴
========================================================= */

const menuButtons =
  document.querySelectorAll(
    ".menu[aria-controls]"
  );


function closeMenu(
  button
) {

  const panel =
    document.getElementById(
      button.getAttribute(
        "aria-controls"
      )
    );


  if (
    !panel
  ) {

    return;

  }


  button.setAttribute(
    "aria-expanded",
    "false"
  );


  panel.classList.remove(
    "open"
  );


  panel.setAttribute(
    "aria-hidden",
    "true"
  );

}



menuButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const shouldOpen =
          button.getAttribute(
            "aria-expanded"
          )
          !==
          "true";


        menuButtons.forEach(
          closeMenu
        );


        if (
          !shouldOpen
        ) {

          return;

        }


        const panel =
          document.getElementById(
            button.getAttribute(
              "aria-controls"
            )
          );


        if (
          !panel
        ) {

          return;

        }


        button.setAttribute(
          "aria-expanded",
          "true"
        );


        panel.classList.add(
          "open"
        );


        panel.setAttribute(
          "aria-hidden",
          "false"
        );

      }
    );

  }
);



/* =========================================================
   초기 실행
========================================================= */

changeYear(
  "current"
);


initializeLocationMap();


updateLocationCard(
  currentLocationKey,
  null
);


startLocationTracking();