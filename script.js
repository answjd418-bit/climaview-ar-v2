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
   기본 기후 데이터
   반포 한강공원을 기준으로 한 프로토타입 데이터

   다른 장소의 미래 값은 위치별 보정계수를 적용해 계산한다.
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
      "2050년",

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
      "2075년",

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
      "2100년",

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
   위치별 프로토타입 데이터

   lat / lon:
   GPS 위치 판별을 위한 대표 중심좌표

   seaFactor:
   반포 기준 해수면 상승값에 적용하는 위치별 보정계수

   tempOffset:
   평균 수온에 적용하는 위치별 보정값

   미래 수치는 실제 관측값이 아닌
   프로토타입용 시나리오 기반 추정값이다.
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
   두 GPS 좌표 사이 거리 계산
   Haversine formula

   반환 단위: km
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
      degrees * Math.PI / 180;


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
    earthRadius * c
  );

}



/* =========================================================
   가장 가까운 지원 장소 찾기
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
   현재 위치 + 연도 기준 데이터 생성
========================================================= */

function getClimateData(
  yearKey,
  locationKey
) {

  const base =
    baseClimateData[yearKey];


  const location =
    locationProfiles[locationKey];


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


  const chartValue =
    seaLevel;


  let title =
    `${base.yearLabel} ${location.shortName}의 한강`;


  return {

    title:
      title,

    seaLevel:
      seaLevel,

    temperature:
      temperature,

    temperatureRise:
      base.temperatureRise,

    floodImpact:
      location.impacts[yearKey],

    warningArea:
      location.warnings[yearKey],

    chartValue:
      chartValue,

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
   위치 카드 갱신
========================================================= */

function updateLocationCard(
  locationKey,
  distance
) {

  const location =
    locationProfiles[
      locationKey
    ];


  if (!location) {
    return;
  }


  mapLocationName.textContent =
    location.name;


  mapCard.setAttribute(
    "aria-label",
    `현재 위치 기준 ${location.name}`
  );


  if (
    typeof distance !== "number"
  ) {

    mapLocationStatus.textContent =
      "기본 위치 기준";

    return;

  }


  if (
    distance < 0.15
  ) {

    mapLocationStatus.textContent =
      "현재 위치와 일치";

  }

  else if (
    distance < 1
  ) {

    mapLocationStatus.textContent =
      `약 ${Math.round(
        distance * 1000
      )}m 거리`;

  }

  else {

    mapLocationStatus.textContent =
      `가장 가까운 지점 · ${distance.toFixed(1)}km`;

  }

}



/* =========================================================
   오른쪽 정보 카드 갱신
========================================================= */

function updateClimateInterface() {

  const data =
    getClimateData(
      currentYear,
      currentLocationKey
    );


  if (!data) {
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


  /* 현재 화면 */

  if (
    currentYear === "current"
  ) {

    selectedPoint.style.display =
      "none";


    chartValueLabel.style.opacity =
      "0";


    return;

  }


  /* 미래 연도 그래프 */

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
    `translate(
      ${data.selectedX}
      ${data.selectedY - 8}
    )`
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
    !baseClimateData[key]
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
        button.dataset.year ===
        key;


      button.classList.toggle(
        "selected",
        selected
      );


      button.setAttribute(
        "aria-pressed",
        String(selected)
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
   실시간 위치 추적 성공
========================================================= */

function handleLocationSuccess(
  position
) {

  const latitude =
    position.coords.latitude;


  const longitude =
    position.coords.longitude;


  const nearest =
    findNearestLocation(
      latitude,
      longitude
    );


  const locationChanged =
    nearest.key !==
    currentLocationKey;


  currentLocationKey =
    nearest.key;


  lastLocationDistance =
    nearest.distance;


  updateLocationCard(
    currentLocationKey,
    lastLocationDistance
  );


  if (
    locationChanged
  ) {

    console.log(
      "ClimaView 위치 변경:",
      locationProfiles[
        currentLocationKey
      ].name
    );

  }


  /*
   * 위치가 갱신될 때마다
   * 현재 선택한 연도의 정보도 다시 계산한다.
   */

  updateClimateInterface();

}



/* =========================================================
   실시간 위치 추적 실패
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


  updateLocationCard(
    currentLocationKey,
    null
  );


  if (
    error.code === 1
  ) {

    mapLocationStatus.textContent =
      "위치 권한 필요 · 반포 기준";

  }

  else if (
    error.code === 2
  ) {

    mapLocationStatus.textContent =
      "위치 확인 불가 · 반포 기준";

  }

  else if (
    error.code === 3
  ) {

    mapLocationStatus.textContent =
      "GPS 응답 지연 · 반포 기준";

  }

  else {

    mapLocationStatus.textContent =
      "반포 기준";

  }


  updateClimateInterface();

}



/* =========================================================
   실시간 위치 추적 시작
========================================================= */

function startLocationTracking() {

  if (
    !navigator.geolocation
  ) {

    console.warn(
      "이 브라우저에서는 위치 기능을 사용할 수 없습니다."
    );


    mapLocationName.textContent =
      "반포 한강공원";


    mapLocationStatus.textContent =
      "위치 기능 미지원 · 반포 기준";


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
          10000,

        timeout:
          15000

      }

    );

}



/* =========================================================
   페이지 종료 시 위치 추적 정리
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


  if (!panel) {
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
          ) !== "true";


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


        if (!panel) {
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
   초기 화면
========================================================= */

changeYear(
  "current"
);


updateLocationCard(
  currentLocationKey,
  null
);


startLocationTracking();