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
/* =========================================================
   폭염 DOM
========================================================= */
const heatwaveCardSection =
  document.getElementById(
    "heatwave-card-section"
  );
const heatwaveChartArea =
  document.getElementById(
    "heatwave-chart-area"
  );
const heatwaveDangerArea =
  document.getElementById(
    "heatwave-danger-area"
  );
  const heatwaveBaseStops = [
    document.getElementById(
      "heatwave-base-stop-1"
    ),
    document.getElementById(
      "heatwave-base-stop-2"
    ),
    document.getElementById(
      "heatwave-base-stop-3"
    ),
    document.getElementById(
      "heatwave-base-stop-4"
    )
  ];
const heatwaveDangerStops = [
  document.getElementById(
    "heatwave-danger-stop-1"
  ),
  document.getElementById(
    "heatwave-danger-stop-2"
  ),
  document.getElementById(
    "heatwave-danger-stop-3"
  ),
  document.getElementById(
    "heatwave-danger-stop-4"
  )
];
const heatwaveSelectedGlow =
  document.getElementById(
    "heatwave-selected-glow"
  );
const heatwaveSelectedPoint =
  document.getElementById(
    "heatwave-selected-point"
  );
const heatwaveImpactTile =
  document.getElementById(
    "heatwave-impact-tile"
  );
const heatwaveImpactValue =
  document.getElementById(
    "heatwave-impact-value"
  );
const heatwaveFeelsTemp =
  document.getElementById(
    "heatwave-feels-temp"
  );
const heatwaveExtraRisk =
  document.getElementById(
    "heatwave-extra-risk"
  );
  /* =========================================================
   열대야 DOM
========================================================= */
const tropicalCardSection =
document.getElementById(
  "tropical-card-section"
);
const tropicalChartArea =
document.getElementById(
  "tropical-chart-area"
);
const tropicalDangerArea =
document.getElementById(
  "tropical-danger-area"
);
const tropicalBaseStops = [
document.getElementById(
  "tropical-base-stop-1"
),
document.getElementById(
  "tropical-base-stop-2"
),
document.getElementById(
  "tropical-base-stop-3"
),
document.getElementById(
  "tropical-base-stop-4"
)
];
const tropicalDangerStops = [
document.getElementById(
  "tropical-danger-stop-1"
),
document.getElementById(
  "tropical-danger-stop-2"
),
document.getElementById(
  "tropical-danger-stop-3"
),
document.getElementById(
  "tropical-danger-stop-4"
)
];
const tropicalSelectedGlow =
document.getElementById(
  "tropical-selected-glow"
);
const tropicalSelectedPoint =
document.getElementById(
  "tropical-selected-point"
);
const tropicalImpactTile =
document.getElementById(
  "tropical-impact-tile"
);
const tropicalImpactValue =
document.getElementById(
  "tropical-impact-value"
);
const tropicalNightTemp =
document.getElementById(
  "tropical-night-temp"
);
const tropicalExtraRisk =
document.getElementById(
  "tropical-extra-risk"
);
/* =========================================================
   침수 DOM
========================================================= */
const floodCardSection =
  document.getElementById(
    "flood-card-section"
  );
const floodImpactTile =
  document.getElementById(
    "flood-impact-tile"
  );
const floodImpactValue =
  document.getElementById(
    "flood-impact-value"
  );
const floodWaterTemp =
  document.getElementById(
    "flood-water-temp"
  );
const floodWarningArea =
  document.getElementById(
    "flood-warning-area"
  );
/* =========================================================
   일반 카드 DOM
========================================================= */
const generalChartSection =
  document.getElementById(
    "general-chart-section"
  );
const generalMetrics =
  document.getElementById(
    "general-metrics"
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
/* 일반 그래프 */
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
const chartArea =
  document.getElementById(
    "chart-area"
  );
/* 지도 */
const mapLocationName =
  document.getElementById(
    "map-location-name"
  );
const mapLocationStatus =
  document.getElementById(
    "map-location-status"
  );
/* 경고 */
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
   화면 Fit
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
let currentEnvironment =
  "urban";
let locationWatchId =
  null;
const shownDangerAlerts =
  new Set();
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
   폭염 데이터
========================================================= */
const heatwaveCardProfiles = {
  current: {
    temperature:
      32.5,
    impact:
      "보통",
    level:
      2,
    feelsTemperature:
      32.5,
    extraRisk:
      "온열질환, 열대야"
  },
  2030: {
    temperature:
      34.7,
    impact:
      "보통",
    level:
      2,
    feelsTemperature:
      34.7,
    extraRisk:
      "온열질환, 열대야"
  },
  2050: {
    temperature:
      37.1,
    impact:
      "높음",
    level:
      3,
    feelsTemperature:
      37.1,
    extraRisk:
      "온열질환, 열대야"
  },
  2090: {
    temperature:
      40.5,
    impact:
      "매우 높음",
    level:
      4,
    feelsTemperature:
      40.5,
    extraRisk:
      "온열질환, 열대야"
  }
};
const heatwaveChartX = {
  current:
    42,
  2030:
    105,
  2050:
    188,
  2090:
    270
};
function heatwaveTemperatureToY(
  temperature
) {
  const minTemperature =
    25;
  const maxTemperature =
    42;
  const top =
    12;
  const bottom =
    124;
  const ratio =
    (
      temperature -
      minTemperature
    )
    /
    (
      maxTemperature -
      minTemperature
    );
  return (
    bottom -
    ratio *
    (
      bottom -
      top
    )
  );
}
/* =========================================================
   침수 데이터
========================================================= */
/* =========================================================
   열대야 데이터
========================================================= */
const tropicalCardProfiles = {
  current: {
    days: 11.3,
    impact: "낮음",
    level: 1,
    nightState: "낮음",
    extraRisk: "수면환경 악화"
  },
  2030: {
    days: 51.2,
    impact: "보통",
    level: 2,
    nightState: "증가",
    extraRisk: "수면환경 악화"
  },
  2050: {
    days: 77.8,
    impact: "높음",
    level: 3,
    nightState: "높음",
    extraRisk: "수면환경 악화"
  },
  2090: {
    days: 101,
    impact: "매우 높음",
    level: 4,
    nightState: "매우 높음",
    extraRisk: "수면환경 악화"
  }
};
const tropicalChartX = {
  current:
    42,
  2030:
    105,
  2050:
    188,
  2090:
    270
};
function tropicalDaysToY(days) {
  const minDays =
    0;
  const maxDays =
    120;
  const top =
    16;
  const bottom =
    124;
  const ratio =
    (
      days -
      minDays
    )
    /
    (
      maxDays -
      minDays
    );
  return (
    bottom -
    ratio *
    (
      bottom -
      top
    )
  );
}
const floodCardProfiles = {
  current: {
    probability:
      23,
    impact:
      "없음",
    level:
      1,
    waterTemperature:
      11.7,
    warningArea:
      "해당 없음"
  },
  2030: {
    probability:
      30,
    impact:
      "보통",
    level:
      2,
    waterTemperature:
      13.2,
    warningArea:
      "해당 없음"
  },
  2050: {
    probability:
      36,
    impact:
      "보통",
    level:
      2,
    waterTemperature:
      14.4,
    warningArea:
      "해당 없음"
  },
  2090: {
    probability:
      79,
    impact:
      "매우 높음",
    level:
      4,
    waterTemperature:
      18.9,
    warningArea:
      "해당 없음"
  }
};
/* =========================================================
   기타 위험 데이터
========================================================= */
const climateRiskProfiles = {
  tropical: {
    name:
      "열대야",
    unit:
      "일",
    caption:
      "연간 예상 열대야 발생일수",
    values: {
      current: 16,
      2030: 24,
      2050: 38,
      2090: 61
    },
    levels: {
      current: 1,
      2030: 2,
      2050: 3,
      2090: 4
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
  wildfire: {
    name:
      "산불",
    unit:
      "단계",
    caption:
      "현재 위치의 산불기상 위험도",
    values: {
      current: 1,
      2030: 2,
      2050: 3,
      2090: 4
    },
    levels: {
      current: 1,
      2030: 2,
      2050: 3,
      2090: 4
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
      current: 21,
      2030: 24,
      2050: 29,
      2090: 35
    },
    levels: {
      current: 1,
      2030: 2,
      2050: 2,
      2090: 3
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
   일반 아이콘
========================================================= */
const metricIcons = {
  tropical: {
    metricOne:
      "./icon_night_temp.svg",
    metricTwo:
      "./icon_sleep.svg"
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
   위험 단계 텍스트
========================================================= */
function levelText(level) {
  if (level <= 1) {
    return "낮음";
  }
  if (level === 2) {
    return "보통";
  }
  if (level === 3) {
    return "높음";
  }
  return "매우 높음";
}
/* =========================================================
   폭염 그래프 위험 색
========================================================= */
function setHeatwaveDangerGradient(yearKey) {
  /* =====================================================
     현재
     선택점이 있는 왼쪽부터 황토색.
     오른쪽으로 갈수록 청록색.
     목표:
     황토 → 베이지 → 청록
  ===================================================== */
  if (yearKey === "current") {
    heatwaveBaseStops[0].setAttribute(
      "offset",
      "0%"
    );
    heatwaveBaseStops[0].setAttribute(
      "stop-color",
      "#D89A43"
    );
    heatwaveBaseStops[1].setAttribute(
      "offset",
      "25%"
    );
    heatwaveBaseStops[1].setAttribute(
      "stop-color",
      "#C7AA69"
    );
    heatwaveBaseStops[2].setAttribute(
      "offset",
      "55%"
    );
    heatwaveBaseStops[2].setAttribute(
      "stop-color",
      "#8AAFB5"
    );
    heatwaveBaseStops[3].setAttribute(
      "offset",
      "100%"
    );
    heatwaveBaseStops[3].setAttribute(
      "stop-color",
      "#58A7C3"
    );
    heatwaveDangerStops.forEach(
      stop => {
        stop.setAttribute(
          "stop-opacity",
          "0"
        );
      }
    );
  }
  /* =====================================================
     2030
     황토색 영역이 두 번째 선택점 쪽으로 이동.
     목표:
     앞쪽도 황토계열 유지
     → 선택점 부근이 가장 황토색
     → 뒤쪽은 청록색
  ===================================================== */
  else if (yearKey === "2030") {
    heatwaveBaseStops[0].setAttribute(
      "offset",
      "0%"
    );
    heatwaveBaseStops[0].setAttribute(
      "stop-color",
      "#B99D65"
    );
    heatwaveBaseStops[1].setAttribute(
      "offset",
      "30%"
    );
    heatwaveBaseStops[1].setAttribute(
      "stop-color",
      "#D79742"
    );
    heatwaveBaseStops[2].setAttribute(
      "offset",
      "57%"
    );
    heatwaveBaseStops[2].setAttribute(
      "stop-color",
      "#91AFAF"
    );
    heatwaveBaseStops[3].setAttribute(
      "offset",
      "100%"
    );
    heatwaveBaseStops[3].setAttribute(
      "stop-color",
      "#58A7C3"
    );
    heatwaveDangerStops.forEach(
      stop => {
        stop.setAttribute(
          "stop-opacity",
          "0"
        );
      }
    );
  }
  /* =====================================================
     2050
     ★ 황토색 완전히 제거
     선택된 2050 지점 주변만 붉게.
     왼쪽과 오른쪽은 회청색.
     목표:
     회청색 → 빨강 → 청록
  ===================================================== */
  else if (yearKey === "2050") {
    heatwaveBaseStops[0].setAttribute(
      "offset",
      "0%"
    );
    heatwaveBaseStops[0].setAttribute(
      "stop-color",
      "#739EAD"
    );
    heatwaveBaseStops[1].setAttribute(
      "offset",
      "38%"
    );
    heatwaveBaseStops[1].setAttribute(
      "stop-color",
      "#8D9EA4"
    );
    heatwaveBaseStops[2].setAttribute(
      "offset",
      "70%"
    );
    heatwaveBaseStops[2].setAttribute(
      "stop-color",
      "#829FAA"
    );
    heatwaveBaseStops[3].setAttribute(
      "offset",
      "100%"
    );
    heatwaveBaseStops[3].setAttribute(
      "stop-color",
      "#58A7C3"
    );
    /* 2050 선택점 중심 빨간 영역 */
    heatwaveDangerStops[0].setAttribute(
      "offset",
      "35%"
    );
    heatwaveDangerStops[0].setAttribute(
      "stop-color",
      "#E85345"
    );
    heatwaveDangerStops[0].setAttribute(
      "stop-opacity",
      "0"
    );
    heatwaveDangerStops[1].setAttribute(
      "offset",
      "50%"
    );
    heatwaveDangerStops[1].setAttribute(
      "stop-color",
      "#F0694B"
    );
    heatwaveDangerStops[1].setAttribute(
      "stop-opacity",
      ".42"
    );
    heatwaveDangerStops[2].setAttribute(
      "offset",
      "58%"
    );
    heatwaveDangerStops[2].setAttribute(
      "stop-color",
      "#E7443E"
    );
    heatwaveDangerStops[2].setAttribute(
      "stop-opacity",
      ".95"
    );
    heatwaveDangerStops[3].setAttribute(
      "offset",
      "76%"
    );
    heatwaveDangerStops[3].setAttribute(
      "stop-color",
      "#E7443E"
    );
    heatwaveDangerStops[3].setAttribute(
      "stop-opacity",
      "0"
    );
  }
  /* =====================================================
     2090
     ★ 황토색 완전히 제거
     앞쪽은 회청색.
     선택된 2090 지점으로 갈수록
     붉은색이 계속 강해짐.
     목표:
     회청색 → 회보라 → 빨강 → 진한 빨강
  ===================================================== */
  else if (yearKey === "2090") {
    heatwaveBaseStops[0].setAttribute(
      "offset",
      "0%"
    );
    heatwaveBaseStops[0].setAttribute(
      "stop-color",
      "#739EAD"
    );
    heatwaveBaseStops[1].setAttribute(
      "offset",
      "36%"
    );
    heatwaveBaseStops[1].setAttribute(
      "stop-color",
      "#89989E"
    );
    heatwaveBaseStops[2].setAttribute(
      "offset",
      "68%"
    );
    heatwaveBaseStops[2].setAttribute(
      "stop-color",
      "#8B7A82"
    );
    heatwaveBaseStops[3].setAttribute(
      "offset",
      "100%"
    );
    heatwaveBaseStops[3].setAttribute(
      "stop-color",
      "#98565A"
    );
    /* 오른쪽으로 갈수록 강해지는 빨강 */
    heatwaveDangerStops[0].setAttribute(
      "offset",
      "30%"
    );
    heatwaveDangerStops[0].setAttribute(
      "stop-color",
      "#E85449"
    );
    heatwaveDangerStops[0].setAttribute(
      "stop-opacity",
      "0"
    );
    heatwaveDangerStops[1].setAttribute(
      "offset",
      "52%"
    );
    heatwaveDangerStops[1].setAttribute(
      "stop-color",
      "#EF604D"
    );
    heatwaveDangerStops[1].setAttribute(
      "stop-opacity",
      ".28"
    );
    heatwaveDangerStops[2].setAttribute(
      "offset",
      "73%"
    );
    heatwaveDangerStops[2].setAttribute(
      "stop-color",
      "#EA443E"
    );
    heatwaveDangerStops[2].setAttribute(
      "stop-opacity",
      ".80"
    );
    heatwaveDangerStops[3].setAttribute(
      "offset",
      "100%"
    );
    heatwaveDangerStops[3].setAttribute(
      "stop-color",
      "#D93439"
    );
    heatwaveDangerStops[3].setAttribute(
      "stop-opacity",
      "1"
    );
  }
}
/* =========================================================
   열대야 그래프 위험 색
========================================================= */
function setTropicalGradient(yearKey) {
  if (yearKey === "current") {
    tropicalBaseStops[0].setAttribute(
      "offset",
      "0%"
    );
    tropicalBaseStops[0].setAttribute(
      "stop-color",
      "#58A7C3"
    );
    tropicalBaseStops[1].setAttribute(
      "offset",
      "32%"
    );
    tropicalBaseStops[1].setAttribute(
      "stop-color",
      "#65AEC4"
    );
    tropicalBaseStops[2].setAttribute(
      "offset",
      "65%"
    );
    tropicalBaseStops[2].setAttribute(
      "stop-color",
      "#70B7C9"
    );
    tropicalBaseStops[3].setAttribute(
      "offset",
      "100%"
    );
    tropicalBaseStops[3].setAttribute(
      "stop-color",
      "#58A7C3"
    );
    tropicalDangerStops.forEach(
      stop => {
        stop.setAttribute(
          "stop-opacity",
          "0"
        );
      }
    );
  }
  else if (yearKey === "2030") {
    tropicalBaseStops[0].setAttribute(
      "offset",
      "0%"
    );
    tropicalBaseStops[0].setAttribute(
      "stop-color",
      "#9AA7A4"
    );
    tropicalBaseStops[1].setAttribute(
      "offset",
      "30%"
    );
    tropicalBaseStops[1].setAttribute(
      "stop-color",
      "#D79742"
    );
    tropicalBaseStops[2].setAttribute(
      "offset",
      "58%"
    );
    tropicalBaseStops[2].setAttribute(
      "stop-color",
      "#91AFAF"
    );
    tropicalBaseStops[3].setAttribute(
      "offset",
      "100%"
    );
    tropicalBaseStops[3].setAttribute(
      "stop-color",
      "#58A7C3"
    );
    tropicalDangerStops.forEach(
      stop => {
        stop.setAttribute(
          "stop-opacity",
          "0"
        );
      }
    );
  }
  else if (yearKey === "2050") {
    tropicalBaseStops[0].setAttribute(
      "offset",
      "0%"
    );
    tropicalBaseStops[0].setAttribute(
      "stop-color",
      "#739EAD"
    );
    tropicalBaseStops[1].setAttribute(
      "offset",
      "38%"
    );
    tropicalBaseStops[1].setAttribute(
      "stop-color",
      "#8D9EA4"
    );
    tropicalBaseStops[2].setAttribute(
      "offset",
      "70%"
    );
    tropicalBaseStops[2].setAttribute(
      "stop-color",
      "#829FAA"
    );
    tropicalBaseStops[3].setAttribute(
      "offset",
      "100%"
    );
    tropicalBaseStops[3].setAttribute(
      "stop-color",
      "#58A7C3"
    );
    tropicalDangerStops[0].setAttribute(
      "offset",
      "35%"
    );
    tropicalDangerStops[0].setAttribute(
      "stop-color",
      "#E85345"
    );
    tropicalDangerStops[0].setAttribute(
      "stop-opacity",
      "0"
    );
    tropicalDangerStops[1].setAttribute(
      "offset",
      "50%"
    );
    tropicalDangerStops[1].setAttribute(
      "stop-color",
      "#F0694B"
    );
    tropicalDangerStops[1].setAttribute(
      "stop-opacity",
      ".42"
    );
    tropicalDangerStops[2].setAttribute(
      "offset",
      "58%"
    );
    tropicalDangerStops[2].setAttribute(
      "stop-color",
      "#E7443E"
    );
    tropicalDangerStops[2].setAttribute(
      "stop-opacity",
      ".95"
    );
    tropicalDangerStops[3].setAttribute(
      "offset",
      "76%"
    );
    tropicalDangerStops[3].setAttribute(
      "stop-color",
      "#E7443E"
    );
    tropicalDangerStops[3].setAttribute(
      "stop-opacity",
      "0"
    );
  }
  else if (yearKey === "2090") {
    tropicalBaseStops[0].setAttribute(
      "offset",
      "0%"
    );
    tropicalBaseStops[0].setAttribute(
      "stop-color",
      "#739EAD"
    );
    tropicalBaseStops[1].setAttribute(
      "offset",
      "36%"
    );
    tropicalBaseStops[1].setAttribute(
      "stop-color",
      "#89989E"
    );
    tropicalBaseStops[2].setAttribute(
      "offset",
      "68%"
    );
    tropicalBaseStops[2].setAttribute(
      "stop-color",
      "#8B7A82"
    );
    tropicalBaseStops[3].setAttribute(
      "offset",
      "100%"
    );
    tropicalBaseStops[3].setAttribute(
      "stop-color",
      "#98565A"
    );
    tropicalDangerStops[0].setAttribute(
      "offset",
      "30%"
    );
    tropicalDangerStops[0].setAttribute(
      "stop-color",
      "#E85449"
    );
    tropicalDangerStops[0].setAttribute(
      "stop-opacity",
      "0"
    );
    tropicalDangerStops[1].setAttribute(
      "offset",
      "52%"
    );
    tropicalDangerStops[1].setAttribute(
      "stop-color",
      "#EF604D"
    );
    tropicalDangerStops[1].setAttribute(
      "stop-opacity",
      ".28"
    );
    tropicalDangerStops[2].setAttribute(
      "offset",
      "73%"
    );
    tropicalDangerStops[2].setAttribute(
      "stop-color",
      "#EA443E"
    );
    tropicalDangerStops[2].setAttribute(
      "stop-opacity",
      ".80"
    );
    tropicalDangerStops[3].setAttribute(
      "offset",
      "100%"
    );
    tropicalDangerStops[3].setAttribute(
      "stop-color",
      "#D93439"
    );
    tropicalDangerStops[3].setAttribute(
      "stop-opacity",
      "1"
    );
  }
}
/* =========================================================
   열대야 그래프
========================================================= */
function updateTropicalChart() {
  const years = [
    "current",
    "2030",
    "2050",
    "2090"
  ];
  const points =
    years.map(
      yearKey => {
        const profile =
          tropicalCardProfiles[
            yearKey
          ];
        return {
          year:
            yearKey,
          x:
            tropicalChartX[
              yearKey
            ],
          y:
            tropicalDaysToY(
              profile.days
            )
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
      L308 124
      L42 124
      Z
    `;
  tropicalChartArea.setAttribute(
    "d",
    path
  );
  tropicalDangerArea.setAttribute(
    "d",
    path
  );
  points.forEach(
    point => {
      const circle =
        document.getElementById(
          `tropical-point-${point.year}`
        );
      if (circle) {
        circle.setAttribute(
          "cy",
          point.y
        );
      }
    }
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
  tropicalSelectedGlow.setAttribute(
    "cx",
    selected.x
  );
  tropicalSelectedGlow.setAttribute(
    "cy",
    selected.y
  );
  tropicalSelectedPoint.setAttribute(
    "cx",
    selected.x
  );
  tropicalSelectedPoint.setAttribute(
    "cy",
    selected.y
  );
  setTropicalGradient(
    currentYear
  );
}
/* =========================================================
   폭염 그래프
========================================================= */
function updateHeatwaveChart() {
  const years = [
    "current",
    "2030",
    "2050",
    "2090"
  ];
  const points =
    years.map(
      yearKey => {
        const profile =
          heatwaveCardProfiles[
            yearKey
          ];
        return {
          year:
            yearKey,
          x:
            heatwaveChartX[
              yearKey
            ],
          y:
            heatwaveTemperatureToY(
              profile.temperature
            )
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
      L308 124
      L42 124
      Z
    `;
  /* 기본 면 */
  heatwaveChartArea.setAttribute(
    "d",
    path
  );
  /* 빨간 위험 면 */
  heatwaveDangerArea.setAttribute(
    "d",
    path
  );
  /* 포인트 위치 */
  points.forEach(
    point => {
      const circle =
        document.getElementById(
          `heatwave-point-${point.year}`
        );
      if (circle) {
        circle.setAttribute(
          "cy",
          point.y
        );
      }
    }
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
  heatwaveSelectedGlow.setAttribute(
    "cx",
    selected.x
  );
  heatwaveSelectedGlow.setAttribute(
    "cy",
    selected.y
  );
  heatwaveSelectedPoint.setAttribute(
    "cx",
    selected.x
  );
  heatwaveSelectedPoint.setAttribute(
    "cy",
    selected.y
  );
  /* 선택 연도에 따른 붉은 영역 */
  setHeatwaveDangerGradient(
    currentYear
  );
}
/* =========================================================
   폭염 카드
========================================================= */
function updateHeatwaveCard() {
  const data =
    heatwaveCardProfiles[
      currentYear
    ];
  const yearLabel =
    yearProfiles[
      currentYear
    ].label;
  infoCard.classList.remove(
    "flood-layout",
    "flood-level-1",
    "flood-level-2",
    "flood-level-3",
    "flood-level-4"
  );
  infoCard.classList.remove(
    "tropical-layout",
"tropical-level-1",
"tropical-level-2",
"tropical-level-3",
"tropical-level-4"
  );
  infoCard.classList.add(
    "heatwave-layout"
  );
  infoCard.classList.remove(
    "heatwave-layout",
    "heatwave-level-1",
    "heatwave-level-2",
    "heatwave-level-3",
    "heatwave-level-4",
    "tropical-layout",
    "tropical-level-1",
    "tropical-level-2",
    "tropical-level-3",
    "tropical-level-4"
  );
  infoCard.classList.add(
    `heatwave-level-${data.level}`
  );
  heatwaveCardSection.hidden =
    false;
  tropicalCardSection.hidden =
    true;
  floodCardSection.hidden =
    true;
  generalChartSection.hidden =
    true;
  generalMetrics.hidden =
    true;
  infoTitle.textContent =
    currentYear ===
    "current"
      ?
      `2026년 ${currentPlaceName}`
      :
      `${yearLabel} ${currentPlaceName}`;
  riskName.textContent =
    "";
  riskValue.textContent =
    data.temperature.toFixed(
      1
    );
  riskUnit.textContent =
    "°C";
  riskCaption.textContent =
    "현재 위치의 예상 최고 온도";
  heatwaveImpactValue.textContent =
    data.impact;
  heatwaveFeelsTemp.textContent =
    `${data.feelsTemperature.toFixed(1)}°C`;
  heatwaveExtraRisk.textContent =
    data.extraRisk;
  heatwaveImpactTile.classList.remove(
    "level-1",
    "level-2",
    "level-3",
    "level-4"
  );
  heatwaveImpactTile.classList.add(
    `level-${data.level}`
  );
  updateHeatwaveChart();
  document.body.dataset.riskLevel =
    String(
      data.level
    );
}
/* =========================================================
   열대야 카드
========================================================= */
function updateTropicalCard() {
  const data =
    tropicalCardProfiles[
      currentYear
    ];
  const yearLabel =
    yearProfiles[
      currentYear
    ].label;
  infoCard.classList.remove(
    "heatwave-layout",
    "heatwave-level-1",
    "heatwave-level-2",
    "heatwave-level-3",
    "heatwave-level-4",
    "flood-layout",
    "flood-level-1",
    "flood-level-2",
    "flood-level-3",
    "flood-level-4",
    "tropical-layout",
    "tropical-level-1",
    "tropical-level-2",
    "tropical-level-3",
    "tropical-level-4"
  );
  infoCard.classList.add(
    "tropical-layout"
  );
  infoCard.classList.add(
    `tropical-level-${data.level}`
  );
  heatwaveCardSection.hidden =
    true;
  floodCardSection.hidden =
    true;
 tropicalCardSection.hidden = false;
  generalChartSection.hidden =
    true;
  generalMetrics.hidden =
    true;
  infoTitle.textContent =
    currentYear ===
    "current"
      ?
      `2026년 ${currentPlaceName}`
      :
      `${yearLabel} ${currentPlaceName}`;
  riskName.textContent =
    "";
  riskValue.textContent =
    Number.isInteger(
      data.days
    )
      ?
      data.days
      :
      data.days.toFixed(1);
  riskUnit.textContent =
    "일";
  riskCaption.textContent =
    "현재 위치의 예상 열대야 발생일수";
  tropicalImpactValue.textContent =
    data.impact;
  /*
    기존처럼 "11.3일", "51.2일"을
    한 번 더 표시하지 않는다.
  */
  tropicalNightTemp.textContent =
    data.nightState;
  tropicalExtraRisk.textContent =
    data.extraRisk;
  tropicalImpactTile.classList.remove(
    "level-1",
    "level-2",
    "level-3",
    "level-4"
  );
  tropicalImpactTile.classList.add(
    `level-${data.level}`
  );
  updateTropicalChart();
  document.body.dataset.riskLevel =
    String(
      data.level
    );
}
/* =========================================================
   침수 카드
========================================================= */
function updateFloodCard() {
  const data =
    floodCardProfiles[
      currentYear
    ];
  const yearLabel =
    yearProfiles[
      currentYear
    ].label;
  infoCard.classList.remove(
    "heatwave-layout",
    "heatwave-level-1",
    "heatwave-level-2",
    "heatwave-level-3",
    "heatwave-level-4",
    "tropical-layout",
    "tropical-level-1",
    "tropical-level-2",
    "tropical-level-3",
    "tropical-level-4"
  );
  infoCard.classList.add(
    "flood-layout"
  );
  infoCard.classList.remove(
    "flood-level-1",
    "flood-level-2",
    "flood-level-3",
    "flood-level-4"
  );
  infoCard.classList.add(
    `flood-level-${data.level}`
  );
  heatwaveCardSection.hidden =
    true;
  tropicalCardSection.hidden =
    true;
  floodCardSection.hidden =
    false;
  generalChartSection.hidden =
    true;
  generalMetrics.hidden =
    true;
  infoTitle.textContent =
    currentYear ===
    "current"
      ?
      `2026년 ${currentPlaceName}`
      :
      `${yearLabel} ${currentPlaceName}`;
  riskName.textContent =
    "";
  riskValue.textContent =
    data.probability;
  riskUnit.textContent =
    "%";
  riskCaption.textContent =
    "현재 위치의 상대적 침수 확률";
  floodImpactValue.textContent =
    data.impact;
  floodWaterTemp.textContent =
    `${data.waterTemperature.toFixed(1)}°C`;
  floodWarningArea.textContent =
    data.warningArea;
  floodImpactTile.classList.remove(
    "level-1",
    "level-2",
    "level-3",
    "level-4"
  );
  floodImpactTile.classList.add(
    `level-${data.level}`
  );
  document.body.dataset.riskLevel =
    String(
      data.level
    );
}
/* =========================================================
   기타 위험
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
  return {
    name:
      profile.name,
    unit:
      profile.unit,
    caption:
      profile.caption,
    value:
      profile.values[
        yearKey
      ],
    level:
      profile.levels[
        yearKey
      ],
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
   일반 그래프
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
  return {
    1:
      112,
    2:
      90,
    3:
      62,
    4:
      30
  }[level];
}
function updateChart() {
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
  points.forEach(
    point => {
      const node =
        document.getElementById(
          `chart-point-${point.year}`
        );
      if (node) {
        node.setAttribute(
          "cy",
          point.y
        );
      }
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
}
/* =========================================================
   일반 카드
========================================================= */
function updateGeneralCard() {
  // Dedicated layouts reuse the existing verified general chart and researched profile data.
  if (selectedRisk === "wildfire" || selectedRisk === "air") {
    infoCard.classList.add(selectedRisk === "wildfire" ? "wildfire-layout" : "air-layout");
    const profile = climateRiskProfiles[selectedRisk];
    const riskLevel = profile && profile.levels ? profile.levels[currentYear] : 1;
    infoCard.classList.add(`${selectedRisk === "wildfire" ? "wildfire" : "air"}-level-${riskLevel}`);
  }
  const data =
    getClimateData(
      selectedRisk,
      currentYear
    );
  if (!data) {
    return;
  }
  infoCard.classList.remove(
    "heatwave-layout",
    "heatwave-level-1",
    "heatwave-level-2",
    "heatwave-level-3",
    "heatwave-level-4",
    "flood-layout",
    "flood-level-1",
    "flood-level-2",
    "flood-level-3",
    "flood-level-4",
    "tropical-layout",
    "tropical-level-1",
    "tropical-level-2",
    "tropical-level-3",
    "tropical-level-4"
  );
  heatwaveCardSection.hidden =
    true;
  floodCardSection.hidden =
    true;
  tropicalCardSection.hidden =
    true;
  generalChartSection.hidden =
    false;
  generalMetrics.hidden =
    false;
  const yearLabel =
    yearProfiles[
      currentYear
    ].label;
  infoTitle.textContent =
    `${yearLabel} ${currentPlaceName}의 기후위험`;
  riskName.textContent =
    `${data.name} · ${levelText(data.level)}`;
  riskValue.textContent =
    data.value;
  riskUnit.textContent =
    data.unit;
  riskCaption.textContent =
    data.caption;
  metricOneLabel.textContent =
    data.metricOneLabel;
  if (
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
  const icons =
    metricIcons[
      selectedRisk
    ];
  if (icons) {
    metricOneIcon.src =
      icons.metricOne;
    metricTwoIcon.src =
      icons.metricTwo;
  }
  warningAreaIcon.src =
    warningIcon;
  updateChart();
  document.body.dataset.riskLevel =
    String(
      data.level
    );
}
/* =========================================================
   전체 카드
========================================================= */
function updateClimateInterface() {
  infoCard.classList.remove("wildfire-layout", "air-layout", "wildfire-level-1", "wildfire-level-2", "wildfire-level-3", "wildfire-level-4", "air-level-1", "air-level-2", "air-level-3", "air-level-4");
  if (
    selectedRisk ===
    "heatwave"
  ) {
    updateHeatwaveCard();
  }
  else if (
    selectedRisk ===
    "flood"
  ) {
    updateFloodCard();
  }
  else if (
    selectedRisk ===
    "tropical"
  ) {
    updateTropicalCard();
  }
  else {
    updateGeneralCard();
  }
}
/* =========================================================
   현재 위험 레벨
========================================================= */
function getCurrentRiskLevel() {
  if (
    selectedRisk ===
    "heatwave"
  ) {
    return heatwaveCardProfiles[
      currentYear
    ].level;
  }
  if (
    selectedRisk ===
    "flood"
  ) {
    return floodCardProfiles[
      currentYear
    ].level;
  }
  if (
    selectedRisk ===
    "tropical"
  ) {
    return tropicalCardProfiles[
      currentYear
    ].level;
  }
  return getClimateData(
    selectedRisk,
    currentYear
  ).level;
}
/* =========================================================
   경고 팝업
========================================================= */
function showDangerAlert(
  yearKey
) {
  const yearLabel =
    yearProfiles[
      yearKey
    ].label;
  let riskLabel =
    "";
  if (
    selectedRisk ===
    "heatwave"
  ) {
    riskLabel =
      "폭염";
  }
  else if (
    selectedRisk ===
    "flood"
  ) {
    riskLabel =
      "침수";
  }
  else {
    riskLabel =
      climateRiskProfiles[
        selectedRisk
      ].name;
  }
  dangerAlertMessage.innerHTML =
    `${yearLabel}, 위험 단계가 크게 상승합니다.<br>
    이후 화면에서는 현재 공간의 예상 ${riskLabel}<br>
    위험 정보가 강조되어 표시됩니다.`;
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
  updateClimateInterface();
  const riskLevel =
    getCurrentRiskLevel();
  if (
    riskLevel >=
    DANGER_LEVEL
  ) {
    const alertKey =
      `${selectedRisk}-${key}`;
    if (
      !shownDangerAlerts.has(
        alertKey
      )
    ) {
      document.body.classList.remove(
        "danger-mode"
      );
      showDangerAlert(
        key
      );
      shownDangerAlerts.add(
        alertKey
      );
    }
    else {
      document.body.classList.add(
        "danger-mode"
      );
    }
  }
  else {
    document.body.classList.remove(
      "danger-mode"
    );
    dangerAlert.classList.remove(
      "show"
    );
    dangerAlert.setAttribute(
      "aria-hidden",
      "true"
    );
  }
}
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
   위험 선택
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
        document.body.classList.remove(
          "danger-mode"
        );
        updateClimateInterface();
        if (
          getCurrentRiskLevel() >=
          DANGER_LEVEL
        ) {
          document.body.classList.add(
            "danger-mode"
          );
        }
      }
    );
  }
);
/* =========================================================
   환경 탐지
========================================================= */
function detectEnvironment(data) {
  const source =
    (
      JSON.stringify(
        data?.address || {}
      )
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
    source.includes("강") ||
    source.includes("하천") ||
    source.includes("호수")
  ) {
    return "river";
  }
  if (
    source.includes("forest") ||
    source.includes("mountain") ||
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
   자동 위험 선택
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
  )
  .addTo(
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
      "주소 조회 실패:",
      error
    );
    return null;
  }
}
/* =========================================================
   장소 이름
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
   위치 기반 정보
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
    "GPS 오류:",
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
        if (!shouldOpen) {
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
   초기화
========================================================= */
initializeLocationMap();
updateClimateInterface();
changeYear(
  "current"
);
startLocationTracking();