
import { Card, Rule, CardStatus, ItemType, StudyTopic } from './types';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const INITIAL_CARDS: Card[] = [
  {
    id: '1',
    front: 'Serendipity',
    back: 'Интуитивная прозорливость, счастливая случайность',
    example: 'It was serendipity that I found this shop.',
    tags: ['vocabulary', 'advanced'],
    level: 'C1',
    type: ItemType.Word,
    isFavorite: false,
    relatedRuleIds: [],
    status: CardStatus.New,
    viewCount: 0,
    successCount: 0,
    errorCount: 0,
    lastShownDate: null,
    consecutiveSuccesses: 0
  },
  {
    id: '2',
    front: 'Piece of cake',
    back: 'Проще простого (пара пустяков)',
    example: 'The exam was a piece of cake.',
    tags: ['idioms', 'casual'],
    level: 'B1',
    type: ItemType.Phrase,
    isFavorite: true,
    relatedRuleIds: [],
    status: CardStatus.Learning,
    viewCount: 2,
    successCount: 1,
    errorCount: 1,
    lastShownDate: Date.now() - 86400000,
    consecutiveSuccesses: 1
  }
];

export const INITIAL_RULES: Rule[] = [
  {
    id: 'r1',
    title: 'Present Perfect',
    explanation: 'Используется для связи прошлого с настоящим. Важен результат, а не время совершения действия.',
    examples: ['I have already finished my work.', 'Have you ever been to London?'],
    level: 'B1',
    type: ItemType.Rule,
    isFavorite: false,
    status: CardStatus.New,
    viewCount: 0,
    successCount: 0,
    errorCount: 0,
    lastShownDate: null,
    consecutiveSuccesses: 0
  }
];

// --- CURRICULUM DATA ---

export const CURRICULUM: StudyTopic[] = [
  // === A1: Beginner (15 Lessons) ===
  { id: 'a1_l1', level: 'A1', order: 1, category: 'Lesson 1', title: 'Алфавит и чтение', description: 'Базовые правила чтения и звуки.', vocabCount: 10, vocabTheme: 'Основные приветствия (Hi, Hello, Bye)' },
  { id: 'a1_l2', level: 'A1', order: 2, category: 'Lesson 2', title: 'Глагол To Be (Утверждение)', description: 'I am, You are, He is.', vocabCount: 15, vocabTheme: 'Местоимения и цифры 1–10' },
  { id: 'a1_l3', level: 'A1', order: 3, category: 'Lesson 3', title: 'Глагол To Be (Вопрос/Отрицание)', description: 'Am I? He is not.', vocabCount: 15, vocabTheme: 'Страны и национальности' },
  { id: 'a1_l4', level: 'A1', order: 4, category: 'Lesson 4', title: 'Существительные и Артикли', description: 'A/An/The и предметы.', vocabCount: 15, vocabTheme: 'Предметы в сумке и офисе' },
  { id: 'a1_l5', level: 'A1', order: 5, category: 'Lesson 5', title: 'Множественное число', description: 'Окончания -s, -es и исключения.', vocabCount: 15, vocabTheme: 'Члены семьи' },
  { id: 'a1_l6', level: 'A1', order: 6, category: 'Lesson 6', title: 'Present Simple (I/You/We/They)', description: 'Регулярные действия.', vocabCount: 15, vocabTheme: 'Базовые глаголы (live, work, speak)' },
  { id: 'a1_l7', level: 'A1', order: 7, category: 'Lesson 7', title: 'Present Simple (He/She/It)', description: 'Окончание -s у глаголов.', vocabCount: 15, vocabTheme: 'Профессии' },
  { id: 'a1_l8', level: 'A1', order: 8, category: 'Lesson 8', title: 'Вопросы с Do/Does', description: 'Как спрашивать о рутине.', vocabCount: 15, vocabTheme: 'Глаголы рутины (wake up, drink coffee)' },
  { id: 'a1_l9', level: 'A1', order: 9, category: 'Lesson 9', title: 'Притяжательные местоимения', description: 'My, Your, His, Her.', vocabCount: 15, vocabTheme: 'Одежда и цвета' },
  { id: 'a1_l10', level: 'A1', order: 10, category: 'Lesson 10', title: 'There is / There are', description: 'Что где находится.', vocabCount: 15, vocabTheme: 'Мебель и части дома' },
  { id: 'a1_l11', level: 'A1', order: 11, category: 'Lesson 11', title: 'Предлоги места', description: 'In, on, at, under.', vocabCount: 15, vocabTheme: 'Места в городе (банк, парк)' },
  { id: 'a1_l12', level: 'A1', order: 12, category: 'Lesson 12', title: 'Модальный глагол Can', description: 'Способности и возможности.', vocabCount: 15, vocabTheme: 'Глаголы способностей (swim, cook)' },
  { id: 'a1_l13', level: 'A1', order: 13, category: 'Lesson 13', title: 'Present Continuous', description: 'Действие прямо сейчас (I am doing).', vocabCount: 15, vocabTheme: 'Активные действия (running, waiting)' },
  { id: 'a1_l14', level: 'A1', order: 14, category: 'Lesson 14', title: 'Some / Any', description: 'Исчисляемые и неисчисляемые существительные.', vocabCount: 20, vocabTheme: 'Еда и напитки' },
  { id: 'a1_l15', level: 'A1', order: 15, category: 'Lesson 15', title: 'Экзамен A1', description: 'Повторение всех тем уровня.', vocabCount: 20, vocabTheme: 'Смешанная лексика уровня A1' },

  // === A2: Elementary (15 Lessons) ===
  { id: 'a2_l1', level: 'A2', order: 16, category: 'Lesson 1', title: 'Past Simple To Be', description: 'Was / Were.', vocabCount: 20, vocabTheme: 'Прилагательные чувств (bored, tired)' },
  { id: 'a2_l2', level: 'A2', order: 17, category: 'Lesson 2', title: 'Past Simple (Правильные)', description: 'Окончание -ed.', vocabCount: 20, vocabTheme: 'Глаголы досуга (watch, dance)' },
  { id: 'a2_l3', level: 'A2', order: 18, category: 'Lesson 3', title: 'Past Simple (Неправильные)', description: 'Вторая форма глагола.', vocabCount: 25, vocabTheme: 'Топ неправильных глаголов' },
  { id: 'a2_l4', level: 'A2', order: 19, category: 'Lesson 4', title: 'Вопросы в Past Simple', description: 'Did you...?', vocabCount: 20, vocabTheme: 'Путешествия (ticket, flight)' },
  { id: 'a2_l5', level: 'A2', order: 20, category: 'Lesson 5', title: 'Степени сравнения (Short)', description: 'Big - Bigger - Biggest.', vocabCount: 20, vocabTheme: 'Прилагательные внешности' },
  { id: 'a2_l6', level: 'A2', order: 21, category: 'Lesson 6', title: 'Степени сравнения (Long)', description: 'More beautiful / Most beautiful.', vocabCount: 20, vocabTheme: 'Характеристики города и природы' },
  { id: 'a2_l7', level: 'A2', order: 22, category: 'Lesson 7', title: 'Наречия (Adverbs)', description: 'Slowly, well, fast.', vocabCount: 20, vocabTheme: 'Наречия образа действия' },
  { id: 'a2_l8', level: 'A2', order: 23, category: 'Lesson 8', title: 'Future Simple (Will)', description: 'Спонтанные решения и будущее.', vocabCount: 20, vocabTheme: 'Погода и предсказания' },
  { id: 'a2_l9', level: 'A2', order: 24, category: 'Lesson 9', title: 'Going to', description: 'Планы на будущее.', vocabCount: 20, vocabTheme: 'Мероприятия и планы' },
  { id: 'a2_l10', level: 'A2', order: 25, category: 'Lesson 10', title: 'Must / Have to', description: 'Обязательства.', vocabCount: 20, vocabTheme: 'Правила в аэропорту/офисе' },
  { id: 'a2_l11', level: 'A2', order: 26, category: 'Lesson 11', title: 'Should (Советы)', description: 'Даем рекомендации.', vocabCount: 20, vocabTheme: 'Здоровье и части тела' },
  { id: 'a2_l12', level: 'A2', order: 27, category: 'Lesson 12', title: 'Зависимые предлоги', description: 'Depend on, Look at.', vocabCount: 20, vocabTheme: 'Глаголы с предлогами' },
  { id: 'a2_l13', level: 'A2', order: 28, category: 'Lesson 13', title: 'Объектные местоимения', description: 'Him, Her, Us, Them.', vocabCount: 20, vocabTheme: 'Праздники и подарки' },
  { id: 'a2_l14', level: 'A2', order: 29, category: 'Lesson 14', title: 'Вводные слова', description: 'First, Then, Finally.', vocabCount: 20, vocabTheme: 'Бытовые инструкции' },
  { id: 'a2_l15', level: 'A2', order: 30, category: 'Lesson 15', title: 'Экзамен A2', description: 'Повторение всех тем уровня.', vocabCount: 20, vocabTheme: 'Смешанная лексика уровня A2' },

  // === B1: Intermediate (15 Lessons) ===
  { id: 'b1_l1', level: 'B1', order: 31, category: 'Lesson 1', title: 'Present Perfect (Опыт)', description: 'I have done it.', vocabCount: 25, vocabTheme: 'Необычные действия и достижения' },
  { id: 'b1_l2', level: 'B1', order: 32, category: 'Lesson 2', title: 'Present Perfect vs Past Simple', description: 'Результат vs Факт в прошлом.', vocabCount: 25, vocabTheme: 'Кино, жанры и театр' },
  { id: 'b1_l3', level: 'B1', order: 33, category: 'Lesson 3', title: 'Just, Already, Yet', description: 'Маркеры времени.', vocabCount: 25, vocabTheme: 'Бизнес-процессы и задачи' },
  { id: 'b1_l4', level: 'B1', order: 34, category: 'Lesson 4', title: 'Past Continuous', description: 'Длительное действие в прошлом.', vocabCount: 25, vocabTheme: 'Природные явления и катастрофы' },
  { id: 'b1_l5', level: 'B1', order: 35, category: 'Lesson 5', title: 'Модальные глаголы вероятности', description: 'Might, Could, Must be.', vocabCount: 25, vocabTheme: 'Наука и космос' },
  { id: 'b1_l6', level: 'B1', order: 36, category: 'Lesson 6', title: 'Passive Voice', description: 'Страдательный залог (Present/Past).', vocabCount: 25, vocabTheme: 'Материалы и производство' },
  { id: 'b1_l7', level: 'B1', order: 37, category: 'Lesson 7', title: 'Герундий', description: 'Verbs + -ing.', vocabCount: 25, vocabTheme: 'Психология и хобби' },
  { id: 'b1_l8', level: 'B1', order: 38, category: 'Lesson 8', title: 'Инфинитив цели', description: 'To do something.', vocabCount: 25, vocabTheme: 'Образование и университет' },
  { id: 'b1_l9', level: 'B1', order: 39, category: 'Lesson 9', title: 'Conditionals 0 & 1', description: 'Реальные условия.', vocabCount: 25, vocabTheme: 'Деньги, банки, инвестиции' },
  { id: 'b1_l10', level: 'B1', order: 40, category: 'Lesson 10', title: 'Conditional 2', description: 'Воображаемые ситуации.', vocabCount: 25, vocabTheme: 'Воображаемый мир и мечты' },
  { id: 'b1_l11', level: 'B1', order: 41, category: 'Lesson 11', title: 'Relative Clauses', description: 'Who, Which, That.', vocabCount: 25, vocabTheme: 'Описание гаджетов' },
  { id: 'b1_l12', level: 'B1', order: 42, category: 'Lesson 12', title: 'Фразовые глаголы', description: 'Топ-50 бытовых.', vocabCount: 30, vocabTheme: 'Бытовые фразовые глаголы' },
  { id: 'b1_l13', level: 'B1', order: 43, category: 'Lesson 13', title: 'Словообразование', description: 'Суффиксы и префиксы.', vocabCount: 30, vocabTheme: 'Из существительных в глаголы' },
  { id: 'b1_l14', level: 'B1', order: 44, category: 'Lesson 14', title: 'Предлоги движения', description: 'Across, Through, Along.', vocabCount: 25, vocabTheme: 'Экстремальный спорт' },
  { id: 'b1_l15', level: 'B1', order: 45, category: 'Lesson 15', title: 'Экзамен B1', description: 'Повторение всех тем уровня.', vocabCount: 30, vocabTheme: 'Смешанная лексика уровня B1' },

  // === B2: Upper-Intermediate (10 Lessons) ===
  { id: 'b2_l1', level: 'B2', order: 46, category: 'Lesson 1', title: 'Past Perfect', description: 'Предпрошедшее время.', vocabCount: 30, vocabTheme: 'Криминалистика и правосудие' },
  { id: 'b2_l2', level: 'B2', order: 47, category: 'Lesson 2', title: 'Reported Speech', description: 'Косвенная речь.', vocabCount: 30, vocabTheme: 'СМИ, новости, репортажи' },
  { id: 'b2_l3', level: 'B2', order: 48, category: 'Lesson 3', title: 'Passive Voice (Advanced)', description: 'Все времена в пассиве.', vocabCount: 30, vocabTheme: 'Медицина и биология' },
  { id: 'b2_l4', level: 'B2', order: 49, category: 'Lesson 4', title: 'Conditional 3', description: 'Сожаления о прошлом.', vocabCount: 30, vocabTheme: 'История и глобальные ошибки' },
  { id: 'b2_l5', level: 'B2', order: 50, category: 'Lesson 5', title: 'Mixed Conditionals', description: 'Смешанные условия.', vocabCount: 30, vocabTheme: 'Личное развитие и успех' },
  { id: 'b2_l6', level: 'B2', order: 51, category: 'Lesson 6', title: 'Modal Verbs in Past', description: 'Should have, Could have.', vocabCount: 30, vocabTheme: 'Социальные проблемы' },
  { id: 'b2_l7', level: 'B2', order: 52, category: 'Lesson 7', title: 'Used to / Would / Get used to', description: 'Привычки в прошлом и адаптация.', vocabCount: 30, vocabTheme: 'Антропология и культура' },
  { id: 'b2_l8', level: 'B2', order: 53, category: 'Lesson 8', title: 'Linkers (Advanced)', description: 'Moreover, Furthermore, However.', vocabCount: 30, vocabTheme: 'Академическое письмо' },
  { id: 'b2_l9', level: 'B2', order: 54, category: 'Lesson 9', title: 'Фразовые глаголы (Бизнес)', description: 'Для работы и карьеры.', vocabCount: 40, vocabTheme: 'Переговоры, найм' },
  { id: 'b2_l10', level: 'B2', order: 55, category: 'Lesson 10', title: 'Коллокации', description: 'Устойчивые сочетания.', vocabCount: 40, vocabTheme: 'Как звучать нативно' },
  
  // === C1: Advanced (Thematic Blocks) ===
  { id: 'c1_l1', level: 'C1', order: 56, category: 'Block 1', title: 'Инверсия (Inversion)', description: 'Never have I ever...', vocabCount: 50, vocabTheme: 'Экономика, Глобализация, Искусство' },
  { id: 'c1_l2', level: 'C1', order: 57, category: 'Block 2', title: 'Сослагательное наклонение', description: 'Subjunctive Mood (I wish, If only).', vocabCount: 50, vocabTheme: 'Политика, Экономика, Формальный стиль' },
  { id: 'c1_l3', level: 'C1', order: 58, category: 'Block 3', title: 'Cleft Sentences', description: 'Эмфатические конструкции (It was X that...).', vocabCount: 50, vocabTheme: 'Искусство, Эстетика, Риторика' },
  { id: 'c1_l4', level: 'C1', order: 59, category: 'Block 4', title: 'Participle Clauses', description: 'Причастные обороты.', vocabCount: 50, vocabTheme: 'Научная литература, Описания' },
  { id: 'c1_l5', level: 'C1', order: 60, category: 'Block 5', title: 'Nominalisation', description: 'Превращение глаголов в существительные.', vocabCount: 50, vocabTheme: 'Академический и Официальный стиль' },
];
