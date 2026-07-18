import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  School as SchoolIcon,
  Info,
  X,
  Utensils,
  Flame,
  User,
  Activity,
  MapPin,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { School, Meal, ReviewerPersonality } from "./types";

// Korean Allergen list mapping
const ALLERGENS_MAP: Record<string, string> = {
  "1": "난류(계란)",
  "2": "우유",
  "3": "메밀",
  "4": "땅콩",
  "5": "대두(콩)",
  "6": "밀",
  "7": "고등어",
  "8": "게",
  "9": "새우",
  "10": "돼지고기",
  "11": "복숭아",
  "12": "토마토",
  "13": "아황산류",
  "14": "호두",
  "15": "닭고기",
  "16": "쇠고기",
  "17": "오징어",
  "18": "조개류(굴,전복,홍합 등)",
  "19": "잣",
};

// Reviewer Personalities config
const PERSONALITIES = [
  {
    id: "critic",
    name: "엄격한 미식 평론가",
    emoji: "🤵",
    description: "미슐랭 3스타 평론가의 우아하고 날카로운 명품 맛평가",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50/50",
    borderActive: "border-blue-500 ring-2 ring-blue-500/20",
    loadingPhrases: [
      "오늘 급식 식단의 플레이팅 페어링을 우아하게 분석하는 중...",
      "메뉴 구성의 가치를 미학적 관점에서 철저히 검토하는 중...",
      "미슐랭 별점을 내리기 위해 영혼 깊숙이 고뇌하는 중...",
    ],
  },
  {
    id: "gymbro",
    name: "득근 헬창 트레이너",
    emoji: "💪",
    description: "오직 프로틴과 탄단지 비율에만 집착하는 활기찬 득근 머신",
    color: "from-red-500 to-orange-600",
    bgLight: "bg-red-50/50",
    borderActive: "border-red-500 ring-2 ring-red-500/20",
    loadingPhrases: [
      "오늘 급식의 정확한 탄단지 매크로 영양 성분을 계산하는 중...",
      "단백질 부족으로 인해 손실될 0.1g의 소중한 근섬유를 애도하는 중...",
      "스쿼트와 데드리프트 수행 능력 향상 지수를 연산하는 중...",
    ],
  },
  {
    id: "auntie",
    name: "츤데레 급식실 이모님",
    emoji: "👩‍🍳",
    description: "정은 넘치지만 툴툴대며 밥알 한가득 얹어주시는 친근한 이모님",
    color: "from-amber-500 to-yellow-600",
    bgLight: "bg-amber-50/50",
    borderActive: "border-amber-500 ring-2 ring-amber-500/20",
    loadingPhrases: [
      "밥주걱에 수북이 밥알을 얹으며 누구 잔소리할지 스캔하는 중...",
      "야채를 편식하는 녀석들에게 줄 사랑의 맴매를 닦아두는 중...",
      "오늘따라 유난히 맛있게 볶아진 고기반찬을 보며 뿌듯해하는 중...",
    ],
  },
  {
    id: "elementary",
    name: "말썽쟁이 초딩 1학년",
    emoji: "🎒",
    description: "소시지랑 고기는 무조건 극찬! 채소는 외계인 음식이라 기피하는 동심",
    color: "from-green-500 to-emerald-600",
    bgLight: "bg-green-50/50",
    borderActive: "border-green-500 ring-2 ring-green-500/20",
    loadingPhrases: [
      "오늘 급식에 비엔나 소시지가 총 몇 개 들어있나 세어보는 중...",
      "몸에 좋은 시금치를 식판 구석 아래로 몰래 숨길 각을 재는 중...",
      "공부 다 제쳐두고 오직 종소리만 기다리며 식판을 응시하는 중...",
    ],
  },
  {
    id: "poet",
    name: "감성 낭만 시인",
    emoji: "✍️",
    description: "김 한 장, 깍두기 하나에서도 우주의 섭리와 애수를 느끼는 감성 시인",
    color: "from-purple-500 to-pink-600",
    bgLight: "bg-purple-50/50",
    borderActive: "border-purple-500 ring-2 ring-purple-500/20",
    loadingPhrases: [
      "따스한 김 속에서 솟아나는 아지랑이를 바라보며 시적 감성에 젖는 중...",
      "깍두기 한 점이 흘리는 붉은 국물 속에서 계절의 덧없음을 고찰하는 중...",
      "영양가 넘치는 국 한 그릇에 담긴 영혼의 따뜻함을 은유적으로 찬미하는 중...",
    ],
  },
];

// Helper: Pick a food emoji dynamically
function getFoodEmoji(name: string): string {
  const n = name.trim();
  if (n.includes("밥") || n.includes("라이스") || n.includes("볶음밥") || n.includes("덮밥")) return "🍚";
  if (n.includes("국") || n.includes("찌개") || n.includes("탕") || n.includes("스프") || n.includes("전골")) return "🍲";
  if (n.includes("김치") || n.includes("깍두기") || n.includes("겉절이") || n.includes("석박지") || n.includes("동치미")) return "🥢";
  if (n.includes("돈가스") || n.includes("까스") || n.includes("튀김") || n.includes("커틀렛") || n.includes("크로켓")) return "🍤";
  if (n.includes("치킨") || n.includes("닭") || n.includes("통닭") || n.includes("계육") || n.includes("삼계탕")) return "🍗";
  if (n.includes("갈비") || n.includes("고기") || n.includes("불고기") || n.includes("제육") || n.includes("삼겹살") || n.includes("돈육") || n.includes("우육") || n.includes("스테이크") || n.includes("장조림") || n.includes("보쌈") || n.includes("함박")) return "🍖";
  if (n.includes("생선") || n.includes("조기") || n.includes("갈치") || n.includes("고등어") || n.includes("구이") || n.includes("어묵") || n.includes("해물") || n.includes("새우") || n.includes("낙지") || n.includes("오징어") || n.includes("게") || n.includes("쭈꾸미")) return "🐟";
  if (n.includes("샐러드") || n.includes("무침") || n.includes("나물") || n.includes("김") || n.includes("상추") || n.includes("야채") || n.includes("브로콜리") || n.includes("시금치") || n.includes("샐러리") || n.includes("겉절이")) return "🥗";
  if (n.includes("우유") || n.includes("라떼") || n.includes("요구르트") || n.includes("요플레") || n.includes("드링킹")) return "🥛";
  if (n.includes("주스") || n.includes("에이드") || n.includes("음료") || n.includes("식혜") || n.includes("매실")) return "🧃";
  if (n.includes("빵") || n.includes("케이크") || n.includes("도넛") || n.includes("샌드위치") || n.includes("토스트") || n.includes("와플") || n.includes("머핀") || n.includes("파이") || n.includes("슈")) return "🍞";
  if (n.includes("사과") || n.includes("배") || n.includes("딸기") || n.includes("바나나") || n.includes("귤") || n.includes("오렌지") || n.includes("포도") || n.includes("수박") || n.includes("멜론") || n.includes("파인애플") || n.includes("방울토마토") || n.includes("토마토") || n.includes("과일")) return "🍎";
  if (n.includes("국수") || n.includes("면") || n.includes("스파게티") || n.includes("우동") || n.includes("파스타") || n.includes("짬뽕") || n.includes("짜장") || n.includes("칼국수")) return "🍜";
  if (n.includes("만두") || n.includes("샤오롱바오")) return "🥟";
  if (n.includes("떡볶이") || n.includes("순대") || n.includes("떡")) return "🍢";
  if (n.includes("푸딩") || n.includes("젤리") || n.includes("요플레") || n.includes("아이스크림") || n.includes("빙수")) return "🍮";
  if (n.includes("달걀") || n.includes("계란") || n.includes("말이") || n.includes("후라이") || n.includes("수란")) return "🍳";
  if (n.includes("카레") || n.includes("짜장")) return "🍛";
  return "🍛"; // Default plate
}

// Sample Schools for quick try
const SAMPLE_SCHOOLS: School[] = [
  {
    ATPT_OFCDC_SC_CODE: "J10",
    ATPT_OFCDC_SC_NM: "경기도교육청",
    SD_SCHUL_CODE: "7530842",
    SCHUL_NM: "한월초등학교",
    LCTN_SC_NM: "경기도",
    ORG_RDNMA: "경기도 안산시 상록구 광덕산2로 35",
    SCHUL_KND_SC_NM: "초등학교",
  },
  {
    ATPT_OFCDC_SC_CODE: "T10",
    ATPT_OFCDC_SC_NM: "제주특별자치도교육청",
    SD_SCHUL_CODE: "9290055",
    SCHUL_NM: "제주중앙중학교",
    LCTN_SC_NM: "제주특별자치도",
    ORG_RDNMA: "제주특별자치도 제주시 이도이동 오남로 67",
    SCHUL_KND_SC_NM: "중학교",
  },
  {
    ATPT_OFCDC_SC_CODE: "B10",
    ATPT_OFCDC_SC_NM: "서울특별시교육청",
    SD_SCHUL_CODE: "7010118",
    SCHUL_NM: "서울대학교사범대학부설고등학교",
    LCTN_SC_NM: "서울특별시",
    ORG_RDNMA: "서울특별시 성북구 월계로 17",
    SCHUL_KND_SC_NM: "고등학교",
  },
];

export default function App() {
  // State management
  const [selectedSchool, setSelectedSchool] = useState<School | null>(() => {
    const saved = localStorage.getItem("selectedSchool");
    return saved ? JSON.parse(saved) : null;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<School[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  });

  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [mealError, setMealError] = useState("");

  const [selectedPersonality, setSelectedPersonality] = useState("critic");
  const [reviews, setReviews] = useState<Record<string, string>>({}); // keyed by "date-mealType-personality"
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [selectedAllergenNum, setSelectedAllergenNum] = useState<string | null>(null);

  // Auto scroll effect on loading phrases
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGeneratingReview) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % 3);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGeneratingReview]);

  // Fetch meals when school or date changes
  useEffect(() => {
    if (selectedSchool) {
      fetchMeals(selectedSchool, selectedDate);
    }
  }, [selectedSchool, selectedDate]);

  // Function to search schools
  const searchSchools = async (nameStr: string) => {
    if (!nameStr || nameStr.trim().length < 2) {
      setSearchError("학교 이름을 2글자 이상 입력해 주세요.");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const res = await fetch(`/api/schools?name=${encodeURIComponent(nameStr.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "학교를 찾을 수 없습니다.");
      }

      setSearchResults(data);
    } catch (err: any) {
      setSearchError(err.message || "학교 정보를 검색하는 데 실패했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  // Function to fetch meals
  const fetchMeals = async (school: School, dateStr: string) => {
    setIsLoadingMeals(true);
    setMealError("");
    setMeals([]);
    // Reset review error when meal changes
    setReviewError("");

    try {
      const res = await fetch(
        `/api/meals?officeCode=${school.ATPT_OFCDC_SC_CODE}&schoolCode=${school.SD_SCHUL_CODE}&date=${dateStr}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "급식 데이터를 불러올 수 없습니다.");
      }

      setMeals(data.meals || []);
    } catch (err: any) {
      setMealError(err.message || "급식 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingMeals(false);
    }
  };

  // Function to request Gemini AI review
  const generateAIReview = async (meal: Meal) => {
    if (!selectedSchool || !meal || meal.items.length === 0) return;

    const reviewKey = `${selectedDate}-${meal.mealType}-${selectedPersonality}`;
    if (reviews[reviewKey]) {
      // Already cached
      return;
    }

    setIsGeneratingReview(true);
    setReviewError("");
    setLoadingPhraseIndex(0);

    try {
      const dishNames = meal.items.map((item) => item.name);
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: selectedSchool.SCHUL_NM,
          date: selectedDate,
          mealType: meal.mealType,
          dishes: dishNames,
          personalityId: selectedPersonality,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI 맛평론을 가져오는 데 실패했습니다.");
      }

      setReviews((prev) => ({
        ...prev,
        [reviewKey]: data.review,
      }));
    } catch (err: any) {
      setReviewError(err.message || "AI 평가 한줄평을 생성하는 중 문제가 발생했습니다.");
    } finally {
      setIsGeneratingReview(false);
    }
  };

  // Date manipulation helpers
  const handleDateChange = (days: number) => {
    const year = parseInt(selectedDate.substring(0, 4));
    const month = parseInt(selectedDate.substring(4, 6)) - 1;
    const day = parseInt(selectedDate.substring(6, 8));

    const current = new Date(year, month, day);
    current.setDate(current.getDate() + days);

    const newYear = current.getFullYear();
    const newMonth = String(current.getMonth() + 1).padStart(2, "0");
    const newDay = String(current.getDate()).padStart(2, "0");

    setSelectedDate(`${newYear}${newMonth}${newDay}`);
  };

  const setToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${year}${month}${day}`);
  };

  const setTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${year}${month}${day}`);
  };

  const formatDisplayDate = (dateStr: string) => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[d.getDay()];

    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일 (${weekday})`;
  };

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    localStorage.setItem("selectedSchool", JSON.stringify(school));
    // Clear search query and results
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  };

  const handleDisconnectSchool = () => {
    setSelectedSchool(null);
    localStorage.removeItem("selectedSchool");
    setMeals([]);
    setReviews({});
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const activePersonalityObj = PERSONALITIES.find((p) => p.id === selectedPersonality)!;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-white p-2.5 rounded-2xl shadow-md shadow-amber-500/20 flex items-center justify-center">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                나이스 급식 <span className="text-amber-500">AI</span> 한줄평
              </h1>
              <p className="text-xs font-medium text-slate-400">나이스 급식 정보 & 위트 넘치는 AI 맛평가</p>
            </div>
          </div>

          {selectedSchool && (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-semibold text-slate-800 text-sm">{selectedSchool.SCHUL_NM}</span>
                <span className="text-xxs text-slate-400 font-mono tracking-tight bg-slate-100 px-1.5 py-0.5 rounded-sm">
                  {selectedSchool.ATPT_OFCDC_SC_NM}
                </span>
              </div>
              <button
                onClick={handleDisconnectSchool}
                className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-2 rounded-xl transition duration-200"
                id="btn-change-school"
              >
                <SchoolIcon className="h-3.5 w-3.5" />
                <span>학교 변경</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        <AnimatePresence mode="wait">
          {!selectedSchool ? (
            /* Step 1: Onboarding School Search */
            <motion.div
              key="school-selection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto w-full flex flex-col gap-6"
            >
              <div className="text-center flex flex-col gap-3">
                <span className="inline-block mx-auto text-4xl">🏫</span>
                <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
                  조회할 학교를 선택해 주세요
                </h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  전국 초·중·고등학교의 급식 정보를 안전하고 빠르게 찾아 한줄평을 제공해 드립니다.
                </p>
              </div>

              {/* Search Box */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") searchSchools(searchQuery);
                    }}
                    placeholder="학교 이름 입력 (예: 한월초, 제주중앙중)"
                    className="block w-full pl-11 pr-24 py-4 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-slate-800 placeholder-slate-400 shadow-inner"
                    id="input-school-search"
                  />
                  <button
                    onClick={() => searchSchools(searchQuery)}
                    disabled={isSearching}
                    className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-amber-500 text-white font-semibold rounded-xl px-4 text-sm transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    id="btn-school-search"
                  >
                    {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : "검색"}
                  </button>
                </div>

                {searchError && (
                  <div className="flex items-start gap-2 text-rose-600 bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 text-xs font-semibold leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{searchError}</span>
                  </div>
                )}

                {/* Results list */}
                {searchResults.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">검색 결과</h3>
                    <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                      {searchResults.map((school) => (
                        <button
                          key={school.SD_SCHUL_CODE}
                          onClick={() => handleSelectSchool(school)}
                          className="w-full text-left bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 p-4 rounded-xl transition duration-200 group flex justify-between items-center"
                          id={`school-result-${school.SD_SCHUL_CODE}`}
                        >
                          <div className="flex flex-col gap-1 pr-4">
                            <span className="font-bold text-slate-800 group-hover:text-amber-900 text-sm transition">
                              {school.SCHUL_NM}
                            </span>
                            <div className="flex items-center gap-1.5 text-xxs text-slate-400 font-medium">
                              <MapPin className="h-3 w-3 shrink-0 text-slate-300" />
                              <span>{school.ORG_RDNMA}</span>
                            </div>
                          </div>
                          <span className="text-xxs font-bold text-amber-600 bg-amber-50 border border-amber-100 group-hover:bg-amber-500 group-hover:text-white px-2 py-1 rounded-md transition duration-200 shrink-0">
                            선택
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Onboarding Samples */}
              <div className="bg-slate-100/60 p-5 rounded-2xl border border-slate-200/40">
                <span className="text-xs font-bold text-slate-400 block mb-3 text-center">
                  💡 학교를 검색하기 번거로우시다면 바로 체험해 보세요!
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_SCHOOLS.map((school) => (
                    <button
                      key={school.SD_SCHUL_CODE}
                      onClick={() => handleSelectSchool(school)}
                      className="bg-white hover:bg-amber-50 hover:border-amber-200 border border-slate-200 p-3 rounded-xl transition text-center flex flex-col justify-center items-center gap-1 group shadow-xs"
                      id={`btn-sample-school-${school.SD_SCHUL_CODE}`}
                    >
                      <span className="text-lg">🏫</span>
                      <span className="font-bold text-xs text-slate-800 group-hover:text-amber-950 truncate max-w-full">
                        {school.SCHUL_NM}
                      </span>
                      <span className="text-xxs text-slate-400 font-medium truncate">{school.LCTN_SC_NM}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Step 2: Main School Meal & Review view */
            <motion.div
              key="meal-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8"
            >
              {/* Date Selection Control Bar */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-1.5 w-full md:w-auto justify-between md:justify-start">
                  <button
                    onClick={() => handleDateChange(-1)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                    id="btn-prev-day"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center space-x-3.5 px-4 font-display font-bold text-lg text-slate-800 select-none text-center">
                    <span>{formatDisplayDate(selectedDate)}</span>
                  </div>

                  <button
                    onClick={() => handleDateChange(1)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                    id="btn-next-day"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2.5 w-full md:w-auto">
                  <button
                    onClick={setToday}
                    className="flex-1 md:flex-initial text-xs font-semibold px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    id="btn-today"
                  >
                    오늘
                  </button>
                  <button
                    onClick={setTomorrow}
                    className="flex-1 md:flex-initial text-xs font-semibold px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    id="btn-tomorrow"
                  >
                    내일
                  </button>
                  <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-3 cursor-pointer select-none transition flex-1 md:flex-initial text-center justify-center font-semibold text-xs border border-transparent">
                    <CalendarIcon className="h-4 w-4 mr-2 text-slate-500 shrink-0" />
                    <span>직접 선택</span>
                    <input
                      type="date"
                      value={`${selectedDate.substring(0, 4)}-${selectedDate.substring(
                        4,
                        6
                      )}-${selectedDate.substring(6, 8)}`}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(e.target.value.replace(/-/g, ""));
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      id="input-date-picker"
                    />
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: School Meals list */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-amber-500" />
                      오늘의 식단 리스트
                    </h3>
                    <button
                      onClick={() => setShowAllergenModal(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                      id="btn-allergen-info"
                    >
                      <Info className="h-3.5 w-3.5" />
                      알레르기 가이드
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {isLoadingMeals ? (
                      /* Skeleton Loading Trays */
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-5"
                      >
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4 animate-pulse"
                          >
                            <div className="flex justify-between items-center">
                              <div className="h-5 w-24 bg-slate-200 rounded-md"></div>
                              <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 w-full bg-slate-100 rounded-md"></div>
                              <div className="h-4 w-5/6 bg-slate-100 rounded-md"></div>
                              <div className="h-4 w-2/3 bg-slate-100 rounded-md"></div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ) : mealError ? (
                      /* Error Message */
                      <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-center flex flex-col items-center gap-2"
                      >
                        <span className="text-3xl">⚠️</span>
                        <h4 className="font-bold text-rose-800 text-sm">급식 정보를 불러오지 못했습니다</h4>
                        <p className="text-xs text-rose-600 leading-relaxed max-w-sm mx-auto">{mealError}</p>
                      </motion.div>
                    ) : meals.length === 0 ? (
                      /* Empty State */
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center gap-4 py-12"
                      >
                        <div className="text-5xl">🥣</div>
                        <div className="flex flex-col gap-1.5">
                          <h4 className="font-bold text-slate-800">등록된 급식 식단이 없습니다</h4>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                            주말, 공휴일, 혹은 방학 기간이거나 나이스 시스템에 식단표가 등록되지 않은 날짜입니다.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      /* Actual Meal Cards */
                      <motion.div
                        key="meals-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-6"
                      >
                        {meals.map((meal) => (
                          <div
                            key={meal.mealCode}
                            className="bg-white border border-slate-100 hover:border-amber-200 hover:shadow-md rounded-3xl p-6 transition-all duration-300 shadow-xs flex flex-col gap-5 group"
                            id={`meal-card-${meal.mealCode}`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                              <div className="flex items-center space-x-2.5">
                                <span className="text-lg bg-amber-50 border border-amber-100 text-amber-600 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 select-none">
                                  {meal.mealType}
                                </span>
                                <h4 className="font-bold text-slate-800 group-hover:text-amber-950 text-base transition">
                                  오늘의 메뉴
                                </h4>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100/70 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 select-none">
                                <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                                {meal.calories}
                              </span>
                            </div>

                            {/* Menu list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {meal.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-slate-50/60 border border-slate-100/50 hover:bg-amber-50/40 p-3.5 rounded-xl flex items-center justify-between transition group/item"
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <span className="text-xl shrink-0 select-none">{getFoodEmoji(item.name)}</span>
                                    <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                                      {item.name}
                                    </span>
                                  </div>
                                  
                                  {/* Allergens indicator */}
                                  {item.allergens.length > 0 && (
                                    <div className="flex gap-0.5 ml-2 shrink-0 overflow-x-auto max-w-[60px] no-scrollbar">
                                      {item.allergens.map((allergenNum) => (
                                        <button
                                          key={allergenNum}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAllergenNum(allergenNum);
                                          }}
                                          title={`알레르기 번호 ${allergenNum}: 클릭 시 상세 조회`}
                                          className="text-[9px] font-mono font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition shrink-0 border border-indigo-100/50"
                                        >
                                          {allergenNum}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Collapsible details for origin information or nutrient details if available */}
                            {(meal.originInfo || meal.nutrients) && (
                              <div className="border-t border-slate-50 pt-4 flex flex-col gap-2">
                                {meal.originInfo && (
                                  <div className="text-[11px] leading-relaxed text-slate-400">
                                    <span className="font-bold text-slate-500">[원산지]</span>{" "}
                                    {meal.originInfo.replace(/<br\s*\/?>/gi, ", ")}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Trigger Review Area */}
                            <div className="border-t border-slate-100 pt-4 flex justify-end">
                              <button
                                onClick={() => generateAIReview(meal)}
                                className="w-full sm:w-auto bg-slate-900 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                id={`btn-trigger-review-${meal.mealCode}`}
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>이 메뉴로 {activePersonalityObj.emoji} AI 한줄평 받기</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Side: AI Reviewer Personality & Response */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      AI 급식 평론가 캐릭터 선택
                    </h3>
                  </div>

                  {/* Personalities Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {PERSONALITIES.map((p) => {
                      const isActive = selectedPersonality === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPersonality(p.id)}
                          className={`text-left p-4 rounded-2xl border transition duration-200 flex items-start space-x-3.5 ${
                            isActive
                              ? `${p.bgLight} ${p.borderActive}`
                              : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                          id={`personality-card-${p.id}`}
                        >
                          <span className="text-3xl shrink-0 p-1.5 bg-white shadow-xs rounded-xl border border-slate-100 select-none">
                            {p.emoji}
                          </span>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                              {isActive && (
                                <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-gradient-to-r ${p.color}`}>
                                  선택됨
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 leading-relaxed">{p.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Speech Bubble Area */}
                  <div className="bg-white border border-slate-100 shadow-md shadow-slate-100/40 rounded-3xl p-6 flex flex-col gap-5 mt-2 min-h-[220px] justify-between relative overflow-hidden">
                    
                    {/* Background visual accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${activePersonalityObj.color} opacity-[0.03] rounded-full blur-2xl pointer-events-none`}></div>

                    <div className="flex items-center space-x-3 border-b border-slate-50 pb-4">
                      <span className="text-4xl select-none shrink-0">{activePersonalityObj.emoji}</span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {activePersonalityObj.name}의 평론 한줄평
                        </h4>
                        <p className="text-xxs text-slate-400 font-medium">Gemini 3.5 AI의 시뮬레이션 답변</p>
                      </div>
                    </div>

                    <div className="flex-grow flex items-center justify-center py-4 relative z-10">
                      <AnimatePresence mode="wait">
                        {isGeneratingReview ? (
                          /* Loading State with cycling phrases */
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center text-center gap-3 w-full"
                          >
                            <div className="flex space-x-1.5">
                              <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                              <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                              <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                            <p className="text-xs font-semibold text-slate-500 animate-pulse px-4 max-w-xs mx-auto">
                              {activePersonalityObj.loadingPhrases[loadingPhraseIndex]}
                            </p>
                          </motion.div>
                        ) : reviewError ? (
                          /* Generating Error */
                          <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center flex flex-col items-center gap-1.5 text-xs text-rose-600 font-semibold max-w-sm px-4"
                          >
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <span>{reviewError}</span>
                          </motion.div>
                        ) : meals.length === 0 ? (
                          /* Idle (no meals today) */
                          <motion.div
                            key="idle-no-meals"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-xs text-slate-400 max-w-xs font-semibold"
                          >
                            식사가 준비되어 있지 않으면 평론을 시작할 수 없습니다. 🥣
                          </motion.div>
                        ) : (() => {
                          // Try to find if there is a generated review for ANY of the current meals of the day
                          const currentReviews = meals
                            .map((m) => {
                              const key = `${selectedDate}-${m.mealType}-${selectedPersonality}`;
                              return { mealType: m.mealType, text: reviews[key] };
                            })
                            .filter((r) => r.text);

                          if (currentReviews.length === 0) {
                            return (
                              <motion.div
                                key="idle-has-meals"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center flex flex-col items-center gap-3 max-w-xs"
                              >
                                <span className="text-2xl select-none">💭</span>
                                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                  위 급식 메뉴 옆의 <span className="text-amber-600 font-bold">'한줄평 받기'</span> 버튼을 클릭하여 AI 캐릭터들의 재미있는 평가를 들어보세요!
                                </p>
                              </motion.div>
                            );
                          }

                          return (
                            <motion.div
                              key="content"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="w-full flex flex-col gap-4"
                            >
                              {currentReviews.map((item, index) => (
                                <div key={index} className="bg-slate-50/60 border border-slate-100 p-4.5 rounded-2xl flex flex-col gap-2 relative">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xxs font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md select-none">
                                      {item.mealType} 한줄평
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(item.text, `${item.mealType}-copy`)}
                                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition hover:bg-slate-200/50"
                                      title="한줄평 복사하기"
                                    >
                                      {copiedKey === `${item.mealType}-copy` ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap pl-1 font-sans">
                                    {item.text}
                                  </p>
                                </div>
                              ))}
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </div>

                    {/* Shared CTA prompt at footer of card */}
                    {meals.length > 0 && !isGeneratingReview && (
                      <div className="text-center text-xxs text-slate-400 select-none pt-2 border-t border-slate-50">
                        * 캐릭터를 변경한 뒤 다시 '한줄평 받기'를 클릭하면 새로운 장르의 맛평가가 가능합니다!
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center space-x-1.5 select-none">
            <span>나이스 급식 AI 한줄평 © 2026</span>
          </div>
          <div className="flex space-x-4">
            <span className="select-none text-xxs bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">NEIS OPEN API</span>
            <span className="select-none text-xxs bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">Gemini 3.5 Flash</span>
          </div>
        </div>
      </footer>

      {/* Modal 1: Allergen Dictionary */}
      <AnimatePresence>
        {showAllergenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">알레르기 유발 물질 가이드</h3>
                </div>
                <button
                  onClick={() => setShowAllergenModal(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 max-h-[350px] overflow-y-auto grid grid-cols-2 gap-2.5">
                {Object.entries(ALLERGENS_MAP).map(([num, name]) => (
                  <div
                    key={num}
                    className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100/50 text-xs text-slate-700 font-semibold"
                  >
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-mono font-bold text-[10px] shrink-0">
                      {num}
                    </span>
                    <span className="truncate">{name}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowAllergenModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-sm"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Allergen Specific Bubble */}
      <AnimatePresence>
        {selectedAllergenNum && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-xs overflow-hidden border border-slate-100"
            >
              <div className="p-5 text-center flex flex-col items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 font-mono font-bold text-lg border border-amber-100">
                  {selectedAllergenNum}
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">알레르기 성분 정보</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    이 번호는 <span className="text-amber-600 font-bold">{ALLERGENS_MAP[selectedAllergenNum] || "알 수 없는 성분"}</span> 성분을 나타냅니다.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setSelectedAllergenNum(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
