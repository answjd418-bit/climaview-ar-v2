"use strict";


/* =========================================================
   DOM
========================================================= */

const scene =
  document.getElementById("scene");

const cameraFeed =
  document.getElementById("camera-feed");

const cameraStartButton =
  document.getElementById(
    "camera-start-button"
  );

const yearButtons =
  document.querySelectorAll(
    ".year[data-year]"
  );

const climateOptions =
  document.querySelectorAll(
    ".climate-option"
  );


const infoCard =
  document.getElementById(
    "info-card"
  );

const infoTitle =
  document.getElementById(
    "info-title"
  );

const riskName =
  document.getElementById(
    "risk-name"
  );

const riskValue =
  document.getElementById(
    "risk-value"
  );

const riskUnit =
  document.getElementById(
    "risk-unit"
  );

const riskCaption =
  document.getElementById(
    "risk-caption"
  );


const metricOneLabel =
  document.getElementById(
    "metric-one-label"
  );

const metricOneValue =
  document.getElementById(
    "metric-one-value"
  );

const metricTwoLabel =
  document.getElementById(
    "metric-two-label"
  );

const metricTwoValue =
  document.getElementById(
    "metric-two-value"
  );

const warningArea =
  document.getElementById(
    "warning-area"
  );


const metricOneIcon =
  document.getElementById(
    "metric-one-icon"
  );

const metricTwoIcon =
  document.getElementById(
    "metric-two-icon"
  );

const warningAreaIcon =
  document.getElementById(
    "warning-area-icon"
  );


/* 그래프 */

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

const chartArea =
  document.getElementById(
    "chart-area"
  );

const chartRiskArea =
  document.getElementById(
    "chart-risk-area"
  );


/* 지도 */

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


/* 경고 팝업 */

const dangerAlert =
  document.getElementById(
    "danger-alert"
  );

const dangerAlertMessage =
  document.getElementById(
    "danger-alert-message"
  );

const dangerAlertConfirm =
  document.getElementById(
    "danger-alert-confirm"
  );

const dangerAlertButtonText =
  document.getElementById(
    "danger-alert-button-text"
  );


/* =========================================================
   SVG 아이콘
========================================================= */

const metricIcons = {

  heatwave: {
    metricOne:
      "./icon_feels_temp.svg",

    metricTwo:
      "./icon_tropical_night.svg"
  },


  tropical: {
    metricOne:
      "./icon_night_temp.svg",

    metricTwo:
      "./icon_sleep.svg"
  },


  flood: {
    metricOne:
      "./icon_flood.svg",

    metricTwo:
      "./icon_heavy_rain.svg"
  },


  wildfire: {
    metricOne:
      "./icon_dryness.svg",

    metricTwo:
      "./icon_dry_wind.svg"
  },


  air: {
    metricOne:
      "./icon_pm25.svg",

    metricTwo:
      "./icon_ozone.svg"
  }

};


const warningIcon =
  "./icon_warning_area.svg";


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
      "카메라 시작 실패:",
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

let locationWatchId =
  null;


/*
  팝업을 이미 본 연도
*/

const shownDangerAlerts =
  new Set();


/*
  위험 경고 기준
*/

const DANGER_LEVEL =
  4;


/* =========================================================
   연도
========================================================= */

const yearProfiles = {

  current: {
    label:
      "현재"
  },

  2030: {
    label:
      "2030년"
  },

  2050: {
    label:
      "2050년"
  },

  2090: {
    label:
      "2090년"
  }

};


/* =========================================================
   기후 위험 데이터
========================================================= */

const climateRiskProfiles = {


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
   위험 단계
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
   환경 보정
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
   환경 탐지
========================================================= */

function detectEnvironment(data) {

  const address =
    data?.address || {};


  const source =
    (
      JSON.stringify(address)
      +
      String(
        data?.category || ""
      )
      +
      String(
        data?.type || ""
      )
    )
    .toLowerCase();


  if (
    source.includes("river") ||
    source.includes("water") ||
    source.includes("stream") ||
    source.includes("canal") ||
    source.includes("하천") ||
    source.includes("강") ||
    source.includes("호수")
  ) {

    return "river";
  }


  if (
    source.includes("forest") ||
    source.includes("mountain") ||
    source.includes("wood") ||
    source.includes("산림") ||
    source.includes("산")
  ) {

    return "forest";
  }


  if (
    source.includes("park") ||
    source.includes("garden") ||
    source.includes("공원")
  ) {

    return "park";
  }


  return "urban";

}


/* =========================================================
   환경 기반 자동 위험
========================================================= */

function selectAutomaticRisk(
  environment
) {

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
   기후 데이터
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
          Math.round(value)
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
   그래프
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

  const values = {

    1:
      112,

    2:
      90,

    3:
      62,

    4:
      30

  };


  return values[level];
}


function updateChart() {

  const profile =
    climateRiskProfiles[
      selectedRisk
    ];


  const points =
    chartYears.map(
      yearKey => {

        const data =
          getClimateData(
            selectedRisk,
            yearKey
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
              data.level
            ),

          level:
            data.level

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


  const path =
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
    path
  );


  chartRiskArea.setAttribute(
    "d",
    path
  );


  points.forEach(
    point => {

      const node =
        document.getElementById(
          `chart-point-${point.year}`
        );


      node.setAttribute(
        "cy",
        point.y
      );

    }
  );


  const selected =
    points.find(
      point =>
        point.year ===
        currentYear
    );


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
   아이콘 업데이트
========================================================= */

function updateMetricIcons() {

  const icons =
    metricIcons[
      selectedRisk
    ];


  if (!icons) {

    return;
  }


  metricOneIcon.src =
    icons.metricOne;


  metricTwoIcon.src =
    icons.metricTwo;


  warningAreaIcon.src =
    warningIcon;

}


/* =========================================================
   정보 카드 업데이트
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


  infoTitle.textContent =
    `${yearLabel} ${currentPlaceName}의 기후위험`;


  riskName.textContent =
    `${data.name} · ${levelText(data.level)}`;


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


  metricOneLabel.textContent =
    data.metricOneLabel;


  if (
    selectedRisk ===
    "heatwave"
  ) {

    metricOneValue.textContent =
      `${Number(data.value).toFixed(1)}°C`;

  }

  else if (
    selectedRisk ===
    "air"
  ) {

    metricOneValue.textContent =
      `${data.value} ㎍/㎥`;

  }

  else if (
    selectedRisk ===
    "tropical"
  ) {

    metricOneValue.textContent =
      `${data.value}일`;

  }

  else {

    metricOneValue.textContent =
      levelText(
        data.level
      );

  }


  metricTwoLabel.textContent =
    data.metricTwoLabel;


  metricTwoValue.textContent =
    data.metricTwoValue;


  warningArea.textContent =
    data.warning;


  updateMetricIcons();

  updateChart();


  document.body.dataset.riskLevel =
    String(
      data.level
    );

}


/* =========================================================
   위험 팝업
========================================================= */

function showDangerAlert(
  yearKey,
  climateData
) {

  const yearLabel =
    yearProfiles[
      yearKey
    ].label;


  dangerAlertMessage.innerHTML =
    `${yearLabel}, 위험 단계가 크게 상승합니다.<br>
    이후 화면에서는 현재 공간 위에 예상 ${climateData.name}<br>
    위험과 위험 정보가 강조되어 표시됩니다.`;


  dangerAlertButtonText.textContent =
    `${yearLabel} 시뮬레이션 보기`;


  dangerAlert.classList.add(
    "show"
  );


  dangerAlert.setAttribute(
    "aria-hidden",
    "false"
  );

}


/* =========================================================
   팝업 확인
========================================================= */

dangerAlertConfirm.addEventListener(
  "click",
  () => {

    dangerAlert.classList.remove(
      "show"
    );


    dangerAlert.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.add(
      "danger-mode"
    );

  }
);


/* =========================================================
   연도 변경
========================================================= */

function changeYear(key) {

  if (
    !yearProfiles[key]
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
        String(selected)
      );

    }
  );


  updateClimateInterface();


  const climateData =
    getClimateData(
      selectedRisk,
      currentYear
    );


  /*
    위험 수준 4 이상
  */

  if (
    climateData &&
    climateData.level >=
    DANGER_LEVEL
  ) {

    /*
      아직 해당 연도 경고를 보지 않았다면
      팝업부터 표시
    */

    if (
      !shownDangerAlerts.has(
        key
      )
    ) {

      document.body.classList.remove(
        "danger-mode"
      );


      showDangerAlert(
        key,
        climateData
      );


      shownDangerAlerts.add(
        key
      );

    }

    else {

      /*
        이미 팝업을 본 연도라면
        즉시 위험 모드
      */

      document.body.classList.add(
        "danger-mode"
      );

    }

  }

  else {

    /*
      위험도가 낮아지면
      danger mode 해제
    */

    document.body.classList.remove(
      "danger-mode"
    );


    dangerAlert.classList.remove(
      "show"
    );

  }

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
   위험 종류 선택
========================================================= */

climateOptions.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

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


        /*
          위험 종류를 바꿀 때도
          현재 연도 위험도를 다시 판단
        */

        updateClimateInterface();


        const climateData =
          getClimateData(
            selectedRisk,
            currentYear
          );


        if (
          climateData.level >=
          DANGER_LEVEL
        ) {

          document.body.classList.add(
            "danger-mode"
          );

        }

        else {

          document.body.classList.remove(
            "danger-mode"
          );

        }

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

        fillColor:
          "#a9d8e7",

        fillOpacity:
          1

      }

    )
    .addTo(
      locationMap
    );

}


/* =========================================================
   지도 위치
========================================================= */

function updateMapPosition(
  latitude,
  longitude,
  accuracy
) {

  const coordinates =
    [
      latitude,
      longitude
    ];


  locationMap.setView(
    coordinates,
    16
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
            .1

        }
      )
      .addTo(
        locationMap
      );

  }

}


/* =========================================================
   역지오코딩
========================================================= */

let lastGeocodeTime =
  0;


async function reverseGeocode(
  latitude,
  longitude
) {

  try {

    const url =
      "https://nominatim.openstreetmap.org/reverse"
      +
      "?format=jsonv2"
      +
      `&lat=${latitude}`
      +
      `&lon=${longitude}`
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
        url
      );


    if (
      !response.ok
    ) {

      return null;
    }


    return await response.json();

  }

  catch (error) {

    console.warn(
      error
    );


    return null;

  }

}


/* =========================================================
   장소명
========================================================= */

function getPlaceName(data) {

  const address =
    data.address || {};


  const namedetails =
    data.namedetails || {};


  return (

    namedetails["name:ko"]

    ||

    namedetails.name

    ||

    address.park

    ||

    address.amenity

    ||

    address.building

    ||

    address.neighbourhood

    ||

    address.road

    ||

    address.city

    ||

    "현재 위치"

  );

}


/* =========================================================
   위치 업데이트
========================================================= */

async function updateReverseGeocode(
  latitude,
  longitude
) {

  const now =
    Date.now();


  if (
    now -
    lastGeocodeTime <
    5000
  ) {

    return;
  }


  lastGeocodeTime =
    now;


  const data =
    await reverseGeocode(
      latitude,
      longitude
    );


  if (!data) {

    return;
  }


  currentPlaceName =
    getPlaceName(
      data
    );


  currentEnvironment =
    detectEnvironment(
      data
    );


  mapLocationName.textContent =
    currentPlaceName;


  mapLocationStatus.textContent =
    data.display_name || "";


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


  updateClimateInterface();

}


/* =========================================================
   GPS
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
      || 20,
      5
    );


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


function handleLocationError(
  error
) {

  console.warn(
    error
  );


  mapLocationName.textContent =
    "현재 위치";


  mapLocationStatus.textContent =
    "위치 정보를 확인할 수 없습니다";

}


function startLocationTracking() {

  initializeLocationMap();


  if (
    !navigator.geolocation
  ) {

    return;
  }


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
   드롭다운
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
          ) !==
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
   종료
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