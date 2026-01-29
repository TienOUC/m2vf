'use client'

import { useReducer, useCallback } from 'react';
import { createSession, getSessions, updateSession, deleteSession } from '@/lib/api/client/sessions';
import { SessionItem, SessionUpdate } from '@/types/chat';

interface UseSessionManagerProps {
  projectId: string | null;
}

interface SessionState {
  sessions: SessionItem[];
  isHistoryEmpty: boolean;
  isLoadingSessions: boolean;
  isCreatingSession: boolean;
  sessionError: string | null;
  currentSessionId: string | null;
}

type SessionAction =
  | { type: 'SET_SESSIONS'; payload: SessionItem[] }
  | { type: 'SET_IS_HISTORY_EMPTY'; payload: boolean }
  | { type: 'SET_IS_LOADING_SESSIONS'; payload: boolean }
  | { type: 'SET_IS_CREATING_SESSION'; payload: boolean }
  | { type: 'SET_SESSION_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_SESSION_ID'; payload: string | null }
  | { type: 'UPDATE_SESSION'; payload: { sessionId: string; updates: SessionUpdate } };

interface UseSessionManagerReturn {
  sessions: SessionItem[];
  isHistoryEmpty: boolean;
  isLoadingSessions: boolean;
  isCreatingSession: boolean;
  sessionError: string | null;
  currentSessionId: string | null;
  setCurrentSessionId: (sessionId: string | null) => void;
  fetchSessions: () => Promise<SessionItem[]>;
  handleNewSession: () => Promise<void>;
  handleSwitchSession: (sessionId: string) => Promise<void>;
  handleDeleteSession: (sessionId: string) => Promise<void>;
  handleRenameSession: (sessionId: string, newName: string) => Promise<void>;
  handleSessionUpdate: (updates: SessionUpdate) => void;
}

const initialState: SessionState = {
  sessions: [],
  isHistoryEmpty: false,
  isLoadingSessions: false,
  isCreatingSession: false,
  sessionError: null,
  currentSessionId: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
      };
    case 'SET_IS_HISTORY_EMPTY':
      return {
        ...state,
        isHistoryEmpty: action.payload,
      };
    case 'SET_IS_LOADING_SESSIONS':
      return {
        ...state,
        isLoadingSessions: action.payload,
      };
    case 'SET_IS_CREATING_SESSION':
      return {
        ...state,
        isCreatingSession: action.payload,
      };
    case 'SET_SESSION_ERROR':
      return {
        ...state,
        sessionError: action.payload,
      };
    case 'SET_CURRENT_SESSION_ID':
      return {
        ...state,
        currentSessionId: action.payload,
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session => {
          if (session.id === action.payload.sessionId) {
            if (action.payload.updates.config) {
              return {
                ...session,
                ...action.payload.updates,
                config: {
                  ...session.config,
                  ...action.payload.updates.config,
                },
              } as SessionItem;
            }
            return {
              ...session,
              ...action.payload.updates,
            } as SessionItem;
          }
          return session;
        }),
      };
    default:
      return state;
  }
}

export function useSessionManager({ projectId }: UseSessionManagerProps): UseSessionManagerReturn {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const {
    sessions,
    isHistoryEmpty,
    isLoadingSessions,
    isCreatingSession,
    sessionError,
    currentSessionId,
  } = state;

  // 获取会话列表
  const fetchSessions = useCallback(async (): Promise<SessionItem[]> => {
    if (!projectId) return [];
    
    dispatch({ type: 'SET_IS_LOADING_SESSIONS', payload: true });
    try {
      const response = await getSessions(projectId, {
        page: 1,
        page_size: 50
      }) as any;
      const sessionList = response.list || [];
      dispatch({ type: 'SET_SESSIONS', payload: sessionList });
      dispatch({ type: 'SET_IS_HISTORY_EMPTY', payload: sessionList.length === 0 });
      return sessionList;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      return [];
    } finally {
      dispatch({ type: 'SET_IS_LOADING_SESSIONS', payload: false });
    }
  }, [projectId]);

  // 处理会话更新
  const handleSessionUpdate = useCallback((updates: SessionUpdate) => {
    if (!currentSessionId) return;
    
    dispatch({ 
      type: 'UPDATE_SESSION', 
      payload: { 
        sessionId: currentSessionId, 
        updates 
      } 
    });
  }, [currentSessionId]);

  // 新建会话
  const handleNewSession = useCallback(async () => {
    if (!projectId || isCreatingSession) return;

    dispatch({ type: 'SET_IS_CREATING_SESSION', payload: true });
    dispatch({ type: 'SET_SESSION_ERROR', payload: null });
    try {
      // 如果存在当前会话，先更新其状态
      if (currentSessionId) {
        const currentSession = sessions.find(s => s.id === currentSessionId);
        if (currentSession) {
          await updateSession(currentSessionId, {
            title: currentSession.title
          });
        }
      }

      const payload = {
        config: {
          max_tokens: 4096,
          model: "auto",
          system_prompt: "",
          temperature: 0.7,
          thinking_mode: false,
          web_search: false
        },
        project_id: projectId,
        title: "新对话"
      };

      const response = await createSession(payload) as any;
      
      // 刷新会话列表
      const sessionList = await fetchSessions();
      
      // 确保设置当前会话ID
      if (response && response.id) {
        dispatch({ type: 'SET_CURRENT_SESSION_ID', payload: response.id });
      } else if (sessionList.length > 0) {
        // 如果响应中没有ID，但会话列表已更新，使用最新的会话
        const sortedSessions = [...sessionList].sort((a, b) => b.created_at - a.created_at);
        dispatch({ type: 'SET_CURRENT_SESSION_ID', payload: sortedSessions[0].id });
      }
      
    } catch (error: any) {
      console.error('创建会话失败:', error);
      
      // 处理会话限制错误
      if (error.message && error.message.includes('project session limit reached')) {
        dispatch({ type: 'SET_SESSION_ERROR', payload: '会话数量已达上限，请删除部分会话后重试' });
      } else {
        dispatch({ type: 'SET_SESSION_ERROR', payload: '创建会话失败，请重试' });
      }
    } finally {
      dispatch({ type: 'SET_IS_CREATING_SESSION', payload: false });
    }
  }, [projectId, isCreatingSession, currentSessionId, sessions, fetchSessions]);

  // 切换会话
  const handleSwitchSession = useCallback(async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    dispatch({ type: 'SET_CURRENT_SESSION_ID', payload: sessionId });
  }, [currentSessionId]);

  // 删除会话
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (!sessionId) return;

    try {
      await deleteSession(sessionId);
      
      // 刷新会话列表，确保所有会话状态一致
      const sessionList = await fetchSessions();
      
      // 如果删除的是当前会话，则切换到最新的会话或清空
      if (sessionId === currentSessionId) {
        if (sessionList.length > 0) {
          const sortedSessions = [...sessionList].sort((a, b) => b.last_message_at - a.last_message_at);
          dispatch({ type: 'SET_CURRENT_SESSION_ID', payload: sortedSessions[0].id });
        } else {
          dispatch({ type: 'SET_CURRENT_SESSION_ID', payload: null });
          dispatch({ type: 'SET_IS_HISTORY_EMPTY', payload: true });
          await handleNewSession();
        }
      }
    } catch (error) {
      console.error('删除会话失败:', error);
      dispatch({ type: 'SET_SESSION_ERROR', payload: '删除会话失败，请重试' });
    }
  }, [currentSessionId, fetchSessions, handleNewSession]);

  // 重命名会话
  const handleRenameSession = useCallback(async (sessionId: string, newName: string) => {
    try {
      await updateSession(sessionId, { title: newName });
      
      // 刷新会话列表，确保所有会话状态一致
      await fetchSessions();
    } catch (error) {
      console.error('重命名会话失败:', error);
      dispatch({ type: 'SET_SESSION_ERROR', payload: '重命名会话失败，请重试' });
    }
  }, [fetchSessions]);

  // 设置当前会话ID
  const setCurrentSessionId = useCallback((sessionId: string | null) => {
    dispatch({ type: 'SET_CURRENT_SESSION_ID', payload: sessionId });
  }, []);

  return {
    sessions,
    isHistoryEmpty,
    isLoadingSessions,
    isCreatingSession,
    sessionError,
    currentSessionId,
    setCurrentSessionId,
    fetchSessions,
    handleNewSession,
    handleSwitchSession,
    handleDeleteSession,
    handleRenameSession,
    handleSessionUpdate
  };
}
