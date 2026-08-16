import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

const dict = {
  brand: { en: "MP Kaam Darpan", hi: "एमपी काम दर्पण" },
  brandSub: { en: "Government Works Transparency Portal", hi: "शासकीय कार्य पारदर्शिता पोर्टल" },
  navHome: { en: "Home", hi: "मुख्य पृष्ठ" },
  navWorks: { en: "All Works", hi: "सभी कार्य" },
  navMap: { en: "Map", hi: "मानचित्र" },
  navDashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  navTrack: { en: "Track Complaint", hi: "शिकायत ट्रैक करें" },
  navLogin: { en: "Login", hi: "लॉगिन" },
  navLogout: { en: "Logout", hi: "लॉगआउट" },
  navMyComplaints: { en: "My Complaints", hi: "मेरी शिकायतें" },
  navAdmin: { en: "Official Panel", hi: "अधिकारी पैनल" },

  heroTitle: { en: "Every rupee sanctioned. Every work listed. Publicly.", hi: "हर स्वीकृत रुपया। हर कार्य सार्वजनिक।" },
  heroBody: {
    en: "From a streetlight repair to a river bridge — see the exact sanctioned budget, the order number, the contractor and the deadline. If anyone demands money beyond the sanctioned amount, report it here.",
    hi: "स्ट्रीट लाइट मरम्मत से लेकर नदी पुल तक — स्वीकृत बजट, आदेश क्रमांक, ठेकेदार और समय-सीमा देखें। यदि कोई स्वीकृत राशि से अधिक पैसा मांगे, यहाँ शिकायत करें।",
  },
  heroSearch: { en: "Search a work, village, order number…", hi: "कार्य, गाँव, आदेश क्रमांक खोजें…" },
  browseWorks: { en: "Browse all works", hi: "सभी कार्य देखें" },
  reportNow: { en: "Report overcharging", hi: "अधिक वसूली की शिकायत" },

  statWorks: { en: "Works listed", hi: "सूचीबद्ध कार्य" },
  statSanctioned: { en: "Total sanctioned", hi: "कुल स्वीकृत" },
  statSpent: { en: "Total spent", hi: "कुल व्यय" },
  statDelayed: { en: "Delayed works", hi: "विलंबित कार्य" },
  statComplaints: { en: "Complaints filed", hi: "दर्ज शिकायतें" },
  statAlerts: { en: "Overcharging alerts", hi: "अधिक वसूली अलर्ट" },

  filters: { en: "Filters", hi: "फ़िल्टर" },
  district: { en: "District", hi: "ज़िला" },
  department: { en: "Department", hi: "विभाग" },
  status: { en: "Status", hi: "स्थिति" },
  budgetRange: { en: "Budget range", hi: "बजट सीमा" },
  all: { en: "All", hi: "सभी" },
  search: { en: "Search", hi: "खोजें" },
  clear: { en: "Clear", hi: "साफ़ करें" },
  resultsCount: { en: "works found", hi: "कार्य मिले" },
  noResults: { en: "No works match these filters.", hi: "इन फ़िल्टरों से कोई कार्य नहीं मिला।" },

  planned: { en: "Planned", hi: "प्रस्तावित" },
  in_progress: { en: "In Progress", hi: "प्रगति पर" },
  delayed: { en: "Delayed", hi: "विलंबित" },
  completed: { en: "Completed", hi: "पूर्ण" },

  sanctioned: { en: "Sanctioned budget", hi: "स्वीकृत बजट" },
  spent: { en: "Spent so far", hi: "अब तक व्यय" },
  orderNo: { en: "Government order no.", hi: "शासकीय आदेश क्रमांक" },
  viewOrder: { en: "View sanction document", hi: "स्वीकृति दस्तावेज़ देखें" },
  contractor: { en: "Contractor / Agency", hi: "ठेकेदार / एजेंसी" },
  startDate: { en: "Start date", hi: "प्रारंभ तिथि" },
  deadline: { en: "Official deadline", hi: "निर्धारित समय-सीमा" },
  timeRemaining: { en: "Time remaining", hi: "शेष समय" },
  overdueBy: { en: "Overdue by", hi: "विलंब" },
  days: { en: "days", hi: "दिन" },
  location: { en: "Location", hi: "स्थान" },
  editLog: { en: "Public edit log", hi: "सार्वजनिक संशोधन लॉग" },
  noEdits: { en: "No changes recorded yet. Any future change to budget, status or deadline appears here permanently.", hi: "अभी कोई परिवर्तन दर्ज नहीं। बजट, स्थिति या समय-सीमा में कोई भी भावी परिवर्तन यहाँ स्थायी रूप से दिखेगा।" },
  complaintsOnWork: { en: "Complaints on this work", hi: "इस कार्य पर शिकायतें" },
  noComplaints: { en: "No complaints filed on this work.", hi: "इस कार्य पर कोई शिकायत दर्ज नहीं।" },

  reportOvercharge: { en: "Report Overcharging", hi: "अधिक वसूली की शिकायत करें" },
  reportDelay: { en: "Report Delay / Poor Quality", hi: "विलंब / घटिया गुणवत्ता की शिकायत" },
  amountDemanded: { en: "Extra money demanded (₹)", hi: "मांगी गई अतिरिक्त राशि (₹)" },
  accusedName: { en: "Name of official / contractor (if known)", hi: "अधिकारी / ठेकेदार का नाम (यदि ज्ञात हो)" },
  accusedDesignation: { en: "Designation", hi: "पदनाम" },
  incidentDate: { en: "When did this happen?", hi: "यह कब हुआ?" },
  describe: { en: "Describe what happened", hi: "क्या हुआ, विस्तार से बताएं" },
  evidence: { en: "Photo / video / audio / receipt (optional)", hi: "फोटो / वीडियो / ऑडियो / रसीद (वैकल्पिक)" },
  anonymous: { en: "File anonymously (your identity will not be stored)", hi: "गुप्त रूप से शिकायत करें (आपकी पहचान दर्ज नहीं होगी)" },
  contactPhone: { en: "Your mobile number (kept private)", hi: "आपका मोबाइल नंबर (गोपनीय)" },
  submit: { en: "Submit complaint", hi: "शिकायत दर्ज करें" },
  submitting: { en: "Submitting…", hi: "दर्ज हो रही है…" },
  submitted: { en: "Complaint registered", hi: "शिकायत दर्ज हो गई" },
  yourTrackingNo: { en: "Your tracking number", hi: "आपका ट्रैकिंग नंबर" },
  saveTracking: { en: "Save this number. Use it to check the status of your complaint at any time.", hi: "इस नंबर को सुरक्षित रखें। इससे आप कभी भी शिकायत की स्थिति देख सकते हैं।" },
  overchargeAlertMsg: { en: "Overcharging Alert raised: the amount demanded exceeds the sanctioned budget for this work. Escalated immediately.", hi: "अधिक वसूली अलर्ट: मांगी गई राशि इस कार्य के स्वीकृत बजट से अधिक है। तत्काल उच्च स्तर पर भेजी गई।" },

  trackTitle: { en: "Track your complaint", hi: "अपनी शिकायत ट्रैक करें" },
  trackHint: { en: "Enter the tracking number you received, e.g. MPT-2026-001001", hi: "प्राप्त ट्रैकिंग नंबर दर्ज करें, जैसे MPT-2026-001001" },
  notFound: { en: "No complaint found with that tracking number.", hi: "इस ट्रैकिंग नंबर से कोई शिकायत नहीं मिली।" },
  actionLog: { en: "Action history", hi: "कार्यवाही इतिहास" },
  escalationLevel: { en: "Escalation level", hi: "एस्केलेशन स्तर" },

  lvl1: { en: "Department Officer", hi: "विभागीय अधिकारी" },
  lvl2: { en: "Department Head", hi: "विभाग प्रमुख" },
  lvl3: { en: "District Collector", hi: "जिला कलेक्टर" },
  lvl4: { en: "Anti-Corruption Bureau", hi: "भ्रष्टाचार निरोधक ब्यूरो" },

  submittedS: { en: "Submitted", hi: "दर्ज" },
  under_review: { en: "Under review", hi: "समीक्षाधीन" },
  action_taken: { en: "Action taken", hi: "कार्यवाही की गई" },
  resolved: { en: "Resolved", hi: "निराकृत" },
  rejected: { en: "Rejected", hi: "अस्वीकृत" },

  dashTitle: { en: "Public accountability dashboard", hi: "सार्वजनिक जवाबदेही डैशबोर्ड" },
  byDistrict: { en: "District-wise budget", hi: "ज़िलावार बजट" },
  byDepartment: { en: "Department-wise budget", hi: "विभागवार बजट" },
  heatmap: { en: "Corruption heat map", hi: "भ्रष्टाचार हीट मैप" },
  heatmapHint: { en: "Districts and departments ranked by overcharging complaints.", hi: "अधिक वसूली शिकायतों के आधार पर ज़िले एवं विभाग।" },
  statusSplit: { en: "Works by status", hi: "स्थिति अनुसार कार्य" },

  mapTitle: { en: "Works map", hi: "कार्य मानचित्र" },
  loginTitle: { en: "Citizen & Official Login", hi: "नागरिक एवं अधिकारी लॉगिन" },
  mobileOtp: { en: "Mobile OTP", hi: "मोबाइल ओटीपी" },
  emailPass: { en: "Email", hi: "ईमेल" },
  mobileNumber: { en: "Mobile number", hi: "मोबाइल नंबर" },
  sendOtp: { en: "Send OTP", hi: "ओटीपी भेजें" },
  enterOtp: { en: "Enter the 6-digit OTP", hi: "6 अंकों का ओटीपी दर्ज करें" },
  verify: { en: "Verify & sign in", hi: "सत्यापित कर लॉगिन करें" },
  email: { en: "Email address", hi: "ईमेल पता" },
  password: { en: "Password", hi: "पासवर्ड" },
  signIn: { en: "Sign in", hi: "साइन इन" },
  signUp: { en: "Create account", hi: "खाता बनाएँ" },
  google: { en: "Continue with Google", hi: "Google से जारी रखें" },
  fullName: { en: "Full name", hi: "पूरा नाम" },

  myComplaints: { en: "My complaints", hi: "मेरी शिकायतें" },
  noneYet: { en: "You have not filed any complaint yet.", hi: "आपने अभी तक कोई शिकायत दर्ज नहीं की है।" },

  adminTitle: { en: "Official panel", hi: "अधिकारी पैनल" },
  adminNoAccess: { en: "This panel is only for authorised government officials.", hi: "यह पैनल केवल अधिकृत शासकीय अधिकारियों के लिए है।" },
  updateStatus: { en: "Update status", hi: "स्थिति अद्यतन करें" },
  spentUpdate: { en: "Amount spent (₹)", hi: "व्यय राशि (₹)" },
  save: { en: "Save", hi: "सहेजें" },
  respond: { en: "Record response", hi: "उत्तर दर्ज करें" },
  actionTaken: { en: "Action taken", hi: "की गई कार्यवाही" },
  reasonRequired: { en: "Reason (published publicly, mandatory)", hi: "कारण (सार्वजनिक रूप से प्रकाशित, अनिवार्य)" },

  footerNote: {
    en: "Sanctioned amounts are published from official government orders and tender documents. Every edit is logged publicly.",
    hi: "स्वीकृत राशियाँ शासकीय आदेशों एवं निविदा दस्तावेज़ों से प्रकाशित हैं। प्रत्येक संशोधन सार्वजनिक रूप से दर्ज होता है।",
  },
  demoNote: { en: "Demonstration data — sample works for illustration.", hi: "प्रदर्शन डेटा — उदाहरण हेतु नमूना कार्य।" },
} as const;

export type TKey = keyof typeof dict;

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("mpkd-lang");
    if (stored === "hi" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("mpkd-lang", l);
    document.documentElement.lang = l;
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useContext(LangContext);
  return useCallback((key: TKey) => dict[key][lang], [lang]);
}

/** Picks the Hindi or English variant of a bilingual database row. */
export function useBi() {
  const { lang } = useContext(LangContext);
  return useCallback(
    (en: string | null | undefined, hi: string | null | undefined) =>
      (lang === "hi" ? hi || en : en || hi) ?? "",
    [lang],
  );
}
