export const API_BASE_URL = 'https://mihest.ru/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
let sessionToken: string | null = null;
let sessionTokenType = 'Bearer';
const SESSION_TOKEN_KEY = 'mobile_auth_token';
const SESSION_TOKEN_TYPE_KEY = 'mobile_auth_token_type';

export type QuestAnswer = {
  id: number;
  option_order: number;
  answer_text: string;
  is_correct: boolean;
};

export type QuestCheckpoint = {
  id: number;
  order: number;
  title: string;
  task: string;
  question_type: 'code' | 'choice' | string;
  address: string;
  point_rules: string;
  lat: number;
  lng: number;
  hints: string[];
  answers: QuestAnswer[];
};

export type QuestDetails = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  city_district: string;
  category: string;
  age_group_id: string;
  cover_file: string;
  difficulty: number;
  duration_minutes: number;
  rules_warning: string;
  status: string;
  rejection_reason: string | null;
  published_at: string | null;
  created_at: string;
  checkpoints: QuestCheckpoint[];
};

export type QuestListResponse = {
  items: QuestDetails[];
  total: number;
};

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(sessionToken ? { Authorization: `${sessionTokenType} ${sessionToken}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data && 'detail' in data && typeof data.detail === 'string'
        ? data.detail
        : undefined) || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function fetchQuests(status = 'Опубликовано', from = 0, count = 20) {
  const query = new URLSearchParams({
    status,
    from: String(from),
    count: String(count),
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  return request<QuestListResponse>(`/quests?${query.toString()}`);
}

export function fetchQuestById(questId: string) {
  return request<QuestDetails>(`/quests/${encodeURIComponent(questId)}`);
}

export function sendModerationDecision(questId: string, action: 'publish' | 'reject', reason = '') {
  return request(`/quests/${encodeURIComponent(questId)}/moderation/decision`, 'POST', { action, reason });
}

export type AuthUser = {
  id: string;
  username: string;
  role: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export function getSessionToken() {
  return sessionToken;
}

export async function hydrateSession() {
  const [token, tokenType] = await Promise.all([
    AsyncStorage.getItem(SESSION_TOKEN_KEY),
    AsyncStorage.getItem(SESSION_TOKEN_TYPE_KEY),
  ]);
  sessionToken = token;
  sessionTokenType = tokenType || 'Bearer';
  return !!sessionToken;
}

export async function signIn(username: string, password: string) {
  const data = await request<AuthResponse>('/auth/SignIn', 'POST', { username, password });
  sessionToken = data.access_token;
  sessionTokenType = data.token_type || 'Bearer';
  await Promise.all([
    AsyncStorage.setItem(SESSION_TOKEN_KEY, sessionToken),
    AsyncStorage.setItem(SESSION_TOKEN_TYPE_KEY, sessionTokenType),
  ]);
  return data;
}

export async function signUp(username: string, nickname: string, age_group_id: string, password: string, confirm_password: string) {
  const data = await request<AuthResponse>('/auth/SignUp', 'POST', {
    username,
    nickname,
    age_group_id,
    password,
    confirm_password,
  });
  sessionToken = data.access_token;
  sessionTokenType = data.token_type || 'Bearer';
  await Promise.all([
    AsyncStorage.setItem(SESSION_TOKEN_KEY, sessionToken),
    AsyncStorage.setItem(SESSION_TOKEN_TYPE_KEY, sessionTokenType),
  ]);
  return data;
}

export async function signOut() {
  try {
    await request('/auth/SignOut', 'PUT');
  } finally {
    sessionToken = null;
    sessionTokenType = 'Bearer';
    await Promise.all([
      AsyncStorage.removeItem(SESSION_TOKEN_KEY),
      AsyncStorage.removeItem(SESSION_TOKEN_TYPE_KEY),
    ]);
  }
}

export function validateToken() {
  return request('/auth/Validate', 'GET');
}

export type TeamMember = {
  user_id: string;
  created_at: string;
  user?: { username?: string; role?: string };
};

export type TeamResponse = {
  id: string;
  owner_id: string;
  name: string;
  join_code: string;
  created_at: string;
  team_members: TeamMember[];
};

export function getTeam() {
  return request<TeamResponse>('/teams');
}

export function createTeam(name: string) {
  return request('/teams', 'POST', { name });
}

export function joinTeam(code: string) {
  return request('/teams/join', 'POST', { code });
}

export type CreateQuestPayload = {
  title: string;
  description: string;
  city_district: string;
  difficulty: number;
  duration_minutes: number;
  rules_warning: string;
  category?: string;
  age_group_id?: string;
  checkpoints: Array<{
    order: number;
    title: string;
    task: string;
    question_type: 'code' | 'choice';
    address?: string;
    lat: number;
    lng: number;
    hints: string[];
    point_rules: string;
    answer_options?: Array<{
      option_order: number;
      answer_text: string;
      is_correct: boolean;
    }>;
  }>;
};

export async function createQuest(payload: CreateQuestPayload) {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));

  const response = await fetch(`${API_BASE_URL}/quests`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(sessionToken ? { Authorization: `${sessionTokenType} ${sessionToken}` } : {}),
    },
    body: formData,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message =
      (typeof data === 'object' && data && 'detail' in data && typeof data.detail === 'string'
        ? data.detail
        : undefined) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data as QuestDetails;
}
