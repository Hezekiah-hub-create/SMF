export interface AuthContextType {
  user: any
  token: string | null
  isLoading: boolean
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: any; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; user?: any; error?: string }>
  logout: () => Promise<void>
}

export const AuthContext: React.Context<AuthContextType>
export const AuthProvider: ({ children }: { children: React.ReactNode }) => JSX.Element
export const useAuth: () => AuthContextType
