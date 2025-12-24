
import { StaticLesson, ItemType } from '../types';

export const LESSON_CONTENT: Record<string, StaticLesson> = {
  'a1_l1': {
    id: 'a1_l1',
    slides: [
      // 1. Введение
      {
        type: 'intro',
        title: 'Зачем нужен алфавит',
        content: {
          text: `Английский алфавит состоит из 26 букв. Многие буквы похожи на русские, но читаются иначе. 
          
В этом уроке ты узнаешь, как звучат буквы, научишься читать простые слова и выучишь первые приветствия.`
        }
      },
      // 2. Алфавит (A-J)
      {
        type: 'table',
        title: 'Алфавит: буквы + звук',
        content: {
          headers: ['Буква', 'Звук', 'Пример', 'Транскрипция'],
          rows: [
            ['A', '/eɪ/', 'Apple', 'ˈæpəl'],
            ['B', '/biː/', 'Book', 'bʊk'],
            ['C', '/siː/', 'Cat', 'kæt'],
            ['D', '/diː/', 'Dog', 'dɒg'],
            ['E', '/iː/', 'Egg', 'eg'],
            ['F', '/ef/', 'Fish', 'fɪʃ'],
            ['G', '/dʒiː/', 'Game', 'geɪm'],
            ['H', '/eɪtʃ/', 'Hat', 'hæt'],
            ['I', '/aɪ/', 'Ice', 'aɪs'],
            ['J', '/dʒeɪ/', 'Juice', 'dʒuːs']
          ],
          note: '(Можно продолжить весь алфавит в следующих уроках — это хороший темп.)'
        }
      },
      // 3. Гласные
      {
        type: 'list',
        title: 'Как читать английские гласные',
        content: {
          description: 'Короткие правила, чтобы не перегружать новичка:',
          items: [
            'A — чаще всего звучит как "эй" или "æ"',
            'E — как "и"',
            'I — как "ай"',
            'O — как "оу" или "о"',
            'U — как "ю" или "а"'
          ],
          examples: [
            { text: 'Hi', trans: '/haɪ/' },
            { text: 'Hello', trans: '/həˈləʊ/' }
          ]
        }
      },
      // 4. Словарь (10 слов)
      {
        type: 'vocab',
        title: 'Основные приветствия (10 слов)',
        content: {
          items: [
            { front: 'Hi', back: 'Привет', example: 'Hi, Tom!', type: 'Word' },
            { front: 'Hello', back: 'Здравствуйте / Привет', example: 'Hello, everyone.', type: 'Word' },
            { front: 'Bye', back: 'Пока', example: 'Bye, see you!', type: 'Word' },
            { front: 'Good', back: 'Хороший', example: 'Good morning!', type: 'Word' },
            { front: 'Morning', back: 'Утро', example: 'Good morning!', type: 'Word' },
            { front: 'Evening', back: 'Вечер', example: 'Good evening!', type: 'Word' },
            { front: 'Night', back: 'Ночь', example: 'Good night!', type: 'Word' },
            { front: 'Yes', back: 'Да', example: 'Yes, I understand.', type: 'Word' },
            { front: 'No', back: 'Нет', example: 'No, thank you.', type: 'Word' },
            { front: 'Thanks', back: 'Спасибо', example: 'Thanks a lot!', type: 'Word' }
          ]
        }
      },
      // 5. Упражнения
      {
        type: 'exercise',
        title: 'Упражнения',
        content: {
          exercises: [
            {
              type: 'match',
              question: 'Сопоставь букву и звук (выбери звук для "I")',
              options: ['/eɪ/', '/aɪ/', '/iː/', '/əʊ/'],
              correctAnswer: '/aɪ/'
            },
            {
              type: 'scramble',
              question: 'Собери слово из букв (Приветствие)',
              scrambleLetters: ['H', 'I', 'L', 'O', 'E'],
              correctAnswer: 'Hello'
            },
            {
              type: 'select',
              question: 'Выбери правильный перевод: "Hi"',
              options: ['Привет', 'Пока', 'Спасибо'],
              correctAnswer: 'Привет'
            },
            {
              type: 'audio_select',
              question: 'Прослушай и выбери слово',
              audioText: 'Good night',
              options: ['Good night', 'Good morning', 'Hello'],
              correctAnswer: 'Good night'
            }
          ]
        }
      },
      // 6. Мини-тест
      {
        type: 'quiz',
        title: 'Мини-тест',
        content: {
          questions: [
            { question: 'Сколько букв в английском алфавите?', options: ['24', '26', '33'], correctIndex: 1 },
            { question: 'Как переводится "Bye"?', options: ['Привет', 'Пока', 'Спасибо'], correctIndex: 1 },
            { question: 'Выбери слово по транскрипции: /haɪ/', options: ['Hi', 'He', 'Hey'], correctIndex: 0 },
            { question: 'Как сказать "Доброе утро"?', options: ['Good night', 'Good evening', 'Good morning'], correctIndex: 2 }
          ]
        }
      },
      // 7. Итог
      {
        type: 'finish',
        title: 'Итог урока',
        content: {
          text: 'Ты познакомился с английским алфавитом, научился читать базовые звуки и выучил 10 важных слов-приветствий. Отличное начало!'
        }
      }
    ]
  }
};
