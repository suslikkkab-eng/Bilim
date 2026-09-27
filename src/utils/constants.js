export const SUBJECTS = [
  { id: 'math', emoji: '🔢', name: 'Математика', color: '#4f9cf9', gradient: 'from-blue-500/20 to-blue-600/5' },
  { id: 'history', emoji: '📜', name: 'Қазақстан тарихы', color: '#f97b4f', gradient: 'from-orange-500/20 to-orange-600/5' },
  { id: 'geography', emoji: '🌍', name: 'География', color: '#3ecf8e', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  { id: 'biology', emoji: '🧬', name: 'Биология', color: '#7b5cf9', gradient: 'from-purple-500/20 to-purple-600/5' },
  { id: 'chemistry', emoji: '⚗️', name: 'Химия', color: '#f5c842', gradient: 'from-yellow-500/20 to-yellow-600/5' },
  { id: 'physics', emoji: '⚡', name: 'Физика', color: '#f96060', gradient: 'from-red-500/20 to-red-600/5' },
  { id: 'kazakh', emoji: '🇰🇿', name: 'Қазақ тілі', color: '#3ecf8e', gradient: 'from-teal-500/20 to-teal-600/5' },
  { id: 'russian', emoji: '📖', name: 'Орыс тілі', color: '#8da0c4', gradient: 'from-slate-500/20 to-slate-600/5' },
  { id: 'english', emoji: '🌐', name: 'Ағылшын тілі', color: '#4f9cf9', gradient: 'from-sky-500/20 to-sky-600/5' },
]

export const QUESTIONS_DB = {
  math: [
    {
      id: 1,
      question: 'log₂(8) + log₂(4) мәнін табыңыз',
      options: ['5', '6', '7', '4'],
      answer: 0,
      explanation: 'log₂(8) = 3, log₂(4) = 2, сондықтан 3 + 2 = 5',
    },
    {
      id: 2,
      question: '2x² - 5x + 3 = 0 теңдеуінің түбірлерін табыңыз',
      options: ['x=1 және x=1.5', 'x=2 және x=3', 'x=-1 және x=-1.5', 'x=1 және x=3'],
      answer: 0,
      explanation: 'Дискриминант: D = 25 - 24 = 1. x₁ = (5+1)/4 = 1.5, x₂ = (5-1)/4 = 1',
    },
    {
      id: 3,
      question: 'sin²(α) + cos²(α) = ?',
      options: ['0', '2', '1', 'sin(2α)'],
      answer: 2,
      explanation: 'Бұл тригонометрияның негізгі тождествасы — әрқашан 1-ге тең',
    },
    {
      id: 4,
      question: '∫(2x + 3)dx = ?',
      options: ['x² + 3x + C', '2x² + 3 + C', 'x² + C', '2 + C'],
      answer: 0,
      explanation: '∫(2x)dx = x², ∫3dx = 3x, сондықтан жауап x² + 3x + C',
    },
    {
      id: 5,
      question: 'Геометриялық прогрессияның алғашқы мүшесі b₁=3, қатысы q=2. b₅=?',
      options: ['24', '48', '36', '16'],
      answer: 1,
      explanation: 'b₅ = b₁ · q⁴ = 3 · 2⁴ = 3 · 16 = 48',
    },
  ],
  history: [
    {
      id: 1,
      question: 'Қазақ хандығы қай жылы құрылды?',
      options: ['1455', '1465', '1475', '1485'],
      answer: 1,
      explanation: 'Қазақ хандығы 1465 жылы Жәнібек пен Керей сұлтандар тарапынан құрылды',
    },
    {
      id: 2,
      question: 'Қазақстан Республикасы тәуелсіздігін қай жылы жариялады?',
      options: ['1990', '1991', '1992', '1993'],
      answer: 1,
      explanation: '1991 жылы 16 желтоқсанда Қазақстан Республикасының тәуелсіздігі жарияланды',
    },
    {
      id: 3,
      question: 'Алаш Орда үкіметі қай жылы құрылды?',
      options: ['1916', '1917', '1918', '1919'],
      answer: 1,
      explanation: 'Алаш Орда автономиясы 1917 жылдың желтоқсанында жарияланды',
    },
    {
      id: 4,
      question: 'Ақмола қаласы қай жылы астана болды?',
      options: ['1995', '1996', '1997', '1998'],
      answer: 2,
      explanation: '1997 жылдың 10 желтоқсанында Ақмола (кейін Астана, қазір Астана) астана болып жарияланды',
    },
    {
      id: 5,
      question: 'Кенесары Қасымовтың көтерілісі қандай жылдарды қамтыды?',
      options: ['1820-1825', '1837-1847', '1860-1865', '1916-1917'],
      answer: 1,
      explanation: 'Кенесары Қасымовтың ұлт-азаттық көтерілісі 1837-1847 жылдары болды',
    },
  ],
  geography: [
    {
      id: 1,
      question: 'Қазақстанның ең биік шыңы қайсы?',
      options: ['Белуха', 'Хан Тәңірі', 'Талғар', 'Мраморная стена'],
      answer: 1,
      explanation: 'Хан Тәңірі (7010 м) — Қазақстанның ең биік шыңы',
    },
    {
      id: 2,
      question: 'Қазақстан аумағы бойынша әлемде нешінші орынды алады?',
      options: ['7-ші', '8-ші', '9-шы', '10-шы'],
      answer: 2,
      explanation: 'Қазақстан 2 724 900 км² аумағымен әлемде 9-шы орынды алады',
    },
    {
      id: 3,
      question: 'Балқаш көлі қандай ерекшелігімен белгілі?',
      options: [
        'Ең терең көл',
        'Бір бөлігі тұщы, бір бөлігі тұзды су',
        'Ең үлкен тұзды көл',
        'Ең ыстық көл',
      ],
      answer: 1,
      explanation: 'Балқаш — батыс бөлігі тұщы, шығыс бөлігі тұзды болып келетін бірегей көл',
    },
  ],
  biology: [
    {
      id: 1,
      question: 'Фотосинтез процесінде қандай зат түзіледі?',
      options: ['CO₂', 'O₂', 'N₂', 'H₂'],
      answer: 1,
      explanation: 'Фотосинтез кезінде су мен көмірқышқыл газынан глюкоза мен оттегі түзіледі',
    },
    {
      id: 2,
      question: 'ДНҚ-ның негіздері: аденин A деген нуклеотидпен жұп болады?',
      options: ['Гуанин (G)', 'Цитозин (C)', 'Тимин (T)', 'Урацил (U)'],
      answer: 2,
      explanation: 'ДНҚ-да А-Т және Г-Ц жұптары болады (Чаргафф ережесі)',
    },
  ],
  chemistry: [
    {
      id: 1,
      question: 'Периодтық жүйеде 1-ші топтың 2-ші периодындағы элемент?',
      options: ['Na', 'Li', 'K', 'Rb'],
      answer: 1,
      explanation: 'Литий (Li) — 2-ші период, 1-ші топтың элементі',
    },
    {
      id: 2,
      question: 'NaCl-дің молярлық массасы қанша?',
      options: ['48 г/моль', '58 г/моль', '68 г/моль', '78 г/моль'],
      answer: 1,
      explanation: 'Na=23, Cl=35 → M(NaCl) = 23 + 35 = 58 г/моль',
    },
  ],
  physics: [
    {
      id: 1,
      question: 'Ньютонның 2-ші заңы бойынша F=?',
      options: ['m+a', 'm/a', 'm·a', 'a/m'],
      answer: 2,
      explanation: 'F = ma — күш массаның үдеуге көбейтіндісіне тең',
    },
    {
      id: 2,
      question: 'Жарықтың вакуумдегі жылдамдығы шамамен қанша?',
      options: ['3×10⁸ м/с', '3×10⁶ м/с', '3×10¹⁰ м/с', '3×10⁴ м/с'],
      answer: 0,
      explanation: 'c ≈ 3×10⁸ м/с — жарықтың вакуумдегі жылдамдығы',
    },
  ],
  kazakh: [
    {
      id: 1,
      question: '"Бақыт" сөзінің синонимі қайсысы?',
      options: ['Қайғы', 'Шаттық', 'Ашу', 'Мұң'],
      answer: 1,
      explanation: '"Шаттық" сөзі де "бақыт" мағынасына жақын — қуаныш, қошемет дегенді білдіреді',
    },
  ],
  russian: [
    {
      id: 1,
      question: 'Какое слово является антонимом к слову "горячий"?',
      options: ['Тёплый', 'Холодный', 'Прохладный', 'Ледяной'],
      answer: 1,
      explanation: '"Холодный" — прямой антоним слова "горячий"',
    },
  ],
  english: [
    {
      id: 1,
      question: 'What is the past tense of "go"?',
      options: ['Goed', 'Went', 'Gone', 'Goes'],
      answer: 1,
      explanation: '"Went" is the simple past tense of the irregular verb "go"',
    },
  ],
}

export const ROLE_LABELS = {
  student: 'Оқушы',
  teacher: 'Мұғалім',
}

export const LEVEL_THRESHOLDS = [
  { min: 0, label: 'Жаңадан бастаушы', color: '#8da0c4' },
  { min: 200, label: 'Білімгер', color: '#3ecf8e' },
  { min: 500, label: 'Дарынды', color: '#4f9cf9' },
  { min: 1000, label: 'Шебер', color: '#7b5cf9' },
  { min: 2000, label: 'Сарапшы', color: '#f5c842' },
]

export const getLevel = (totalScore) => {
  const levels = [...LEVEL_THRESHOLDS].reverse()
  return levels.find(l => totalScore >= l.min) || LEVEL_THRESHOLDS[0]
}
