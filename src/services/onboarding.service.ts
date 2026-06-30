import { api, unwrap } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type {
  OnboardingAdminConfig,
  OnboardingOption,
  OnboardingQuestion,
  OnboardingQuestionType,
} from '@/types';

export interface CreateQuestionInput {
  key: string;
  questionAr: string;
  questionEn?: string;
  type: OnboardingQuestionType;
  sortOrder?: number;
  isActive?: boolean;
  isRequired?: boolean;
  options?: Array<{
    value: string;
    labelAr: string;
    labelEn?: string;
    sortOrder?: number;
  }>;
}

export interface CreateOptionInput {
  value: string;
  labelAr: string;
  labelEn?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const onboardingService = {
  listQuestions() {
    return unwrap<{ questions: OnboardingQuestion[] }>(
      api.get(`${ADMIN_PREFIX}/onboarding/admin/questions`)
    );
  },

  getConfig() {
    return unwrap<OnboardingAdminConfig>(api.get(`${ADMIN_PREFIX}/onboarding/admin/config`));
  },

  updateConfig(segmentedSleepEnabled: boolean) {
    return unwrap<OnboardingAdminConfig>(
      api.patch(`${ADMIN_PREFIX}/onboarding/admin/config`, { segmentedSleepEnabled })
    );
  },

  createQuestion(body: CreateQuestionInput) {
    return unwrap<{ question: OnboardingQuestion }>(
      api.post(`${ADMIN_PREFIX}/onboarding/admin/questions`, body)
    );
  },

  updateQuestion(id: string, body: Partial<CreateQuestionInput>) {
    return unwrap<{ question: OnboardingQuestion }>(
      api.patch(`${ADMIN_PREFIX}/onboarding/admin/questions/${id}`, body)
    );
  },

  createOption(questionId: string, body: CreateOptionInput) {
    return unwrap<{ option: OnboardingOption }>(
      api.post(`${ADMIN_PREFIX}/onboarding/admin/questions/${questionId}/options`, body)
    );
  },

  updateOption(id: string, body: Partial<CreateOptionInput>) {
    return unwrap<{ option: OnboardingOption }>(
      api.patch(`${ADMIN_PREFIX}/onboarding/admin/options/${id}`, body)
    );
  },

  removeOption(id: string) {
    return unwrap(api.delete(`${ADMIN_PREFIX}/onboarding/admin/options/${id}`));
  },
};
