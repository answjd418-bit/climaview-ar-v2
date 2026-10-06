"use strict";


/* =========================================================
   기본 DOM
========================================================= */

const scene =
  document.getElementById("scene");

const cameraFeed =
  document.getElementById("camera-feed");

const cameraStartButton =
  document.getElementById("camera-start-button");

const yearButtons =
  document.querySelectorAll(".year[data-year]");

const climateOptions =
  document.querySelectorAll(".climate-option");

const infoCard =
  document.getElementById("info-card");

const infoTitle =
  document.getElementById("info-title");

const riskName =
  document.getElementById("risk-name");

const riskValue =
  document.getElementById("risk-value");

const riskUnit =
  document.getElementById("risk-unit");

const riskCaption =
  document.getElementById("risk-caption");

const metricOneLabel =
  document.getElementById("metric-one-label");

const metricOneValue =
  document.getElementById("metric-one-value");

const metricTwoLabel =
  document.getElementById("metric-two-label");

const metricTwoValue =
  document.getElementById("metric-two-value");

const warningArea =
  document.getElementById("warning-area");


/* 새 PNG 아이콘 */

const metricOneIcon =
  document.getElementById("metric-one-icon");

const metricTwoIcon =
  document.getElementById("metric-two-icon");

const warningAreaIcon =
  document.getElementById("warning-area-icon");


/* 그래프 */

const selectedPoint =
  document.getElementById("chart-selected-point");

const chartValueLabel =
  document.getElementById("chart-value-label");

const chartValueText =
  document.getElementById("chart-value-text");

const riskGradient =
  document.getElementById("risk-gradient");

const chartArea =
  document.getElementById("chart-area");

const chartRiskArea =
  document.getElementById("chart-risk-area");


/* 지도 */

const mapCard =
  document.getElementById("map-card");

const mapLocationName =
  document.getElementById("map-location-name");

const mapLocationStatus =
  document.getElementById("map-location-status");


/* =========================================================
   카드 하단 PNG 아이콘 파일
========================================================= */

const metricIcons = {

  /* 폭염 */
  heatwave: {
    metricOne:
      "./icon_feels_temp.png",

    metricTwo:
      "./icon_tropical_night.png"
  },


  /* 열대야 */
  tropical: {
    metricOne:
      "./icon_night_temp.png",

    metricTwo:
      "./icon_sleep.png"
  },


  /* 침수 */
  flood: {
    metricOne:
      "./icon_flood.png",

    metricTwo:
      "./icon_heavy_rain.png"
  },


  /* 산불 */
  wildfire: {
    metricOne:
      "./icon_dryness.png",

    metricTwo:
      "./icon_dry_wind.png"
  },


  /* 대기질 */
  air: {
    metricOne:
      "./icon_pm25.png",

    metricTwo:
      "./icon_ozone.png"
  }

};


const warningIcon =
  "./icon_warning_area.png";


/* =========================================================
   화면 비율
========================================================= */

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
      "카메라 접근을 사용할 수 없습니다."
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
  startCamera
);


startCamera();


/* =========================================================
   상태
========================================================= */

let currentYear =
  "current";

let selectedRisk =
  "heatwave";

let autoRiskMode =
  true;

let currentPlaceName =
  "현재 위치";

let currentAddress =
  "";

let currentEnvironment =
  "urban";

let currentLatitude =
  null;

let currentLongitude =
  null;

let locationWatchId =
  null;


/* =========================================================
   연도 설정
========================================================= */

const yearProfiles = {

  current: {
    label:
      "현재",
    factor:
      0
  },

  2030: {
    label:
      "2030년",
    factor:
      1
  },

  2050: {
    label:
      "2050년",
    factor:
      2
  },

  2090: {
    label:
      "2090년",
    factor:
      3
  }

};


/* =========================================================
   기후 위험 데이터
   MVP / 시나리오 기반 추정값
========================================================= */

const climateRiskProfiles = {


  /* ---------------------------------------------------------
     폭염
  --------------------------------------------------------- */

  heatwave: {

    name:
      "폭염",

    unit:
      "°C",

    caption:
      "현재 위치의 예상 최고 체감온도",

    values: {

      current:
        31.2,

      2030:
        33.4,

      2050:
        35.8,

      2090:
        39.2

    },

    levels: {

      current:
        2,

      2030:
        2,

      2050:
        3,

      2090:
        4

    },

    metricOneLabel:
      "체감온도",

    metricTwoLabel:
      "추가 위험",

    metricTwoValue:
      "열대야",

    warning: {

      urban:
        "도로·광장·그늘이 적은 공간",

      park:
        "그늘이 적은 산책로·광장",

      river:
        "그늘이 적은 수변 보행로",

      forest:
        "개방된 탐방로·주차장"

    }

  },


  /* ---------------------------------------------------------
     열대야
  --------------------------------------------------------- */

  tropical: {

    name:
      "열대야",

    unit:
      "일",

    caption:
      "연간 예상 열대야 발생일수",

    values: {

      current:
        16,

      2030:
        24,

      2050:
        38,

      2090:
        61

    },

    levels: {

      current:
        1,

      2030:
        2,

      2050:
        3,

      2090:
        4

    },

    metricOneLabel:
      "야간 체감",

    metricTwoLabel:
      "추가 위험",

    metricTwoValue:
      "수면환경 악화",

    warning: {

      urban:
        "고밀도 주거지·포장면 밀집 지역",

      park:
        "열이 축적된 광장·보행 공간",

      river:
        "수변 인접 주거·상업 지역",

      forest:
        "저지대 주거지역"

    }

  },


  /* ---------------------------------------------------------
     침수
  --------------------------------------------------------- */

  flood: {

    name:
      "침수",

    unit:
      "%",

    caption:
      "현재 위치의 상대적 침수 위험지수",

    values: {

      current:
        18,

      2030:
        31,

      2050:
        54,

      2090:
        82

    },

    levels: {

      current:
        1,

      2030:
        2,

      2050:
        3,

      2090:
        4

    },

    metricOneLabel:
      "침수 위험",

    metricTwoLabel:
      "추가 위험",

    metricTwoValue:
      "집중호우",

    warning: {

      urban:
        "저지대 도로·지하공간",

      park:
        "저지대 공원·배수 취약 구간",

      river:
        "하천변·수변 산책로",

      forest:
        "계곡·하천 인접 저지대"

    }

  },


  /* ---------------------------------------------------------
     산불
  --------------------------------------------------------- */

  wildfire: {

    name:
      "산불",

    unit:
      "단계",

    caption:
      "현재 위치의 산불기상 위험도",

    values: {

      current:
        1,

      2030:
        2,

      2050:
        3,

      2090:
        4

    },

    levels: {

      current:
        1,

      2030:
        2,

      2050:
        3,

      2090:
        4

    },

    metricOneLabel:
      "건조 위험",

    metricTwoLabel:
      "추가 위험",

    metricTwoValue:
      "강풍·건조",

    warning: {

      urban:
        "도시 외곽 산림 인접 지역",

      park:
        "수목 밀집 공원",

      river:
        "하천변 초지·수풀",

      forest:
        "산림 탐방로·능선 주변"

    }

  },


  /* ---------------------------------------------------------
     대기질
  --------------------------------------------------------- */

  air: {

    name:
      "대기질",

    unit:
      "㎍/㎥",

    caption:
      "예상 초미세먼지 PM2.5 농도",

    values: {

      current:
        21,

      2030:
        24,

      2050:
        29,

      2090:
        35

    },

    levels: {

      current:
        1,

      2030:
        2,

      2050:
        2,

      2090:
        3

    },

    metricOneLabel:
      "PM2.5",

    metricTwoLabel:
      "추가 위험",

    metricTwoValue:
      "오존",

    warning: {

      urban:
        "교통량 많은 도로·교차로",

      park:
        "대형도로 인접 공원",

      river:
        "교량·간선도로 인접 수변",

      forest:
        "도시 외곽 오염 유입 구간"

    }

  }

};


/* =========================================================
   위험 등급
========================================================= */

function levelText(level) {

  if (
    level <= 1
  ) {

    return "낮음";
  }


  if (
    level === 2
  ) {

    return "보통";
  }


  if (
    level === 3
  ) {

    return "높음";
  }


  return "매우 높음";

}


/* =========================================================
   환경별 수치 보정
========================================================= */

function environmentOffset(
  riskKey,
  environment
) {

  const table = {


    heatwave: {

      urban:
        1.3,

      park:
        -0.7,

      river:
        -0.4,

      forest:
        -1.1

    },


    tropical: {

      urban:
        5,

      park:
        -1,

      river:
        -2,

      forest:
        -3

    },


    flood: {

      urban:
        5,

      park:
        7,

      river:
        14,

      forest:
        3

    },


    wildfire: {

      urban:
        0,

      park:
        0.5,

      river:
        0,

      forest:
        1

    },


    air: {

      urban:
        5,

      park:
        -3,

      river:
        -2,

      forest:
        -4

    }

  };


  return (
    table[riskKey]?.[environment]
    || 0
  );

}


/* =========================================================
   현재 장소 환경 판단
========================================================= */

function detectEnvironment(data) {

  const address =
    data?.address || {};


  const category =
    String(
      data?.category || ""
    ).toLowerCase();


  const type =
    String(
      data?.type || ""
    ).toLowerCase();


  const source =
    (
      JSON.stringify(address)
      +
      category
      +
      type
    ).toLowerCase();


  /* 강 / 바다 / 수변 */

  if (
    source.includes("river") ||
    source.includes("water") ||
    source.includes("stream") ||
    source.includes("canal") ||
    source.includes("beach") ||
    source.includes("하천") ||
    source.includes("강") ||
    source.includes("호수")
  ) {

    return "river";
  }


  /* 산 / 산림 */

  if (
    source.includes("forest") ||
    source.includes("wood") ||
    source.includes("mountain") ||
    source.includes("peak") ||
    source.includes("산림") ||
    source.includes("산")
  ) {

    return "forest";
  }


  /* 공원 */

  if (
    source.includes("park") ||
    source.includes("garden") ||
    source.includes("leisure") ||
    source.includes("공원")
  ) {

    return "park";
  }


  return "urban";

}


/* =========================================================
   위치 환경 기반 대표 위험 자동 선택
========================================================= */

function selectAutomaticRisk(environment) {

  if (
    environment ===
    "river"
  ) {

    return "flood";
  }


  if (
    environment ===
    "forest"
  ) {

    return "wildfire";
  }


  return "heatwave";

}


/* =========================================================
   기후 데이터 생성
========================================================= */

function getClimateData(
  riskKey,
  yearKey
) {

  const profile =
    climateRiskProfiles[
      riskKey
    ];


  if (!profile) {

    return null;
  }


  let value =
    profile.values[
      yearKey
    ];


  value +=
    environmentOffset(
      riskKey,
      currentEnvironment
    );


  if (
    riskKey ===
    "wildfire"
  ) {

    value =
      Math.max(
        1,
        Math.min(
          4,
          Math.round(
            value
          )
        )
      );

  }

  else {

    value =
      Math.max(
        0,
        Math.round(
          value * 10
        ) / 10
      );

  }


  let level =
    profile.levels[
      yearKey
    ];


  if (
    currentEnvironment ===
    "river" &&
    riskKey ===
    "flood"
  ) {

    level += 1;

  }


  if (
    currentEnvironment ===
    "forest" &&
    riskKey ===
    "wildfire"
  ) {

    level += 1;

  }


  level =
    Math.max(
      1,
      Math.min(
        4,
        level
      )
    );


  return {

    riskKey,

    name:
      profile.name,

    unit:
      profile.unit,

    caption:
      profile.caption,

    value,

    level,

    metricOneLabel:
      profile.metricOneLabel,

    metricTwoLabel:
      profile.metricTwoLabel,

    metricTwoValue:
      profile.metricTwoValue,

    warning:
      profile.warning[
        currentEnvironment
      ]
      ||
      profile.warning.urban

  };

}


/* =========================================================
   그래프 좌표
========================================================= */

const chartYears = [
  "current",
  "2030",
  "2050",
  "2090"
];


const chartX = {

  current:
    70,

  2030:
    130,

  2050:
    205,

  2090:
    275

};


function levelToY(level) {

  const map = {

    1:
      112,

    2:
      90,

    3:
      62,

    4:
      30

  };


  return (
    map[level]
    || 112
  );

}


/* =========================================================
   그래프 업데이트
========================================================= */

function updateChart() {

  const profile =
    climateRiskProfiles[
      selectedRisk
    ];


  if (!profile) {

    return;
  }


  const points =
    chartYears.map(
      yearKey => {

        let level =
          profile.levels[
            yearKey
          ];


        if (
          currentEnvironment ===
          "river" &&
          selectedRisk ===
          "flood"
        ) {

          level += 1;
        }


        if (
          currentEnvironment ===
          "forest" &&
          selectedRisk ===
          "wildfire"
        ) {

          level += 1;
        }


        level =
          Math.max(
            1,
            Math.min(
              4,
              level
            )
          );


        return {

          year:
            yearKey,

          x:
            chartX[
              yearKey
            ],

          y:
            levelToY(
              level
            ),

          level

        };

      }
    );


  const [
    p0,
    p1,
    p2,
    p3
  ] =
    points;


  const areaPath =
    `
      M${p0.x} ${p0.y}
      L${p1.x} ${p1.y}
      L${p2.x} ${p2.y}
      L${p3.x} ${p3.y}
      L304 122
      L70 122
      Z
    `;


  chartArea.setAttribute(
    "d",
    areaPath
  );


  chartRiskArea.setAttribute(
    "d",
    areaPath
  );


  document
    .getElementById(
      "chart-point-current"
    )
    .setAttribute(
      "cy",
      p0.y
    );


  document
    .getElementById(
      "chart-point-2030"
    )
    .setAttribute(
      "cy",
      p1.y
    );


  document
    .getElementById(
      "chart-point-2050"
    )
    .setAttribute(
      "cy",
      p2.y
    );


  document
    .getElementById(
      "chart-point-2090"
    )
    .setAttribute(
      "cy",
      p3.y
    );


  const selected =
    points.find(
      point =>
        point.year ===
        currentYear
    );


  if (!selected) {

    return;
  }


  selectedPoint.setAttribute(
    "cx",
    selected.x
  );


  selectedPoint.setAttribute(
    "cy",
    selected.y
  );


  chartValueText.textContent =
    levelText(
      selected.level
    );


  chartValueLabel.setAttribute(
    "transform",
    `translate(${selected.x} ${selected.y - 7})`
  );


  riskGradient.setAttribute(
    "x1",
    Math.max(
      70,
      selected.x - 50
    )
  );


  riskGradient.setAttribute(
    "x2",
    Math.min(
      304,
      selected.x + 50
    )
  );

}


/* =========================================================
   PNG 아이콘 업데이트
========================================================= */

function updateMetricIcons() {

  const iconProfile =
    metricIcons[
      selectedRisk
    ];


  if (!iconProfile) {

    return;
  }


  if (
    metricOneIcon
  ) {

    metricOneIcon.src =
      iconProfile.metricOne;

  }


  if (
    metricTwoIcon
  ) {

    metricTwoIcon.src =
      iconProfile.metricTwo;

  }


  if (
    warningAreaIcon
  ) {

    warningAreaIcon.src =
      warningIcon;

  }

}


/* =========================================================
   오른쪽 카드 업데이트
========================================================= */

function updateClimateInterface() {

  const data =
    getClimateData(
      selectedRisk,
      currentYear
    );


  if (!data) {

    return;
  }


  const yearLabel =
    yearProfiles[
      currentYear
    ].label;


  /* 카드 제목 */

  infoTitle.textContent =
    `${
      yearLabel
    } ${
      currentPlaceName
    }의 기후위험`;


  /* 대표 위험 */

  riskName.textContent =
    `${
      data.name
    } · ${
      levelText(
        data.level
      )
    }`;


  /* 대표 수치 */

  if (
    selectedRisk ===
    "wildfire"
  ) {

    riskValue.textContent =
      levelText(
        data.value
      );


    riskUnit.textContent =
      "";

  }

  else {

    riskValue.textContent =
      Number.isInteger(
        data.value
      )
        ?
        data.value
        :
        data.value.toFixed(
          1
        );


    riskUnit.textContent =
      data.unit;

  }


  riskCaption.textContent =
    data.caption;


  /* 첫 번째 하단 항목 */

  metricOneLabel.textContent =
    data.metricOneLabel;


  if (
    selectedRisk ===
    "heatwave"
  ) {

    metricOneValue.textContent =
      `${
        Number(
          data.value
        ).toFixed(
          1
        )
      }°C`;

  }

  else if (
    selectedRisk ===
    "air"
  ) {

    metricOneValue.textContent =
      `${
        data.value
      } ㎍/㎥`;

  }

  else if (
    selectedRisk ===
    "flood"
  ) {

    metricOneValue.textContent =
      levelText(
        data.level
      );

  }

  else if (
    selectedRisk ===
    "tropical"
  ) {

    metricOneValue.textContent =
      `${
        data.value
      }일`;

  }

  else {

    metricOneValue.textContent =
      levelText(
        data.level
      );

  }


  /* 두 번째 하단 항목 */

  metricTwoLabel.textContent =
    data.metricTwoLabel;


  metricTwoValue.textContent =
    data.metricTwoValue;


  /* 세 번째 하단 항목 */

  warningArea.textContent =
    data.warning;


  /* PNG 아이콘 교체 */

  updateMetricIcons();


  /* 접근성 */

  infoCard.setAttribute(
    "aria-label",
    `${
      currentPlaceName
    } ${
      data.name
    } 기후위험`
  );


  updateChart();

}


/* =========================================================
   연도 변경
========================================================= */

function changeYear(key) {

  if (
    !yearProfiles[
      key
    ]
  ) {

    return;
  }


  currentYear =
    key;


  document.body.dataset.year =
    key;


  yearButtons.forEach(
    button => {

      const selected =
        button.dataset.year ===
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


  if (
    !cameraStarted
  ) {

    startCamera();
  }


  updateClimateInterface();

}


/* =========================================================
   연도 버튼
========================================================= */

yearButtons.forEach(
  button => {

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
   기후 메뉴 선택
========================================================= */

climateOptions.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        /*
          사용자가 직접 선택한 이후에는
          GPS 환경에 따라 자동으로 다른 위험으로
          바뀌지 않게 함
        */

        autoRiskMode =
          false;


        selectedRisk =
          button.dataset.risk;


        climateOptions.forEach(
          item => {

            item.classList.toggle(
              "active",
              item === button
            );

          }
        );


        updateClimateInterface();

      }
    );

  }
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
        37.5665,
        126.9780
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
        37.5665,
        126.9780
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

      locationMap.invalidateSize();

    },
    100
  );

}


/* =========================================================
   지도 위치 갱신
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
            0.4,

          fillColor:
            "#a9d8e7",

          fillOpacity:
            0.10,

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
   역지오코딩 캐시
========================================================= */

const geocodeCache =
  new Map();


let lastGeocodeLatitude =
  null;

let lastGeocodeLongitude =
  null;

let lastGeocodeTime =
  0;


/* =========================================================
   두 좌표 사이 거리
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
    degrees =>
      degrees *
      Math.PI /
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
    earthRadius *
    c
  );

}


/* =========================================================
   주소 문자열 생성
========================================================= */

function buildReadableAddress(data) {

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
      (
        value,
        index,
        array
      ) =>
        value
        &&
        array.indexOf(
          value
        ) === index
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


  return "현재 위치";

}


/* =========================================================
   장소명 선택
========================================================= */

function getPlaceName(data) {

  const address =
    data.address || {};


  const namedetails =
    data.namedetails || {};


  return (

    namedetails[
      "name:ko"
    ]

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

    "현재 위치"

  );

}


/* =========================================================
   Nominatim 역지오코딩
========================================================= */

async function reverseGeocode(
  latitude,
  longitude
) {

  const cacheKey =
    `${
      latitude.toFixed(
        3
      )
    },${
      longitude.toFixed(
        3
      )
    }`;


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
      `&lat=${
        encodeURIComponent(
          latitude
        )
      }`
      +
      `&lon=${
        encodeURIComponent(
          longitude
        )
      }`
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
        `Reverse geocoding error: ${
          response.status
        }`
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
        ),

      environment:
        detectEnvironment(
          data
        ),

      raw:
        data

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
   장소명 / 기후위험 업데이트
========================================================= */

async function updateReverseGeocode(
  latitude,
  longitude
) {

  const now =
    Date.now();


  /*
    Nominatim을 너무 자주 호출하지 않도록
    최소 5초 간격
  */

  if (
    now -
    lastGeocodeTime
    <
    5000
  ) {

    return;
  }


  /*
    약 100m 이상 이동했을 때만
    위치명을 다시 검색
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


  mapLocationStatus.textContent =
    "현재 위치 확인 중...";


  const result =
    await reverseGeocode(
      latitude,
      longitude
    );


  if (
    !result
  ) {

    mapLocationStatus.textContent =
      "GPS 위치 사용 중";

    return;
  }


  currentPlaceName =
    result.placeName;


  currentAddress =
    result.address;


  currentEnvironment =
    result.environment;


  /* 지도 카드 */

  mapLocationName.textContent =
    currentPlaceName;


  mapLocationStatus.textContent =
    currentAddress;


  mapCard.setAttribute(
    "aria-label",
    `${
      currentPlaceName
    } 현재 위치`
  );


  /*
    아직 사용자가 위험 종류를 직접 선택하지 않았다면
    위치 환경에 따라 기본 위험을 자동 선택
  */

  if (
    autoRiskMode
  ) {

    selectedRisk =
      selectAutomaticRisk(
        currentEnvironment
      );


    climateOptions.forEach(
      item => {

        item.classList.toggle(
          "active",
          item.dataset.risk ===
          selectedRisk
        );

      }
    );

  }


  /*
    장소명과 위험도,
    카드 아이콘을 함께 갱신
  */

  updateClimateInterface();

}


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
      position.coords.accuracy
      ||
      20,
      5
    );


  currentLatitude =
    latitude;


  currentLongitude =
    longitude;


  updateMapPosition(
    latitude,
    longitude,
    accuracy
  );


  updateReverseGeocode(
    latitude,
    longitude
  );

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
   GPS 실시간 추적
========================================================= */

function startLocationTracking() {

  initializeLocationMap();


  if (
    !navigator.geolocation
  ) {

    mapLocationName.textContent =
      "위치 기능 미지원";


    mapLocationStatus.textContent =
      "GPS를 사용할 수 없습니다";


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
   드롭다운 메뉴
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
  button => {

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
   페이지 종료 시 GPS 추적 정리
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

    }

  }
);


/* =========================================================
   초기 실행
========================================================= */

initializeLocationMap();

updateClimateInterface();

changeYear(
  "current"
);

startLocationTracking();