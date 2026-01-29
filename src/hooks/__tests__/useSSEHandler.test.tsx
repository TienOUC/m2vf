import { renderHook, act } from '@testing-library/react';
import { useSSEHandler } from '../useSSEHandler';
import { streamChat } from '@/lib/api/client/sessions';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/api/client/sessions', () => ({
  streamChat: vi.fn(),
}));

vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({ addError: vi.fn() }),
}));

describe('useSSEHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle streaming flow correctly', async () => {
    // Setup streamChat mock to simulate events
    (streamChat as any).mockImplementation(async (data: any, onEvent: any, onError: any) => {
      // 1. Thought event
      onEvent({ 
        type: 'message', // SSE type default
        data: { type: 'thought', content: { desc: 'Thinking...' } } 
      });
      
      // 2. Message event
      onEvent({ 
        type: 'message', 
        data: { type: 'message', content: { text: 'Here is the image' } } 
      });

      // 3. Artifact creation
      onEvent({ 
        type: 'message', 
        data: { 
          type: 'artifact', 
          content: { id: 'a1', type: 'image', status: 'pending' } 
        } 
      });

      // 4. Artifact status update (processing)
      onEvent({ 
        type: 'message', 
        data: { 
          type: 'artifact_status', 
          content: { artifacts: [{ id: 'a1', status: 'processing' }], all_done: false } 
        } 
      });

      // 5. Artifact status update (completed)
      onEvent({ 
        type: 'message', 
        data: { 
          type: 'artifact_status', 
          content: { artifacts: [{ id: 'a1', status: 'completed', url: 'http://img.url' }], all_done: true } 
        } 
      });

      // 6. Done
      onEvent({ type: 'done', data: {} });
      return true;
    });

    const { result } = renderHook(() => useSSEHandler({ sessionId: 'test-session' }));

    // Trigger send
    await act(async () => {
      await result.current.handleSend('Generate image', 'model-1', false);
    });

    // Verify messages
    const messages = result.current.messages;
    expect(messages).toHaveLength(2); // User + Assistant

    const assistantMsg = messages[1];
    expect(assistantMsg.role).toBe('assistant');
    
    // Check content
    expect(assistantMsg.content).toBe('Here is the image');
    
    // Check artifacts
    expect(assistantMsg.artifacts).toHaveLength(1);
    expect(assistantMsg.artifacts![0].status).toBe('completed');
    expect(assistantMsg.artifacts![0].url).toBe('http://img.url');
    
    // Check backward compatibility
    expect(assistantMsg.imageUrl).toBe('http://img.url');
    
    // Check thought cleared
    expect(assistantMsg.thought).toBeUndefined();
  });

  it('should show thought text while processing', async () => {
    (streamChat as any).mockImplementation(async (data: any, onEvent: any) => {
      onEvent({ 
        type: 'message', 
        data: { type: 'thought', content: { desc: 'Processing...' } } 
      });
      // Do not finish immediately
    });

    const { result } = renderHook(() => useSSEHandler({ sessionId: 'test-session' }));

    await act(async () => {
      await result.current.handleSend('test', 'model-1', false);
    });

    const assistantMsg = result.current.messages[1];
    expect(assistantMsg.thought).toBe('Processing...');
  });

  it('should clean up state when cancelled', async () => {
    let abortController: AbortController | undefined;

    (streamChat as any).mockImplementation(async (data: any, onEvent: any, onError: any, controller: AbortController) => {
      abortController = controller;
      
      // 1. Send thought
      onEvent({ 
        type: 'message', 
        data: { type: 'thought', content: { desc: 'Thinking...' } } 
      });
      
      // 2. Create pending artifact
      onEvent({ 
        type: 'message', 
        data: { 
          type: 'artifact', 
          content: { id: 'a1', type: 'image', status: 'pending' } 
        } 
      });
      
      // Keep it hanging...
      return new Promise(() => {}); 
    });

    const { result } = renderHook(() => useSSEHandler({ sessionId: 'test-session' }));

    await act(async () => {
      result.current.handleSend('test', 'model-1', false);
    });

    // Verify initial state
    let assistantMsg = result.current.messages[1];
    expect(assistantMsg.thought).toBe('Thinking...');
    expect(assistantMsg.artifacts![0].status).toBe('pending');
    expect(result.current.isGenerating).toBe(true);

    // Cancel
    await act(async () => {
      result.current.cancelGeneration();
    });

    // Verify cancelled state
    assistantMsg = result.current.messages[1];
    expect(assistantMsg.thought).toBeUndefined(); // Thought cleared
    expect(assistantMsg.artifacts![0].status).toBe('failed'); // Artifact marked as failed
    expect(result.current.isGenerating).toBe(false);
    expect(abortController?.signal.aborted).toBe(true);
  });
});
