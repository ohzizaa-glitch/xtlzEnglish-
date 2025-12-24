
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
  // === A1: Beginner ===
  
  // A1.1 — Введение
  { id: 'a1_l1', level: 'A1', order: 1, category: 'A1.1', title: 'Алфавит и чтение', description: 'Приветствия и базовые фразы.', vocabCount: 20, vocabTheme: 'Приветствия' },
  { id: 'a1_l2', level: 'A1', order: 2, category: 'A1.1', title: 'Глагол to be (утверждение)', description: 'Личные местоимения. Числа 1–10.', vocabCount: 15, vocabTheme: 'Местоимения, числа' },
  { id: 'a1_l3', level: 'A1', order: 3, category: 'A1.1', title: 'Глагол to be (вопросы/отриц.)', description: 'Страны и национальности.', vocabCount: 15, vocabTheme: 'Страны' },
  { id: 'a1_l4', level: 'A1', order: 4, category: 'A1.1', title: 'Vocabulary A1.1', description: 'Приветствия, личная информация, частотные слова.', vocabCount: 25, vocabTheme: 'Базовая лексика' },
  { id: 'a1_l5', level: 'A1', order: 5, category: 'A1.1', title: 'Vocabulary A1.2', description: 'Личная информация, профессии (базовые), дни и месяцы.', vocabCount: 25, vocabTheme: 'Анкета' },

  // A1.2 — Я и моё окружение
  { id: 'a1_l6', level: 'A1', order: 6, category: 'A1.2', title: 'Существительные и артикли', description: 'Предметы вокруг.', vocabCount: 15, vocabTheme: 'Предметы' },
  { id: 'a1_l7', level: 'A1', order: 7, category: 'A1.2', title: 'Множественное число', description: 'Семья.', vocabCount: 15, vocabTheme: 'Семья' },
  { id: 'a1_l8', level: 'A1', order: 8, category: 'A1.2', title: 'Vocabulary A1.3', description: 'Семья, повседневные предметы, базовые прилагательные.', vocabCount: 25, vocabTheme: 'Быт' },

  // A1.3 — Повседневная жизнь
  { id: 'a1_l9', level: 'A1', order: 9, category: 'A1.3', title: 'Present Simple (I/You/We/They)', description: 'Базовые глаголы.', vocabCount: 15, vocabTheme: 'Глаголы действия' },
  { id: 'a1_l10', level: 'A1', order: 10, category: 'A1.3', title: 'Present Simple (He/She/It)', description: 'Профессии.', vocabCount: 15, vocabTheme: 'Профессии' },
  { id: 'a1_l11', level: 'A1', order: 11, category: 'A1.3', title: 'Vocabulary A1.4', description: 'Рутина, время, наречия частоты.', vocabCount: 25, vocabTheme: 'Рутина' },

  // A1.4 — Мир вокруг
  { id: 'a1_l12', level: 'A1', order: 12, category: 'A1.4', title: 'Притяжательные местоимения', description: 'Одежда и цвета.', vocabCount: 15, vocabTheme: 'Одежда' },
  { id: 'a1_l13', level: 'A1', order: 13, category: 'A1.4', title: 'There is / There are', description: 'Дом и мебель.', vocabCount: 15, vocabTheme: 'Интерьер' },
  { id: 'a1_l14', level: 'A1', order: 14, category: 'A1.4', title: 'Vocabulary A1.5', description: 'Дом, комнаты, мебель, базовые предлоги.', vocabCount: 25, vocabTheme: 'Дом' },

  // A1.5 — Действия и возможности
  { id: 'a1_l15', level: 'A1', order: 15, category: 'A1.5', title: 'Модальный глагол Can', description: 'Способности.', vocabCount: 15, vocabTheme: 'Навыки' },
  { id: 'a1_l16', level: 'A1', order: 16, category: 'A1.5', title: 'Present Continuous', description: 'Действия в моменте.', vocabCount: 15, vocabTheme: 'Глаголы движения' },
  { id: 'a1_l17', level: 'A1', order: 17, category: 'A1.5', title: 'Vocabulary A1.6', description: 'Хобби, спорт, свободное время.', vocabCount: 25, vocabTheme: 'Досуг' },

  // A1.6 — Еда
  { id: 'a1_l18', level: 'A1', order: 18, category: 'A1.6', title: 'Some / Any', description: 'Исчисляемые и неисчисляемые существительные.', vocabCount: 15, vocabTheme: 'Продукты' },
  { id: 'a1_l19', level: 'A1', order: 19, category: 'A1.6', title: 'Vocabulary A1.7', description: 'Еда, напитки, покупки.', vocabCount: 25, vocabTheme: 'Магазин' },

  // A1 Итог
  { id: 'a1_l20', level: 'A1', order: 20, category: 'Final', title: 'Повторение A1', description: 'Закрепление материала.', vocabCount: 0, vocabTheme: 'Все темы' },
  { id: 'a1_l21', level: 'A1', order: 21, category: 'Exam', title: 'Экзамен A1', description: 'Финальный тест.', vocabCount: 0, vocabTheme: 'Все темы' },


  // === A2: Elementary ===

  // A2.1 — Прошлое
  { id: 'a2_l1', level: 'A2', order: 22, category: 'A2.1', title: 'Past Simple (to be)', description: 'Эмоции и состояния.', vocabCount: 15, vocabTheme: 'Чувства' },
  { id: 'a2_l2', level: 'A2', order: 23, category: 'A2.1', title: 'Past Simple (правильные)', description: 'Досуг.', vocabCount: 15, vocabTheme: 'Активности' },
  { id: 'a2_l3', level: 'A2', order: 24, category: 'A2.1', title: 'Vocabulary A2.1', description: 'Досуг, выходные, глаголы активности.', vocabCount: 25, vocabTheme: 'Выходные' },
  { id: 'a2_l4', level: 'A2', order: 25, category: 'A2.1', title: 'Past Simple (неправильные)', description: 'Основные формы.', vocabCount: 20, vocabTheme: 'Irregular verbs' },
  { id: 'a2_l5', level: 'A2', order: 26, category: 'A2.1', title: 'Vocabulary A2.2', description: 'Путешествия, транспорт, направления.', vocabCount: 25, vocabTheme: 'Поездки' },
  { id: 'a2_l6', level: 'A2', order: 27, category: 'A2.1', title: 'Вопросы в Past Simple', description: 'Путешествия.', vocabCount: 15, vocabTheme: 'Вопросы' },

  // A2.2 — Сравнение и описание
  { id: 'a2_l7', level: 'A2', order: 28, category: 'A2.2', title: 'Степени сравнения (Short)', description: 'Внешность.', vocabCount: 15, vocabTheme: 'Внешность' },
  { id: 'a2_l8', level: 'A2', order: 29, category: 'A2.2', title: 'Vocabulary A2.3', description: 'Внешность, характер, базовые эмоции.', vocabCount: 25, vocabTheme: 'Люди' },
  { id: 'a2_l9', level: 'A2', order: 30, category: 'A2.2', title: 'Степени сравнения (Long)', description: 'Города и природа.', vocabCount: 15, vocabTheme: 'Окружение' },
  { id: 'a2_l10', level: 'A2', order: 31, category: 'A2.2', title: 'Наречия (Adverbs)', description: 'Наречия образа действия.', vocabCount: 15, vocabTheme: 'Действия' },
  { id: 'a2_l11', level: 'A2', order: 32, category: 'A2.2', title: 'Vocabulary A2.4', description: 'Города, природа, погода.', vocabCount: 25, vocabTheme: 'Природа' },

  // A2.3 — Будущее
  { id: 'a2_l12', level: 'A2', order: 33, category: 'A2.3', title: 'Future Simple (Will)', description: 'Прогнозы.', vocabCount: 15, vocabTheme: 'Будущее' },
  { id: 'a2_l13', level: 'A2', order: 34, category: 'A2.3', title: 'Going to', description: 'Планы.', vocabCount: 15, vocabTheme: 'Намерения' },
  { id: 'a2_l14', level: 'A2', order: 35, category: 'A2.3', title: 'Vocabulary A2.5', description: 'Планы, цели, время в будущем.', vocabCount: 25, vocabTheme: 'Цели' },

  // A2.4 — Обязанности и советы
  { id: 'a2_l15', level: 'A2', order: 36, category: 'A2.4', title: 'Must / Have to', description: 'Правила.', vocabCount: 15, vocabTheme: 'Обязанности' },
  { id: 'a2_l16', level: 'A2', order: 37, category: 'A2.4', title: 'Should', description: 'Советы.', vocabCount: 15, vocabTheme: 'Рекомендации' },
  { id: 'a2_l17', level: 'A2', order: 38, category: 'A2.4', title: 'Vocabulary A2.6', description: 'Здоровье, привычки, образ жизни.', vocabCount: 25, vocabTheme: 'Здоровье' },

  // A2.5 — Связность речи
  { id: 'a2_l18', level: 'A2', order: 39, category: 'A2.5', title: 'Глаголы с предлогами', description: 'Look at, listen to.', vocabCount: 15, vocabTheme: 'Управление' },
  { id: 'a2_l19', level: 'A2', order: 40, category: 'A2.5', title: 'Vocabulary A2.7', description: 'Работа, офис, повседневные действия.', vocabCount: 25, vocabTheme: 'Работа' },
  { id: 'a2_l20', level: 'A2', order: 41, category: 'A2.5', title: 'Объектные местоимения', description: 'Подарки.', vocabCount: 15, vocabTheme: 'Местоимения' },
  { id: 'a2_l21', level: 'A2', order: 42, category: 'A2.5', title: 'Вводные слова', description: 'First, Then, After.', vocabCount: 15, vocabTheme: 'Связки' },
  { id: 'a2_l22', level: 'A2', order: 43, category: 'A2.5', title: 'Vocabulary A2.8', description: 'Инструкции, последовательность.', vocabCount: 25, vocabTheme: 'Инструкции' },

  // A2 Итог
  { id: 'a2_l23', level: 'A2', order: 44, category: 'Final', title: 'Повторение A2', description: 'Закрепление материала.', vocabCount: 0, vocabTheme: 'Все темы' },
  { id: 'a2_l24', level: 'A2', order: 45, category: 'Exam', title: 'Экзамен A2', description: 'Финальный тест.', vocabCount: 0, vocabTheme: 'Все темы' },


  // === B1: Intermediate ===

  // B1.1 — Опыт и время
  { id: 'b1_l1', level: 'B1', order: 46, category: 'B1.1', title: 'Present Perfect (Опыт)', description: 'Достижения.', vocabCount: 20, vocabTheme: 'Достижения' },
  { id: 'b1_l2', level: 'B1', order: 47, category: 'B1.1', title: 'Vocabulary B1.1', description: 'Достижения, жизненный опыт.', vocabCount: 30, vocabTheme: 'Опыт' },
  { id: 'b1_l3', level: 'B1', order: 48, category: 'B1.1', title: 'Present Perfect vs Past Simple', description: 'Культура.', vocabCount: 20, vocabTheme: 'Сравнение времен' },
  { id: 'b1_l4', level: 'B1', order: 49, category: 'B1.1', title: 'Just, Already, Yet', description: 'Маркеры времени.', vocabCount: 15, vocabTheme: 'Время' },
  { id: 'b1_l5', level: 'B1', order: 50, category: 'B1.1', title: 'Vocabulary B1.2', description: 'Работа, проекты, дедлайны.', vocabCount: 30, vocabTheme: 'Карьера' },

  // B1.2 — Прошлые процессы
  { id: 'b1_l6', level: 'B1', order: 51, category: 'B1.2', title: 'Past Continuous', description: 'События.', vocabCount: 20, vocabTheme: 'Процессы' },
  { id: 'b1_l7', level: 'B1', order: 52, category: 'B1.2', title: 'Vocabulary B1.3', description: 'События, катастрофы, новости.', vocabCount: 30, vocabTheme: 'События' },

  // B1.3 — Вероятность и пассив
  { id: 'b1_l8', level: 'B1', order: 53, category: 'B1.3', title: 'Модальные глаголы (Вероятность)', description: 'Might, Could, Must.', vocabCount: 20, vocabTheme: 'Гипотезы' },
  { id: 'b1_l9', level: 'B1', order: 54, category: 'B1.3', title: 'Vocabulary B1.4', description: 'Наука, предположения.', vocabCount: 30, vocabTheme: 'Наука' },
  { id: 'b1_l10', level: 'B1', order: 55, category: 'B1.3', title: 'Passive Voice (Present/Past)', description: 'Страдательный залог.', vocabCount: 20, vocabTheme: 'Пассив' },
  { id: 'b1_l11', level: 'B1', order: 56, category: 'B1.3', title: 'Vocabulary B1.5', description: 'Производство, процессы.', vocabCount: 30, vocabTheme: 'Производство' },

  // B1.4 — Формы глаголов
  { id: 'b1_l12', level: 'B1', order: 57, category: 'B1.4', title: 'Герундий', description: 'После глаголов.', vocabCount: 20, vocabTheme: 'Герундий' },
  { id: 'b1_l13', level: 'B1', order: 58, category: 'B1.4', title: 'Vocabulary B1.6', description: 'Хобби, интересы.', vocabCount: 30, vocabTheme: 'Интересы' },
  { id: 'b1_l14', level: 'B1', order: 59, category: 'B1.4', title: 'Инфинитив цели', description: 'To do something.', vocabCount: 20, vocabTheme: 'Цели' },
  { id: 'b1_l15', level: 'B1', order: 60, category: 'B1.4', title: 'Vocabulary B1.7', description: 'Образование, обучение.', vocabCount: 30, vocabTheme: 'Учеба' },

  // B1.5 — Условия
  { id: 'b1_l16', level: 'B1', order: 61, category: 'B1.5', title: 'Zero & First Conditional', description: 'Реальные условия.', vocabCount: 20, vocabTheme: 'Условия' },
  { id: 'b1_l17', level: 'B1', order: 62, category: 'B1.5', title: 'Vocabulary B1.8', description: 'Деньги, покупки, финансы.', vocabCount: 30, vocabTheme: 'Финансы' },
  { id: 'b1_l18', level: 'B1', order: 63, category: 'B1.5', title: 'Second Conditional', description: 'Воображаемые условия.', vocabCount: 20, vocabTheme: 'Мечты' },
  { id: 'b1_l19', level: 'B1', order: 64, category: 'B1.5', title: 'Vocabulary B1.9', description: 'Мечты, гипотезы.', vocabCount: 30, vocabTheme: 'Фантазии' },

  // B1.6 — Связная речь
  { id: 'b1_l20', level: 'B1', order: 65, category: 'B1.6', title: 'Relative Clauses', description: 'Who, Which, That.', vocabCount: 20, vocabTheme: 'Описания' },
  { id: 'b1_l21', level: 'B1', order: 66, category: 'B1.6', title: 'Vocabulary B1.10', description: 'Технологии, интернет.', vocabCount: 30, vocabTheme: 'IT' },
  { id: 'b1_l22', level: 'B1', order: 67, category: 'B1.6', title: 'Фразовые глаголы', description: 'Everyday, top 50.', vocabCount: 30, vocabTheme: 'Phrasals' },
  { id: 'b1_l23', level: 'B1', order: 68, category: 'B1.6', title: 'Словообразование', description: 'Суффиксы и префиксы.', vocabCount: 20, vocabTheme: 'Word formation' },
  { id: 'b1_l24', level: 'B1', order: 69, category: 'B1.6', title: 'Предлоги движения', description: 'Across, through.', vocabCount: 20, vocabTheme: 'Движение' },

  // B1 Итог
  { id: 'b1_l25', level: 'B1', order: 70, category: 'Final', title: 'Повторение B1', description: 'Закрепление.', vocabCount: 0, vocabTheme: 'Все темы' },
  { id: 'b1_l26', level: 'B1', order: 71, category: 'Exam', title: 'Экзамен B1', description: 'Финальный тест.', vocabCount: 0, vocabTheme: 'Все темы' },


  // === B2: Upper-Intermediate ===
  
  { id: 'b2_l1', level: 'B2', order: 72, category: 'B2', title: 'Past Perfect', description: 'Предпрошедшее время.', vocabCount: 30, vocabTheme: 'Криминал' },
  { id: 'b2_l2', level: 'B2', order: 73, category: 'B2', title: 'Reported Speech', description: 'Косвенная речь.', vocabCount: 30, vocabTheme: 'Новости' },
  { id: 'b2_l3', level: 'B2', order: 74, category: 'B2', title: 'Passive Voice (Adv)', description: 'Все времена.', vocabCount: 30, vocabTheme: 'Медицина' },
  { id: 'b2_l4', level: 'B2', order: 75, category: 'B2', title: 'Third Conditional', description: 'Сожаления.', vocabCount: 30, vocabTheme: 'Ошибки' },
  { id: 'b2_l5', level: 'B2', order: 76, category: 'B2', title: 'Mixed Conditionals', description: 'Смешанные условия.', vocabCount: 30, vocabTheme: 'Развитие' },
  { id: 'b2_l6', level: 'B2', order: 77, category: 'B2', title: 'Modals in Past', description: 'Should have, Could have.', vocabCount: 30, vocabTheme: 'Общество' },
  { id: 'b2_l7', level: 'B2', order: 78, category: 'B2', title: 'Used to / Would', description: 'Привычки в прошлом.', vocabCount: 30, vocabTheme: 'Культура' },
  { id: 'b2_l8', level: 'B2', order: 79, category: 'B2', title: 'Advanced Linkers', description: 'Формальная речь.', vocabCount: 30, vocabTheme: 'Письмо' },
  { id: 'b2_l9', level: 'B2', order: 80, category: 'B2', title: 'Business Phrasal Verbs', description: 'Для работы.', vocabCount: 40, vocabTheme: 'Бизнес' },
  { id: 'b2_l10', level: 'B2', order: 81, category: 'B2', title: 'Collocations', description: 'Устойчивые сочетания.', vocabCount: 40, vocabTheme: 'Native speech' },


  // === C1: Advanced ===

  { id: 'c1_l1', level: 'C1', order: 82, category: 'C1.1', title: 'Инверсия (Inversion)', description: 'Эмфатические конструкции.', vocabCount: 50, vocabTheme: 'Риторика' },
  { id: 'c1_l2', level: 'C1', order: 83, category: 'C1.2', title: 'Сослагательное наклонение', description: 'Subjunctive Mood.', vocabCount: 50, vocabTheme: 'Политика' },
  { id: 'c1_l3', level: 'C1', order: 84, category: 'C1.3', title: 'Cleft Sentences', description: 'Смысловое выделение.', vocabCount: 50, vocabTheme: 'Искусство' },
  { id: 'c1_l4', level: 'C1', order: 85, category: 'C1.4', title: 'Participle Clauses', description: 'Академический стиль.', vocabCount: 50, vocabTheme: 'Наука' },
  { id: 'c1_l5', level: 'C1', order: 86, category: 'C1.5', title: 'Подтекст и нюансы', description: 'Скрытые значения.', vocabCount: 50, vocabTheme: 'Психология' },
];
