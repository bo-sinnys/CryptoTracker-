# CryptoTracker

Веб-додаток для відстеження криптовалютного ринку в реальному часі. Побудований на Next.js 16 з реальними даними через CoinGecko API.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)

---
## Посилання
https://crypto-tracker-kohl-mu.vercel.app/

## 🖥️ Скріншот
<img width="1441" height="937" alt="image" src="https://github.com/user-attachments/assets/3c45fd34-bbef-43d7-a3f3-38ed2af0e95d" />

> Головна сторінка з таблицею монет, ринковою статистикою та Fear & Greed Index

---

##  Функціонал

###  Ринок криптовалют
- Таблиця **100 монет** з цінами, % змінами за 1г / 24г / 7д, капіталізацією та обсягом
- Сортування по кожній колонці
- Пошук монети за назвою або тикером
- Sparkline-графік за 7 днів для кожної монети
- Фільтр категорій: **Усі монети** / **DeFi**
-  **Улюблені монети** — зберігаються у `localStorage`

###  Статистика ринку
- Загальна ринкова капіталізація та обсяг торгів
- Топ-5 за обсягом («Популярно»)
- Топ-5 за зростанням за 24г («Найбільший ріст»)
- **Fear & Greed Index** з gauge-діаграмою та sparkline за 30 днів

###  Конвертер валют
- Графік зміни курсу за 7Д / 14Д / 1М / 3М
- Актуальні фіатні курси через Open Exchange Rates

###  Портфоліо
- Додавання активів з ціною купівлі
- Автоматичний розрахунок P&L у реальному часі
- Відображення у різних валютах
- Збереження портфоліо у `localStorage`

###  Новини
- Крипто-новини з **CryptoPanic**, CoinTelegraph, Decrypt, CoinDesk
- Автооновлення кожні 5 хвилин
- Три рівні fallback — сторінка ніколи не порожня

---

##  Технічний стек

| Технологія | Версія | Призначення |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2 | App Router, SSR, API Routes |
| [React](https://react.dev) | 19.2 | UI компоненти |
| [TypeScript](https://typescriptlang.org) | 5.7 | Типізація |
| [Tailwind CSS](https://tailwindcss.com) | v4 | Стилізація |
| [shadcn/ui](https://ui.shadcn.com) | — | UI компоненти (Radix UI) |
| [SWR](https://swr.vercel.app) | 2.4 | Кешування та оновлення даних |
| [Recharts](https://recharts.org) | 2.15 | Графіки |
| [Lucide React](https://lucide.dev) | 0.564 | Іконки |

---

## API

| API | Призначення |
|---|---|
| [CoinGecko](https://coingecko.com/api) | Ціни, капіталізація, sparkline |
| [Alternative.me](https://alternative.me/crypto/fear-and-greed-index/) | Fear & Greed Index |
| [CryptoPanic](https://cryptopanic.com/api) | Новини |
| [Open Exchange Rates](https://open.er-api.com) | Фіатні курси |

> Всі endpoint-и мають **fallback на статичні дані** — застосунок працює навіть без інтернету.

---

## Запуск локально

### Вимоги
- Node.js >= 18
- pnpm (або npm / yarn)

### Встановлення

```bash
# Клонувати репозиторій
git clone https://github.com/YOUR_USERNAME/cryptotracker.git
cd cryptotracker

# Встановити залежності
pnpm install

# Запустити у режимі розробки
pnpm dev
```

Відкрити [http://localhost:3000](http://localhost:3000)

### Збірка для продакшну

```bash
pnpm build
pnpm start
```

---

## Структура проєкту

```
├── app/
│   ├── page.tsx                    # Головна — ринок криптовалют
│   ├── coin/[id]/page.tsx          # Детальна сторінка монети
│   ├── converter/page.tsx          # Конвертер валют
│   ├── portfolio/page.tsx          # Портфоліо
│   ├── news/page.tsx               # Новини
│   └── api/
│       ├── crypto/route.ts         # Список монет
│       ├── coin/[id]/route.ts      # Деталі монети
│       ├── coin/[id]/chart/route.ts# Дані графіку
│       ├── global/route.ts         # Глобальна статистика
│       ├── fear-greed/route.ts     # Fear & Greed Index
│       └── news/route.ts           # Новини
├── components/
│   ├── crypto-table.tsx            # Таблиця монет
│   ├── market-overview.tsx         # Картки статистики
│   ├── fear-greed-index.tsx        # Fear & Greed gauge
│   ├── header.tsx                  # Навігація
│   ├── category-filter.tsx         # Фільтр категорій
│   └── ui/                         # shadcn/ui компоненти
├── lib/
│   ├── types.ts                    # TypeScript інтерфейси
│   └── utils.ts                    # Утиліти
└── public/                         # Статичні файли
```

---

## Деплой

Найпростіший спосіб — [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Або через CLI
npx vercel
```

---
