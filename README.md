# لوحة المشرف — سبات (dashboard)

واجهة ويب لإدارة منصة سبات: مستخدمون، مشرفون، أدوار وصلاحيات، نوم ومزامنة صحة، اشتراكات، محتوى، إعدادات، دعم، تحليلات، وسجل تدقيق. مبنية على **React 18** و**Vite 6** و**Tailwind CSS**، وتستهلك الـ API الخلفي تحت **`/api/v1`** مع مسارات الإدارة تحت **`/api/v1/admin`**.

---

## المتطلبات

- Node.js **18 أو أعلى** (متسق مع مجلد الخلفية)
- خادم **backend** يعمل مع هجرات وبذرة كما في `backend/README.md`

---

## الإعداد السريع

```bash
cd dashboard
npm install
copy .env.example .env    # Windows — أو: cp .env.example .env
npm run dev
```

- التطوير الافتراضي: **http://localhost:5173**
- الطلبات إلى **`/api`** تُوجَّه عبر **proxy** في `vite.config.js` إلى `http://localhost:3000`، لذلك مع `VITE_API_BASE_URL=/api/v1` تعمل الاستدعاءات دون CORS إضافي محليًا.

---

## المتغيرات البيئية

ملف **`dashboard/.env.example`**:

| المتغير | الغرض |
|---------|--------|
| `VITE_API_BASE_URL` | أساس مسارات الـ API؛ محليًا غالبًا `/api/v1` مع proxy؛ في الإنتاج إما مسار نسبي على نفس النطاق أو عنوان HTTPS كامل للـ API |
| `VITE_APP_NAME` | اسم يُعرض في الواجهة |

أي متغير يبدأ بـ **`VITE_`** يُدمَج وقت **البناء**؛ بعد تغيير `.env` يجب إعادة **`npm run build`**.

---

## السكربتات

| الأمر | الوصف |
|--------|--------|
| `npm run dev` | خادم تطوير Vite (منفذ 5173) |
| `npm run build` | بناء إنتاج إلى `dist/` |
| `npm run preview` | معاينة مجمّعة محليًا بعد البناء |

---

## بنية المجلدات (`src/`)

```
src/
├── App.jsx                 # هيكل التطبيق العلوي
├── main.jsx                # نقطة الدخول
├── routes/
│   ├── AppRoutes.jsx       # تعريف المسارات (صفحات لوحة التحكم)
│   └── ProtectedRoute.jsx  # حماية المسارات وتوجيه غير المصرّح
├── pages/                  # شاشات كاملة (مستخدمون، نوم، إعدادات، ...)
├── components/
│   ├── layout/             # هيكل الصفحة، شريط جانبي، تنقل
│   ├── ui/                 # أزرار، جداول، نماذج صغيرة
│   ├── charts/             # رسوم بيانية للوحة
│   ├── forms/، modals/، feedback/
├── services/
│   ├── apiClient.js        # fetch موحّد، Bearer، تحديث الرموز تلقائيًا
│   ├── authService.js      # تسجيل دخول مشرف وما شابه
│   ├── adminService.js، userService.js، ...
├── hooks/                  # useAuth، useToast، استعلامات مساعدة
├── constants/
│   ├── api.js              # API_BASE_URL، بادئة admin، مفاتيح التخزين، حجم الصفحة
│   ├── routes.js           # مسارات الواجهة الداخلية
│   └── theme.js
└── utils/                  # تنسيق، دمج أصناف Tailwind
```

---

## التوجيه (Routing)

`AppRoutes.jsx` يحدد:

- **`/login`** — تسجيل دخول المشرف.
- **`/unauthorized`** — انتهاء الجلسة أو فشل التحديث.
- **`/no-permission`** — رمز صالح لكن بدون صلاحية كافية (استجابة 403 من الـ API).
- تحت **`ProtectedRoute`** + **`MainLayout`**: الصفحة الرئيسية `/` (Overview)، ثم مسارات مثل `users`, `users/:id`, `admins`, `roles`, `permissions`, `onboarding`, مسارات النوم، الاشتراك، المحتوى، الإعدادات، الدعم، التحليلات، `audit-logs`.
- **`\*`** — صفحة غير موجودة داخل وخارج التخطيط المحمي حسب السياق.

المسارات **الأمامية** هي مسارات SPA فقط؛ لا تُخطئ بينها وبين مسارات الـ REST.

---

## التكامل مع الـ API

- **`constants/api.js`**:  
  - `API_BASE_URL` ← `import.meta.env.VITE_API_BASE_URL` أو افتراضي `/api/v1`.  
  - `ADMIN_API_PREFIX` ← `/admin`؛ الطلبات الإدارية تصبح مثلًا `${API_BASE_URL}/admin/users`.
- **`services/apiClient.js`**:
  - يضيف **`Authorization: Bearer`** من `localStorage` (`sabat_admin_access`).
  - على **401** يحاول **`POST .../admin/auth/refresh-token`** مع `sabat_admin_refresh` ثم يعيد الطلب مرة واحدة.
  - على **403** يوجّه المتصفح إلى `/no-permission`.
- **`ITEMS_PER_PAGE`**: 20 — متسق مع افتراضي التصفح في الخلفية (`DEFAULT_LIMIT`).

---

## البناء للإنتاج

```bash
npm run build
```

المخرجات ثابتة في **`dist/`**. يمكن تقديمها بأي خادم ملفات أو عبر **Nginx**:

- **`dashboard/nginx.conf`** في المستودع يفعّل **`try_files`** لدعم React Router، ويمرّر **`/api/`** إلى خدمة الخلفية (كما في صورة Docker).

إذا كان الـ API على نطاق فرعي أو خادم منفصل، عيّن **`VITE_API_BASE_URL`** قبل البناء ثم انشر **`dist`**.

---

## النشر

1. بناء الواجهة مع متغيرات الإنتاج الصحيحة.
2. رفع **`dist/`** إلى الخادم أو إلى مرحلة بناء Docker (`dashboard/Dockerfile`).
3. تأكد أن الخلفية تسمح بـ **`CORS_ORIGIN`** لنطاق لوحة التحكم، أو أن المتصفح يصل للـ API عبر **نفس المنشأ** (reverse proxy يدمج المسار `/api`).
4. HTTPS إلزامي لحماية الرموز في التخزين المحلي للمتصفح ضمن نموذج SPA الحالي.

---

## Docker

مع **`docker compose`** من جذر المستودع، تُبنى لوحة التحكم وتُعرض على المنفذ **8080** مع تمرير **`/api/`** إلى الحاوية **`backend`**. التفاصيل في **`README.md`** الجذري وملف **`docker-compose.yml`**.

---

لمزيد التفاصيل عن نقاط النهاية والمصادقة راجع **`backend/README.md`** وواجهة **`/api-docs`** على الخادم.
