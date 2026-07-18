export interface School {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
  ATPT_OFCDC_SC_NM: string;   // 시도교육청명
  SD_SCHUL_CODE: string;      // 표준학교코드
  SCHUL_NM: string;           // 학교명
  LCTN_SC_NM: string;         // 소재지명
  ORG_RDNMA: string;          // 도로명주소
  SCHUL_KND_SC_NM: string;    // 학교급구분 (초등학교, 중학교, 고등학교 등)
}

export interface MealItem {
  name: string;
  allergens: string[];
}

export interface Meal {
  mealCode: string;   // MMEAL_SC_CODE (1: 조식, 2: 중식, 3: 석식)
  mealType: string;   // MMEAL_SC_NM (조식, 중식, 석식)
  calories: string;   // CAL_INFO
  items: MealItem[];
  nutrients: string;  // NTR_INFO
  originInfo: string; // ORPLC_INFO
}

export interface ReviewerPersonality {
  id: string;
  name: string;
  emoji: string;
  description: string;
  prompt: string;
}

export interface ReviewResponse {
  review: string;
}
