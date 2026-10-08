/**
 * 사이트 콘텐츠 스키마 + 기본값
 * ────────────────────────────────────────────────────────────
 * 이 파일은 콘텐츠의 "모양(타입)"과 "초기값(기본 원고)"을 정의한다.
 * 실제 화면에 쓰이는 값은 `lib/content/index.ts` 의 getContent() 가
 * 저장소(Vercel Blob / 로컬 파일)에 저장된 원장님 수정본을 기본값 위에
 * 병합해서 만든다. 즉, 저장된 값이 없으면 항상 이 기본값이 보인다.
 *
 * 새 필드를 추가할 때는 반드시 여기 defaultContent 에 기본값을 넣을 것.
 * (저장된 JSON 에 없는 필드는 이 기본값으로 채워진다)
 */

/** 모바일 화면에서만 줄바꿈을 강제하는 마커(유니코드 라인 구분자 U+2028).
 *  관리자 편집기에서는 「⏎」 기호로 표시/입력한다. */
export const MOBILE_BREAK = String.fromCharCode(0x2028);

/** 관리자 편집기에서 모바일 전용 줄바꿈을 나타내는 사람이 읽을 수 있는 토큰 */
export const MOBILE_BREAK_TOKEN = "⏎";

export type CtaContent = {
  label: string;
  href: string;
  /** "chat" = 말풍선 아이콘, "arrow" = 화살표(자세히보기) */
  icon?: "chat" | "arrow";
};

export type HeroTrackId = "stomach" | "diet";

export type HeroVariant = {
  title: string;
  subtitle: string[];
  /** 배경 이미지 경로/URL. 비우면 gradient 만 표시 */
  image: string;
  /** 이미지가 없을 때 대체되는 브랜드 톤 그라데이션(편집기 비노출) */
  gradient: string;
  cta?: CtaContent;
};

export type HeroTrack = HeroVariant & { buttonLabel: string };

export type SiteContent = {
  site: {
    name: string;
    tagline: string;
    phone: string;
    links: {
      kakao: string;
      youtube: string;
      consult: string;
      blog: string;
      instagram: string;
    };
  };

  nav: { label: string; href: string }[];

  hero: {
    default: HeroVariant;
    tracks: Record<HeroTrackId, HeroTrack>;
  };

  treatment: {
    kicker: string;
    title: string;
    tracks: {
      id: string;
      label: string;
      title: string;
      desc: string;
      caption: string;
      image: string;
      href: string;
      cta: string;
    }[];
  };

  /**
   * 히어로 아래(진료과목 탭을 선택한 화면에서만) 노출되는 후기 섹션.
   * 사진/이름/후기글(items)은 의료법상 비로그인 방문자에게 노출되면 안 되므로
   * `components/Reviews.tsx` 가 서버에서만 읽어 렌더링하고, 공개 페이지의
   * ContentProvider(클라이언트 공유 콘텐츠)에는 절대 포함시키지 않는다.
   */
  reviews: {
    kicker: string;
    title: string;
    subtitle: string;
    loginLabel: string;
    unlockedNote: string;
    logoutLabel: string;
    disclaimer: string;
    items: { name: string; photo: string; quote: string[] }[];
  };

  trackA: {
    kicker: string;
    title: string;
    lead: string;
    causesTitle: string;
    causes: { q: string; a: string[] }[];
    proof: {
      title: string;
      body: string;
      caption: string;
      /** 비포·애프터가 한 장에 함께 담긴 비교 사진 */
      photo: string;
    };
    disclaimer: string;
  };

  trackB: {
    kicker: string;
    title: string;
    lead: string;
    effectsTitle: string;
    /** label: 제목 위 작은 글자. 비우면 "( 작용 01 )" 처럼 순서대로 자동 번호 */
    effects: { label: string; term: string; desc: string }[];
    /** 한약 작용 다음, 이런 분들께 체크리스트 섹션 */
    fit: {
      title: string;
      items: string[];
      closing: string;
    };
    /** 감량기 → 유지기 2단계 차별점 섹션 */
    phases: {
      kicker: string;
      title: string;
      steps: {
        label: string;
        name: string;
        tagline: string;
        body: string;
        note: string;
        /** 단계 하단 이미지(선택). 비우면 표시하지 않음 */
        image: string;
      }[];
      emphasis: string;
    };
    /** 원장 직접 관리 약속 — 4칸 패널 + 하단 안내 박스 */
    promise: {
      kicker: string;
      title: string;
      cards: {
        label: string;
        title: string;
        /** title 안에서 강조색으로 보일 부분(선택). 비우면 강조 없음 */
        highlight: string;
        desc: string;
      }[];
      banner: {
        /** 카드 상단 제목(선택). 비우면 표시하지 않음 */
        heading: string;
        /** 제목 아래 설명(선택). 비우면 표시하지 않음 */
        body: string;
        /** 베이지 바 안의 굵은 문장 */
        title: string;
        note: string;
      };
      /** 섹션 맨 아래 상담 버튼(전화·카카오톡). 번호·링크는 site.phone / site.links.kakao 사용 */
      cta: { title: string; phoneLabel: string; kakaoLabel: string };
    };
    prescription: {
      kicker: string;
      title: string;
      body: string;
      note: string;
    };
    /** 맞춤 처방 기준 — 맞춤 처방 배너 바로 뒤, 3칸 프레임 카드 + 상담 CTA */
    basis: {
      cards: {
        /** 카드 왼쪽 위 작은 영문 라벨 (오른쪽 큰 숫자는 순서대로 자동) */
        label: string;
        title: string;
        intro: string;
        /** 목록 항목. 대괄호 [ ] 로 감싼 부분은 강조 표시(원장님 확인 대기 자리표시자용) */
        bullets: string[];
        /** 카드 상단 사진(선택). 비우면 표시하지 않음 */
        image: string;
      }[];
      cta: { title: string; phoneLabel: string; kakaoLabel: string };
    };
    /** 마무리 상담 — 원장 소개 바로 뒤. 번호·링크는 site.phone / site.links.kakao 사용 */
    closing: {
      title: string;
      subtitle: string;
      phoneLabel: string;
      kakaoLabel: string;
    };
    /** 자주 묻는 질문 — 마무리 상담 바로 뒤. 답변의 [대괄호] 부분은 강조(원장님 확인 대기 자리표시자) */
    faq: {
      kicker: string;
      title: string;
      body: string;
      notice: string;
      items: { q: string; a: string }[];
    };
    proof: {
      title: string;
      body: string;
      caption: string;
      /** 비포·애프터가 한 장에 함께 담긴 비교 사진 */
      photo: string;
    };
    disclaimer: string;
  };

  photoGate: {
    lockedTitle: string;
    lockedBody: string;
    loginLabel: string;
    unlockedNote: string;
    logoutLabel: string;
    cardLockedText: string;
  };

  doctor: {
    tagline: string;
    philosophy: string[];
    label: string;
    note: string[];
    name: string;
    photo: string;
    career: string[];
    footer: string;
    links: { label: string; href: string; icon: string }[];
  };

  location: {
    kicker: string;
    title: string;
    address: string;
    addressNote: string;
    hours: { day: string; time: string }[];
    /** 지도 임베드 — iframe src URL 또는 카카오맵 "지도 퍼가기" 스니펫 전체를 그대로 저장 */
    mapEmbedCode: string;
  };

  footer: {
    links: { label: string; href: string }[];
    bizDept: string;
    representative: string;
    bizNumber: string;
    disclaimer: string[];
    copyrightName: string;
  };
};

const B = MOBILE_BREAK;

export const defaultContent: SiteContent = {
  site: {
    name: "밝은태 한의원",
    tagline: "환골탈태하는 한의원",
    phone: "010-9813-0125",
    links: {
      kakao: "https://pf.kakao.com/_xdfDPK",
      youtube: "https://www.youtube.com/results?search_query=진액보충+한의사+김상태",
      consult: "#",
      blog: "https://blog.naver.com/dr_kst",
      instagram: "#",
    },
  },

  nav: [
    { label: "진료과목", href: "#treatment" },
    { label: "전후 사진", href: "#results" },
    { label: "원장 소개", href: "#doctor" },
    { label: "오시는 길", href: "#location" },
  ],

  hero: {
    default: {
      title: "환골탈태하는 한의원, 밝은태 한의원",
      subtitle: [
        `습관의 반복이 몸에 고착되어 구조가 된 것을${B}‘태(胎)’라 합니다`,
        "한의학적 치료와 심신수련으로 이전과 다른 새로운 몸과 마음을 회복합니다",
      ],
      image: "/images/hero-bg1.webp",
      gradient:
        "radial-gradient(120% 90% at 30% 80%, rgba(255,255,255,.40), rgba(255,255,255,0) 55%), linear-gradient(125deg, #d7d3c4 0%, #bfc0ad 50%, #9aa08a 100%)",
      cta: { label: "문의하기", href: "#", icon: "chat" },
    },
    tracks: {
      stomach: {
        buttonLabel: "위장 치료(장상피화생)",
        title: `위암 전단계,${B}위점막 회복을 돕습니다`,
        subtitle: [
          "장상피화생 · 위축성위염은 위점막이 변형된 위암 전단계 질환입니다",
          "체질과 위장 상태에 맞춘 한약으로 치료합니다",
        ],
        image: "/images/hero-bg3.webp",
        gradient:
          "radial-gradient(120% 90% at 28% 18%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%), linear-gradient(125deg, #e5ddce 0%, #c9bea7 45%, #ada284 100%)",
        cta: { label: "자세히보기", href: "#track-a" },
      },
      diet: {
        buttonLabel: "다이어트",
        title: "환골탈태 하는 다이어트,\n밝은태 다이어트",
        subtitle: [
          "살찌는 습관이 몸에 굳은 것, 그것이 ‘태(胎)’입니다.",
          "체중과 함께 태까지 바꿔, 뺀 몸무게를 지켜가도록 돕습니다.",
        ],
        image: "/images/hero-bg2.webp",
        gradient:
          "radial-gradient(120% 90% at 72% 20%, rgba(255,255,255,.35), rgba(255,255,255,0) 55%), linear-gradient(125deg, #cabbb4 0%, #b5a29c 50%, #8f7d78 100%)",
        cta: { label: "자세히보기", href: "#track-b" },
      },
    },
  },

  treatment: {
    kicker: "체질과 상태에 맞춘 한약 처방",
    title: "밝은태 진료과목",
    tracks: [
      {
        id: "track-a",
        label: "위암 전단계, 위점막을 돌보는 한약 치료",
        title: "장상피화생 · 위축성위염",
        desc: "위점막이 변형되어 발생하는 위암 전단계 질환. 개인의 체질과 위장 상태에 맞춘 한약으로 위점막 회복을 돕습니다.",
        caption: "내시경 전 · 후 비교",
        image: "/images/track-a.jpg",
        href: "#track-a",
        cta: "자세히보기",
      },
      {
        id: "track-b",
        label: "환골탈태하는 다이어트",
        title: "밝은태 다이어트",
        desc: "“요요는 살이 찌는 습관, ‘태(胎)’를 바꾸지 않았기 때문입니다.” 살이 찌는 ‘태(胎)’ 자체를 바꾸는 다이어트 한약 처방입니다.",
        caption: "인바디 전 · 후 비교",
        image: "/images/track-b.jpg",
        href: "#track-b",
        cta: "자세히보기",
      },
    ],
  },

  reviews: {
    kicker: "REAL REVIEW",
    title: "밝은태 한의원을 이용하신\n분들의 솔직한 후기입니다",
    subtitle: "먼저 경험하신 분들의 솔직한 이야기를 확인해보세요",
    loginLabel: "3초만에 로그인하고 후기보기",
    unlockedNote: "후기 열람 중",
    logoutLabel: "열람 종료",
    disclaimer: "* 개인차가 있을 수 있습니다",
    items: [
      { name: "", photo: "", quote: ["", ""] },
      { name: "", photo: "", quote: ["", ""] },
      { name: "", photo: "", quote: ["", ""] },
    ],
  },

  trackA: {
    kicker: "장상피화생 · 위축성위염",
    title: "위점막의 변화,\n회복을 목표로 합니다",
    lead: "장상피화생과 위축성위염은 위점막이 장(腸) 점막처럼 변형되는 질환으로, 위암 전(前)단계로 봅니다.\n밝은태 한의원은 마른 위점막에 진액을 보충하는 한약 치료로 접근합니다.",
    causesTitle: "위점막은 왜 변할까요",
    causes: [
      {
        q: "왜 생기나요?",
        a: [
          "위점막을 보호하는 진액이 마르면 염증 반응이 지속되고,",
          "위점막이 건조해지며 점막 세포가 변형됩니다.",
        ],
      },
      {
        q: "진액은 왜 마르나요?",
        a: [
          "진액은 나이가 들며 자연히 줄어듭니다.",
          "과음·흡연·카페인·스트레스·수면부족은 이 과정을 더 빠르게 만듭니다.",
        ],
      },
      {
        q: "점막이 어떻게 변하나요?",
        a: [
          "메마른 위 세포는 손상되고, 위(胃) 점막이 장(腸) 점막처럼 변형됩니다.",
          "이것이 ‘장상피화생’입니다.",
        ],
      },
      {
        q: "그대로 두면?",
        a: [
          "만성 염증이 이어지며 위축성위염·장상피화생이 진행되고,",
          "위암 위험이 높아지는 전(前)단계로 봅니다.",
        ],
      },
    ],
    proof: {
      title: "치료 후, 내시경으로 확인합니다",
      body: "치료 전후의 내시경 소견을 환자와 함께 보며 변화를 확인합니다.\n결과를 직접 확인시켜 드리는 것은 치료에 대한 책임입니다.",
      caption: "내시경 전 · 후 비교",
      photo: "",
    },
    disclaimer:
      "한약은 한의사 진료 후에만 처방하며, 복용 시 개인의 체질과 상태에 따라 소화불량·속쓰림 등의 증상이 나타날 수 있고 회복 기간과 정도에는 개인차가 있습니다.",
  },

  trackB: {
    kicker: "밝은태 다이어트",
    title: "요요 없는 다이어트는\n‘태(胎)’부터 바꿉니다",
    lead: `요요는 살이 찌는 습관, ‘태(胎)’를 바꾸지 않았기 때문입니다.\n밝은태 다이어트는 단순 감량이 아니라 살이 찌는${B}‘태(胎)’ — 식욕·대사·생활 패턴 — 를 함께 바꾸는${B} 한약 치료입니다.`,
    effectsTitle: "밝은태 다이어트 한약은 이렇게 작용합니다",
    effects: [
      {
        label: "",
        term: "식욕 조절 · 폭식 예방",
        desc: "다이어트 실패의 큰 원인은 폭식입니다.\n식욕은 의지만으로 조절되지 않기에, 한약으로 식욕을 다스려 폭식을 줄이도록 돕습니다.",
      },
      {
        label: "",
        term: "대사 증진",
        desc: "교감신경을 활성화해 기초대사를 끌어올립니다.\n에너지 소비의 약 70%를 차지하는 기초대사가 높을수록 체중 감소에 유리합니다.",
      },
      {
        label: "",
        term: "체지방 · 내장지방 분해",
        desc: "혈액순환을 도와 체지방 분해를 촉진하고,\n장기 사이에 낀 내장지방까지 태우도록 돕습니다.",
      },
      {
        label: "",
        term: "혈당 안정",
        desc: "혈당을 안정시켜 지방 저장 호르몬인 인슐린 분비를 조절하고, 섭취한 영양소가 지방으로 쌓이는 것을 줄이도록 돕습니다.",
      },
    ],
    fit: {
      title: "시작하는 이유는 달라도,\n원하는 건 같습니다",
      items: [
        "다이어트를 어디서부터 해야 할지 막막한 분",
        "식욕 조절이 가장 어려운 분",
        "적은 감량조차 유지가 어려우신 분",
        "예전보다 살이 쉽게 찌고 잘 빠지지 않는 분",
        "열심히 해도 안 빠지는 이유를 모르겠는 분",
      ],
      closing: "건강하게 빼고, 그 몸 그대로 살아가는 것.\n밝은태 다이어트가 함께 만들어갑니다.",
    },
    phases: {
      kicker: "밝은태 다이어트의 차별점",
      title: "감량으로 끝나지 않습니다\n유지까지가 밝은태 다이어트입니다",
      steps: [
        {
          label: "STEP 1",
          name: "감량기",
          tagline: "건강하게 빼기",
          body: "원장 1:1 맞춤 진료와, 체질과 식욕·대사 상태에 맞춘 한약으로 무리 없이 체중을 줄입니다.",
          note: "목표 체중과 몸 상태에 따라 기간을 정합니다",
          image: "",
        },
        {
          label: "STEP 2",
          name: "유지기",
          tagline: "내 몸으로 만들기",
          body: "일상 식사로 돌아가는 과정을 꾸준히 관리해, 남들처럼 먹어도 유지되는 몸을 목표로 합니다.",
          note: "감량한 체중이 몸에 자리 잡을 때까지 이어갑니다",
          image: "",
        },
      ],
      emphasis: "목표 체중에 도달한 날이 아니라, 그 체중이 편안해지는 날을 목표로 합니다.",
    },
    promise: {
      kicker: "밝은태의 관리 약속",
      title: "처음 상담부터 유지기 마지막 날까지,\n원장이 직접 봅니다",
      cards: [
        {
          label: "POINT 01",
          title: "원장 직접 진료",
          highlight: "",
          desc: "상담부터 처방, 관리까지\n원장이 직접 맡습니다",
        },
        {
          label: "POINT 02",
          title: "매주 몸 상태 체크",
          highlight: "매주 몸 상태 체크",
          desc: "체중·컨디션·식욕 변화를\n원장이 매주 확인합니다",
        },
        {
          label: "POINT 03",
          title: "한약·식단 조정",
          highlight: "조정",
          desc: "확인한 몸 상태에 맞게\n한약을 조정·처방하고\n식단도 함께 잡습니다",
        },
        {
          label: "POINT 04",
          title: "유지기까지 관리",
          highlight: "유지기",
          desc: "감량이 끝난 뒤에도\n체중이 자리 잡을 때까지\n관리를 이어갑니다",
        },
      ],
      banner: {
        heading: "",
        body: "",
        title: "감량한 체중이 다시 돌아오지 않도록, 유지기까지 원장이 직접 관리합니다",
        note: "※ 관리 기간과 처방은 개인의 몸 상태에 따라 달라지며, 매주 경과를 보고 원장이 정합니다.",
      },
      cta: {
        title: "내 몸은 얼마나 걸릴까요?",
        phoneLabel: "전화 상담하기",
        kakaoLabel: "카카오톡 상담하기",
      },
    },
    prescription: {
      kicker: "체질과 생활습관에 맞춘",
      title: "한의사 진맥 후,\n1:1 맞춤 처방으로 조제합니다",
      body: "생활 습관과 몸 상태에 따라 탕약과 환약 등 알맞은 제형으로 처방합니다.",
      note: "구체적인 프로그램 단계와 기간은 원장 상담 시 안내드립니다.",
    },
    basis: {
      cards: [
        {
          label: "POINT",
          title: "모두에게 같은 한약을\n처방하지 않습니다",
          intro: "진맥으로 체질을 살피고,\n아래 내용을 함께 보고 처방합니다.",
          bullets: [
            "식욕이 강한 시간대와 패턴",
            "소화 상태와 위장 컨디션",
            "카페인 민감도 · 수면 상태",
            "지난 다이어트 경험",
            "[원장님 실제 처방 기준 추가]",
          ],
          image: "",
        },
        {
          label: "POINT",
          title: "무엇이 들어가는지\n숨기지 않습니다",
          intro: "처방에 쓰는 주요 약재와\n조제 과정을 공개합니다.",
          bullets: [
            "주요 약재 [목록]",
            "조제 [원내 직접 조제 / 원외탕전]",
            "약재 [원산지 · 인증 여부]",
          ],
          image: "",
        },
        {
          label: "POINT",
          title: "바쁜 하루에도\n챙기기 쉽게",
          intro: "먹기 편해야 꾸준히 이어갈 수 있습니다.",
          bullets: ["제형 [탕약 / 환약 / 정제]", "하루 [○]회, [식전 ○분]", "맛 · 휴대 [특징]"],
          image: "",
        },
      ],
      cta: {
        title: "내 체질엔 어떤 처방이 맞을까요?",
        phoneLabel: "전화 상담하기",
        kakaoLabel: "카카오톡 상담하기",
      },
    },
    closing: {
      title: "이번 다이어트가,\n마지막 다이어트가 되도록",
      subtitle: "상담만 받아보셔도 괜찮습니다.\n내 몸에 맞는 방법인지, 먼저 확인해 보세요.",
      phoneLabel: "전화 상담하기",
      kakaoLabel: "카카오톡 상담하기",
    },
    faq: {
      kicker: "자주 묻는 질문",
      title: "속이 편해야\n오래 갑니다",
      body: "위장 질환을 진료해 온 원장이\n소화 상태부터 확인하고 처방합니다.\n복용 중 불편함이 생기면\n경과를 보며 처방을 조절합니다.",
      notice:
        "복용 초기 두근거림 · 불면 · 소화 불편 등이 있을 수 있으며, 효과와 반응은 개인에 따라 차이가 있을 수 있습니다.",
      items: [
        { q: "마황이 들어가나요?", a: "[사용 여부 · 체질에 따른 용량 조절 방식]" },
        {
          q: "다이어트 한약, 속이 불편하진 않나요?",
          a: "소화 상태를 먼저 진찰하고 처방합니다. [구체적 조절 방법]",
        },
        { q: "커피를 마셔도 되나요? 잠은 잘 오나요?", a: "[카페인 · 복용 시간 안내]" },
        {
          q: "한약을 끊으면 다시 찌지 않나요?",
          a: "유지기에 한약을 단계적으로 줄이며 관리합니다. [유지기 방식]",
        },
        { q: "비대면으로도 처방받을 수 있나요?", a: "[가능 여부 · 진행 방식]" },
      ],
    },
    proof: {
      title: "변화는 인바디로 확인합니다",
      body: "시작과 마무리의 인바디 결과를 함께 보며 체중·체지방·근육량의 변화를 확인합니다.",
      caption: "인바디 전 · 후 비교",
      photo: "",
    },
    disclaimer:
      "다이어트 한약은 의약품으로 한의사 진료 후에만 처방하며, 복용 시 개인의 차이에 따라 두근거림·어지러움 등의 증상이 있을 수 있습니다.",
  },

  photoGate: {
    lockedTitle: "전후 사진은 로그인 후 열람하실 수 있습니다",
    lockedBody:
      "의료법에 따라 치료 전후 비교 사진은 본인 확인을 거친 분에게만 제공합니다. 카카오 인증만 확인하며 회원정보는 저장하지 않습니다.",
    loginLabel: "3초만에 로그인하고 열람하기",
    unlockedNote: "전후 사진 열람 중",
    logoutLabel: "열람 종료",
    cardLockedText: "전후 비교 이미지는\n로그인 후 열람하실 수 있습니다",
  },

  doctor: {
    tagline: "필요한 만큼의 한약, 정직한 진료",
    philosophy: [
      "과한 처방이 아니라,",
      "지금 몸에 필요한 만큼의 한약과 생활의 교정을",
      "정직하게 권합니다.",
    ],
    label: "BALGEUNTAE DOCTOR",
    note: ["밝은태의 진료는 증상 너머,", "몸의 구조와 습관까지 봅니다."],
    name: "김상태 원장",
    photo: "",
    career: [
      "[한의학 학력 — 원장님 원고 필요]",
      "[전(前) 근무 이력 — 원장님 원고 필요]",
      "[전문 분야 · 학회 활동 — 원장님 원고 필요]",
      "유튜브 ‘진액보충 한의사 김상태’ 운영",
    ],
    footer: "밝은태 한의원 | 진료: 위장질환(장상피화생·위축성위염) · 다이어트 · 대표원장 김상태",
    links: [
      {
        label: "유튜브 채널",
        href: "https://www.youtube.com/results?search_query=진액보충+한의사+김상태",
        icon: "/images/youtube-icon.png",
      },
      {
        label: "네이버 블로그",
        href: "https://blog.naver.com/dr_kst",
        icon: "/images/blog-icon.png",
      },
    ],
  },

  location: {
    kicker: "LOCATION",
    title: "밝은태 한의원으로 오시는 길",
    address: "서울 송파구 백제고분로 358 우전빌딩 5층",
    addressNote: "2026년 9월 개원 예정",
    hours: [
      { day: "평일", time: "[00:00 – 00:00]" },
      { day: "토요일", time: "[00:00 – 00:00]" },
      { day: "점심시간", time: "[00:00 – 00:00]" },
      { day: "일요일 · 공휴일", time: "휴진" },
    ],
    mapEmbedCode: `new daum.roughmap.Lander({
  "timestamp" : "1789884165284",
  "key" : "v2a3uhnuqd5",
  "mapWidth" : "640",
  "mapHeight" : "360"
}).render();`,
  },

  footer: {
    links: [],
    bizDept: "위장질환(장상피화생·위축성위염) · 다이어트",
    representative: "대표원장 김상태",
    bizNumber: "[사업자등록번호 — 원장님 확인]",
    disclaimer: [
      "본 홈페이지에 게시된 치료 전후 사진 및 치료 사례는 환자 동의하에 게재되었으며, 치료 효과는 개인에 따라 차이가 있을 수 있습니다.",
      "치료 전 의료진과 충분히 상담하시기 바랍니다.",
    ],
    copyrightName: "밝은태 한의원",
  },
};
