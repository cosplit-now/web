import { createAuthClient } from "better-auth/vue"
import { anonymousClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    /**
     * 你的後端 API 基礎 URL。
     * 如果你的前端和後端在同一個網域下提供服務，則可以省略此項。
     * 請將其修改為你後端伺服器的實際位址。
     */
    baseURL: "https://cosplit-api.xinqi.mu", // <-- 請修改此處
    plugins: [
        anonymousClient()
    ],
    // 確保 credentials 被正確發送，讓 cookie 能正常工作
    fetchOptions: {
        credentials: 'include',
    }
})

/**
 * 你也可以選擇性地導出特定的方法，方便在元件中直接使用。
 * 
 * import { signIn, useSession } from '@/lib/auth-client';
 */
export const { signIn, signUp, signOut, useSession } = authClient;
