export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'INACTIVE';
export type SleepZone = 'PEAK' | 'COMFORT' | 'CAUTION' | 'DANGER';
export type SleepGoalType = 'FAJR_WAKE' | 'SHIFT_SYSTEM' | 'DEBT_RECOVERY' | 'FOCUS_BOOST';
export type MainGoal = 'SEGMENTED_SLEEP' | 'DEBT_RECOVERY' | 'NAP_MASTERY' | 'QUALITY_TRACKING';
export type SessionType = 'MAIN' | 'NAP';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
export type TrendDirection = 'up' | 'down';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  status: string;
  roles?: { id: string; name: string; nameAr?: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { pagination?: PaginationMeta };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TrendMetric {
  value: number;
  direction: TrendDirection;
}

export interface OverviewData {
  totalUsers: number;
  activeUsers?: number;
  newUsersToday?: number;
  newUsersThisMonth?: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  avgSleepHours: number;
  usersByZone: Record<SleepZone, number>;
  userGrowthChart: { date: string; count: number }[];
  revenueChart: { month: string; revenue: number }[];
  recentUsers: UserListItem[];
  trends?: Record<string, TrendMetric>;
}

export interface AnalyticsData {
  rangeDays: number;
  dailySleepHours: { date: string; hours: number }[];
  debtComparison: { date: string; avgDebtHours: number; targetHours: number }[];
  sleepGoalDistribution: { goal: SleepGoalType; count: number }[];
  bedtimeDistribution: { bucket: string; count: number }[];
  stats: {
    sleepSessionsThisMonth: number;
    napSessionsThisMonth: number;
    avgNapDurationMinutes: number;
    usersHitTargetToday: number;
  };
}

export interface LoginResponse {
  tokens: { accessToken: string; refreshToken: string };
  admin: AdminProfile;
}

export interface UserListItem {
  id: string;
  email: string | null;
  fullName: string;
  gender: Gender | null;
  status: UserStatus;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  sleepProfile?: {
    mainGoal: MainGoal | null;
    sleepGoalType: SleepGoalType | null;
  } | null;
  sleepZone: SleepZone | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionPlan?: { nameAr: string; nameEn: string } | null;
}

export interface UserDetailData {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string;
    gender: Gender | null;
    locale: string;
    timezone: string;
    status: UserStatus;
    createdAt: string;
    lastLoginAt: string | null;
    lastActiveAt: string | null;
  };
  sleepProfile: Record<string, unknown> | null;
  recentSleepRecords: SleepLog[];
  subscriptions: UserSubscription[];
  recentSleepDebt: SleepDebtRow[];
  payments: Payment[];
  reminders: Reminder[];
  notifications: Notification[];
  auditLog: AuditEntry[];
  todaySleep: SleepDebtRow | null;
  dailyPlan: DailySleepPlan | null;
}

export interface Supervisor {
  id: string;
  email: string;
  fullName: string;
  status: string;
  lastLoginAt: string | null;
  roles: { id: string; name: string; nameAr?: string }[];
}

export interface Role {
  id: string;
  name: string;
  nameAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  isSystem?: boolean;
  permissions: string[] | Permission[];
  permissionKeys?: string[];
  adminCount?: number;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  nameAr?: string;
  module: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  sleepStart: string;
  sleepEnd: string;
  durationMinutes: number;
  sessionType: SessionType;
  quality?: string | null;
  source: string;
  notes?: string | null;
  externalId?: string | null;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
  healthSource?: { id: string; nameAr: string; nameEn: string; type: string } | null;
}

export interface NapRecord {
  id: string;
  userId: string;
  napStart: string;
  napEnd: string;
  durationMinutes: number;
  source: string;
  notes?: string | null;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
}

export interface SleepDebtRow {
  id: string;
  userId: string;
  date: string;
  targetMinutes: number;
  actualMinutes: number;
  debtMinutes: number;
  cumulativeDebt: number;
  weightedDebtMinutes?: number;
  weightedDebtFormatted?: string;
  zone?: SleepZone | null;
  trendMinutes?: number;
  user?: { id: string; fullName: string; email: string };
}

export type SupportTicketCategory =
  | 'TECHNICAL_ISSUE'
  | 'FEATURE_SUGGESTION'
  | 'GENERAL_FEEDBACK';

export interface HealthSource {
  id: string;
  type: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  iconUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { connections?: number };
}

export interface SyncLog {
  id: string;
  userId: string;
  connectionId?: string;
  sourceId?: string;
  status: string;
  recordsCount: number;
  errorMessage?: string | null;
  startedAt: string;
  completedAt?: string | null;
  /** @deprecated use completedAt */
  finishedAt?: string | null;
  user?: { id?: string; fullName: string; email?: string | null };
  source?: { type?: string; nameAr: string; nameEn: string };
  connection?: {
    user?: { id: string; fullName: string; email: string | null };
  };
}

export interface Reminder {
  id: string;
  userId: string;
  type: string;
  time: string;
  daysOfWeek?: number[] | null;
  status: string;
  fajrOffset?: number | null;
  /** @deprecated use fajrOffset */
  fajrOffsetMinutes?: number;
  user?: { fullName: string; email: string };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  titleAr: string;
  titleEn?: string | null;
  channel: string;
  isRead: boolean;
  readAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  user?: { fullName: string; email: string };
}

export interface UserSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  autoRenew?: boolean;
  cancelledAt?: string | null;
  plan?: { nameAr: string; nameEn: string };
  /** @deprecated use startDate */
  startsAt?: string;
  /** @deprecated use endDate */
  endsAt?: string | null;
}

export interface Payment {
  id: string;
  amount: string | number;
  currency: string;
  method: string;
  status: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  module: string;
  createdAt: string;
  admin?: { fullName: string };
}

export interface DailySleepPlan {
  id: string;
  date: string;
  phase1Start?: string | null;
  phase1End?: string | null;
  phase2Start?: string | null;
  phase2End?: string | null;
  fajrTime?: string | null;
  targetMinutes: number;
  zone?: SleepZone | null;
}

export interface SleepPlanResponse {
  profile: Record<string, unknown> | null;
  plan: DailySleepPlan | null;
  records: SleepLog[];
  debt: SleepDebtRow | null;
}

export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME' | 'WEEKLY';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'BANK_TRANSFER' | 'OTHER';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'OTHER';

export interface Plan {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: string | number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays: number;
  features?: Record<string, string> | string[] | null;
  isActive: boolean;
  sortOrder?: number;
}

export interface SubscriptionStats {
  ACTIVE: number;
  TRIAL: number;
  EXPIRED: number;
  CANCELLED: number;
  PENDING: number;
}

export interface SubscriptionListItem {
  id: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  cancelledAt: string | null;
  user?: { id: string; fullName: string; email: string | null };
  plan?: { id: string; nameAr: string; nameEn: string; price?: string | number; currency?: string; billingCycle?: string };
}

export interface SubscriptionDetail extends SubscriptionListItem {
  trialEnd?: string | null;
  payments?: PaymentListItem[];
}

export interface PaymentStats {
  totalRevenue: number;
  monthRevenue: number;
  avgPerUser: number;
  refundsCount: number;
}

export interface PaymentListItem {
  id: string;
  amount: string | number;
  currency: string;
  method: PaymentMethod | null;
  status: PaymentStatus;
  providerRef?: string | null;
  paidAt?: string | null;
  createdAt: string;
  user?: { id: string; fullName: string; email: string | null };
}

export interface ContentPageItem {
  id: string;
  slug: string;
  titleAr: string;
  titleEn?: string | null;
  contentAr: string;
  contentEn?: string | null;
  type: string;
  status: ContentStatus;
  sortOrder: number;
  createdAt?: string;
  updatedAt: string;
}

export interface SleepTipItem {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  contentAr: string;
  contentEn?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  status: ContentStatus;
  sortOrder: number;
  updatedAt?: string;
}

export interface ContentListResponse {
  pages: ContentPageItem[];
  tips: SleepTipItem[];
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  valueType: string;
  labelAr?: string | null;
  labelEn?: string | null;
}

export interface SupportTicket {
  id: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; fullName: string; email: string | null };
  replies?: { id: string }[];
}

export interface SupportTicketReply {
  id: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
  admin?: { id: string; fullName: string } | null;
}

export interface SupportTicketDetail extends SupportTicket {
  replies: SupportTicketReply[];
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  module: string;
  entityType?: string | null;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  admin?: {
    id: string;
    fullName: string;
    roles?: { role: { name: string; nameAr: string } }[];
  } | null;
}

export interface AuditLogStats {
  total: number;
  today: number;
  deletes: number;
  exports: number;
}
