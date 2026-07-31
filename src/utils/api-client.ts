import { useConfigStore } from '../stores/configStore';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

export class ApiClient {
  /** 当前流式请求的 AbortController（用于外部取消） */
  private currentController: AbortController | null = null;
  private maxRetries = 2;
  private retryDelay = 1000;

  /**
   * 主动取消当前流式请求（用户在 UI 上点"停止"时调用）
   */
  cancel(): void {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(
    url: string,
    init: RequestInit,
    retries = this.maxRetries
  ): Promise<Response> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, init);
        // 对 429/5xx 进行重试
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          await this.sleep(this.retryDelay * Math.pow(2, attempt));
          continue;
        }
      }
    }
    throw lastError || new Error('请求失败');
  }

  private getConfig() {
    return useConfigStore.getState().api;
  }

  private getHeaders(): Record<string, string> {
    const config = this.getConfig();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    };
  }

  async sendMessage(
    messages: ChatMessage[],
    systemPrompt?: string,
    options?: StreamOptions
  ): Promise<string> {
    const config = this.getConfig();
    const allMessages: ChatMessage[] = [];

    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const body = {
      model: config.model,
      messages: allMessages,
      stream: !!options,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    };

    if (options) {
      return this.streamRequest(body, options);
    }

    return this.normalRequest(body);
  }

  private async normalRequest(body: Record<string, unknown>): Promise<string> {
    const config = this.getConfig();
    const response = await this.fetchWithRetry(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async streamRequest(
    body: Record<string, unknown>,
    options: StreamOptions
  ): Promise<string> {
    const config = this.getConfig();
    // 暴露 AbortController，以便 apiClient.cancel() 可从外部中断
    this.currentController = new AbortController();
    const controller = this.currentController;
    const timeoutId = setTimeout(() => controller.abort(), config.streamTimeout);

    try {
      const response = await this.fetchWithRetry(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';
      let isDone = false;

      while (!isDone) {
        const { done, value } = await reader.read();
        if (done) {
          isDone = true;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              fullText += content;
              options.onChunk(content);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }

      options.onComplete(fullText);
      return fullText;
    } catch (error) {
      const wasAborted = error instanceof Error && error.name === 'AbortError';
      const wasUserCancelled = wasAborted && this.currentController === null;
      if (wasAborted) {
        // 用户主动停止：不报错，仅静默完成
        if (!wasUserCancelled) {
          options.onError(new Error('请求超时'));
        }
      } else {
        options.onError(error instanceof Error ? error : new Error(String(error)));
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      this.currentController = null;
    }
  }

  isConfigured(): boolean {
    const config = this.getConfig();
    return !!config.apiKey;
  }

  getConfigSummary(): string {
    const config = this.getConfig();
    return `${config.provider} / ${config.model}`;
  }
}

export const apiClient = new ApiClient();
