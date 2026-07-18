import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper: Parse NEIS DDISH_NM string into structured food items
function parseMealString(dishStr: string) {
  if (!dishStr) return [];
  // Split by HTML break tags or newlines
  const rawItems = dishStr.split(/<br\s*\/?>|\n/i);
  return rawItems
    .map((item) => {
      const trimmed = item.trim();
      if (!trimmed) return null;

      // Extract allergen information if present inside parentheses (e.g., "보리밥 (5.6)")
      const allergenMatch = trimmed.match(/^([^(]+)(?:\(([\d.]+)\))?$/);
      if (allergenMatch) {
        const name = allergenMatch[1].trim();
        const allergensStr = allergenMatch[2] ? allergenMatch[2].trim() : "";
        const allergens = allergensStr ? allergensStr.split(".") : [];
        return { name, allergens };
      }

      return { name: trimmed, allergens: [] };
    })
    .filter((item): item is { name: string; allergens: string[] } => item !== null);
}

// 1. School Search API
app.get("/api/schools", async (req, res) => {
  const { name } = req.query;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "학교 이름을 2글자 이상 입력해 주세요." });
  }

  try {
    const url = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=20&SCHUL_NM=${encodeURIComponent(
      name
    )}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.RESULT && data.RESULT.CODE !== "INFO-000") {
      return res.status(404).json({ error: "학교 검색 결과가 없습니다." });
    }

    if (!data.schoolInfo) {
      return res.status(404).json({ error: "학교 검색 결과가 없습니다." });
    }

    const rows = data.schoolInfo[1].row;
    res.json(rows);
  } catch (error) {
    console.error("School API Error:", error);
    res.status(500).json({ error: "학교 정보를 가져오는 도중 에러가 발생했습니다." });
  }
});

// 2. School Meal Fetch API
app.get("/api/meals", async (req, res) => {
  const { officeCode, schoolCode, date } = req.query;

  if (!officeCode || !schoolCode || !date) {
    return res.status(400).json({ error: "필수 파라미터(officeCode, schoolCode, date)가 누락되었습니다." });
  }

  try {
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.RESULT && data.RESULT.CODE !== "INFO-000") {
      // In case there's no meal data for the selected date, it returns an info code (like INFO-200)
      return res.json({ meals: [] });
    }

    if (!data.mealServiceDietInfo) {
      return res.json({ meals: [] });
    }

    const rows = data.mealServiceDietInfo[1].row;
    const meals = rows.map((row: any) => ({
      mealCode: row.MMEAL_SC_CODE,
      mealType: row.MMEAL_SC_NM,
      calories: row.CAL_INFO,
      items: parseMealString(row.DDISH_NM),
      nutrients: row.NTR_INFO || "",
      originInfo: row.ORPLC_INFO || "",
    }));

    res.json({ meals });
  } catch (error) {
    console.error("Meal API Error:", error);
    res.status(500).json({ error: "급식 정보를 가져오는 도중 에러가 발생했습니다." });
  }
});

// 3. AI Meal Review API (Gemini)
app.post("/api/review", async (req, res) => {
  const { schoolName, date, mealType, dishes, personalityId } = req.body;

  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return res.status(400).json({ error: "급식 메뉴가 비어있습니다." });
  }

  // Personalities configurations
  const personalities: Record<string, { name: string; systemPrompt: string }> = {
    critic: {
      name: "엄격한 미식가 (Strict Food Critic)",
      systemPrompt: `당신은 5성급 호텔의 아주 까다롭고 위트 넘치는 미식 평론가입니다.
학교 급식을 마치 세계 최고급 프렌치 파인다이닝 코스 요리인 것처럼 진지하고 우아하게 분석해 주세요.
격식 있는 말투(~옵니다, ~체) 혹은 고급스러운 표현을 사용하며, 기발하게 비유해서 칭찬하거나 유머러스하게 지적해 주세요.
한 줄만 아주 임팩트 있고 재미있게 작성해 주어야 하며, 마지막에는 '평점: ★★★★☆' 같은 유머러스한 평점을 동반해 주세요.`,
    },
    gymbro: {
      name: "3대 500 헬창 트레이너 (Gym Bro)",
      systemPrompt: `당신은 오직 단백질(프로틴)과 탄수화물의 매크로 비율에 집착하는 근성장 중독 헬스 트레이너입니다.
제공된 식단이 근비대나 데드리프트 수행 능력에 미칠 영향을 열정적으로 분석해 주세요.
헬스 은어(득근, 근손실, 점진적 과부하, 파이팅, 3대 운동, 벌크업 등)를 반드시 많이 섞고, 엄청나게 하이텐션이고 활기찬 말투로 써주세요.
단백질이 부족하면 분노하고, 단백질이 많으면 "득근 가즈아!"를 외치며 활기찬 한 줄 평을 작성해 주세요.`,
    },
    auntie: {
      name: "츤데레 급식실 이모님 (Cafeteria Auntie)",
      systemPrompt: `당신은 정이 매우 많지만 겉으로는 툴툴거리는 친근한 급식실 이모님입니다.
무조건 친근한 사투리나 정겨운 말투(~야, ~했어?, 아이고 인간아, 남기지 마라 등)를 사용하세요.
"아이고~ 편식하지 말고 싹싹 긁어 먹어라!" 혹은 "오늘 이모가 힘 좀 썼다!" 같은 멘트를 섞어주세요.
친근한 잔소리와 함께 영양가 높게 차렸으니 다 먹고 힘내서 공부하라는 따뜻한 정이 느껴지도록 웃긴 한 줄 평을 작성해 주세요.`,
    },
    elementary: {
      name: "초등학교 1학년 (1st Grader)",
      systemPrompt: `당신은 받아쓰기 50점을 맞은 순진무구하고 귀여운 초등학교 1학년 학생입니다.
일부러 맞춤법을 살짝씩 틀리거나(예: '마싯는', '기부니 조아서', '시금치 시러요') 아이 같은 귀여운 표현을 사용하세요.
소시지, 고기, 튀김, 단 반찬이 있으면 세상을 다 가진 것처럼 찬양하세요.
시금치, 브로콜리, 버섯 등 채소 반찬이 있으면 "외계인이 먹는 초록 괴물 괴롭힘 음식"이라며 온몸으로 기피하고 울상을 짓는 귀여운 투정 한 줄 평을 작성해 주세요.`,
    },
    poet: {
      name: "감성 충만 시인 (Poet)",
      systemPrompt: `당신은 아주 작은 반찬(깍두기, 멸치볶음 등) 하나에서도 우주의 고독, 인생의 덧없음, 가을날의 쓸쓸함을 느끼는 극강의 감성파 시인입니다.
매우 아름답고 비장한 어조로, 시의 한 구절처럼 급식을 미화해 주세요.
살짝 허세가 섞여 있어 어이가 없으면서도 문학적으로 훌륭해야 합니다. 줄바꿈을 활용한 짧은 시 형태로 재미있는 감동을 주는 한 줄 평을 작성해 주세요.`,
    },
  };

  const activePersonality = personalities[personalityId] || personalities.critic;

  try {
    const formattedDate = `${date.substring(0, 4)}년 ${date.substring(4, 6)}월 ${date.substring(6, 8)}일`;
    const dishesList = dishes.join(", ");
    
    const userPrompt = `
학교명: ${schoolName}
날짜: ${formattedDate}
식사 구분: ${mealType}
오늘의 급식 메뉴: ${dishesList}

위 급식 메뉴를 바탕으로, 당신의 캐릭터(${activePersonality.name})에 백퍼센트 몰입하여 맛깔나고 배꼽 잡는 '급식 한줄평'을 작성해 주세요. 반드시 1~2줄 내외로 짧고 강렬하게 작성해야 합니다.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: activePersonality.systemPrompt,
        temperature: 0.85,
      },
    });

    const review = response.text ? response.text.trim() : "AI 평론가가 메뉴판을 보고 감탄하느라 말을 잇지 못합니다.";
    res.json({ review });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "AI 한줄평을 생성하는 도중 에러가 발생했습니다." });
  }
});

// Vite/Static Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://localhost:${PORT}`);
  });
}

startServer();
