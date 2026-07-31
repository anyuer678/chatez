/**
 * key-vault.ts — API Key 加密保险库
 *
 * 风险：API Key 明文存 localStorage，任何能读取存储的人（XSS、备份恢复、
 * 磁盘取证）都能直接拿到密钥。
 *
 * 方案：AES-GCM 加密后存入 localStorage；加密密钥存 sessionStorage，
 * 仅当前标签页会话内有效。刷新页面不丢，关闭浏览器/新标签页需重新输入密钥。
 */

const VAULT_KEY_NAME = 'chatez-vault-key'; // sessionStorage
const VAULT_DATA_NAME = 'chatez-vault';    // localStorage: { iv, data }

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** 获取当前会话的加密密钥；没有则生成并存入 sessionStorage */
async function getOrCreateKey(): Promise<CryptoKey> {
  const existing = sessionStorage.getItem(VAULT_KEY_NAME);
  if (existing) {
    try {
      return await crypto.subtle.importKey(
        'raw', base64ToBytes(existing), 'AES-GCM', false, ['encrypt', 'decrypt']
      );
    } catch {
      // 密钥损坏：丢弃，重新生成
      sessionStorage.removeItem(VAULT_KEY_NAME);
    }
  }
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'] // extractable: true 才能导出到 sessionStorage
  );
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  sessionStorage.setItem(VAULT_KEY_NAME, bytesToBase64(raw));
  return key;
}

/** 加密并持久化 API Key */
export async function saveApiKey(apiKey: string): Promise<void> {
  if (!apiKey) {
    localStorage.removeItem(VAULT_DATA_NAME);
    return;
  }
  if (!crypto?.subtle) return; // 非安全上下文（罕见），跳过加密，走内存
  try {
    const key = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(apiKey)
    );
    localStorage.setItem(
      VAULT_DATA_NAME,
      JSON.stringify({ iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(cipher)) })
    );
  } catch (e) {
    console.warn('[KeyVault] 加密失败，密钥仅保存在内存中', e);
  }
}

/** 读取并解密 API Key；无数据 / 密钥丢失（新会话）/ 解密失败时返回 null */
export async function loadApiKey(): Promise<string | null> {
  const raw = localStorage.getItem(VAULT_DATA_NAME);
  if (!raw) return null;
  try {
    const { iv, data } = JSON.parse(raw) as { iv: string; data: string };
    const key = await getOrCreateKey();
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(iv) },
      key,
      base64ToBytes(data)
    );
    return new TextDecoder().decode(plain);
  } catch {
    // 密钥丢失（换标签页/清 sessionStorage）或数据损坏：无法解密
    return null;
  }
}

/** 清除持久化的密钥密文 */
export function clearApiKey(): void {
  localStorage.removeItem(VAULT_DATA_NAME);
}

/** 当前会话是否有可用的解密密钥（决定旧密文能否恢复） */
export function hasSessionKey(): boolean {
  return !!sessionStorage.getItem(VAULT_KEY_NAME);
}
