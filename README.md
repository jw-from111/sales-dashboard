# 📊 Excel 업로드 기반 영업관리 BI 대시보드

엑셀 파일(.xlsx)을 업로드하면 영업 실적 데이터를 자동 분석하여 KPI, 매출 현황, 상품 분석, 만기 계약 현황 등을 시각화하는 웹 기반 BI 대시보드입니다.

---

## 🚀 Live Demo

👉 sales-dashboard-three-navy.vercel.app

---

## 📸 프로젝트 미리보기

### 메인 대시보드

(스크린샷 첨부)

### 상품별 매출 분석

(스크린샷 첨부)

### 만기 계약 관리

(스크린샷 첨부)

---

## ✨ 주요 기능

### KPI 분석

* 총 매출
* 계약 건수
* 활성 계약 수
* 평균 계약 금액
* 평균 계약 기간
* 만기 예정 계약 수

### 매출 분석

* 지역별 매출
* 상품별 매출
* 계약형태별 매출
* 보험별 매출
* 연령별 계약 현황

### 계약 관리

* 7일 / 30일 / 60일 이내 만기 조회
* 만기 예정 계약 리스트
* 자동 인사이트 제공

### 데이터 업로드

* Excel(.xlsx, .xls) 지원
* 샘플 데이터 제공
* 업로드 즉시 대시보드 자동 갱신

---

## 🛠 Tech Stack

| Category        | Technology |
| --------------- | ---------- |
| Frontend        | React      |
| Chart           | Recharts   |
| Excel Parsing   | XLSX       |
| Language        | JavaScript |
| Deployment      | Vercel     |
| Version Control | GitHub     |

---

## 📂 데이터 구조

| 컬럼        | 설명      |
| --------- | ------- |
| Region    | 지역      |
| Contract  | 계약 형태   |
| Month     | 계약 개월 수 |
| Product   | 상품      |
| Age       | 연령      |
| Insurance | 보험 종류   |
| Start     | 계약 시작일  |
| Paid      | 월 금액    |
| End       | 계약 종료일  |

---

## 💰 매출 계산 방식

```text
계약 매출액 = Paid × Month
```

---

## 🎯 개발 목적

* 반복적인 엑셀 분석 업무 자동화
* 영업 KPI 실시간 확인
* 데이터 기반 의사결정 지원
* 만기 계약 관리 효율화
* BI 대시보드 구현 경험 확보

---

## 🔗 배포

Vercel을 통해 배포하였으며 GitHub와 연동하여 자동 배포됩니다.
