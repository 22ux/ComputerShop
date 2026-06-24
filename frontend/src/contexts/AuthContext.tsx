import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import http, { STORAGE_KEYS } from '../lib/http'
import type { AuthResponse, UserProfile } from '../types'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  fullName: string
  email: string
  password: string
  phone: string
  address: string
}

interface UpdateProfilePayload {
  fullName: string
  phone: string
  address: string
}

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>
  changePassword: (payload: ChangePasswordPayload) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem(STORAGE_KEYS.token))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      const cachedUser = localStorage.getItem(STORAGE_KEYS.user)
      if (cachedUser) {
        setUser(JSON.parse(cachedUser) as UserProfile)
      }

      try {
        const { data } = await http.get<UserProfile>('/auth/me')
        persistUser(data, token)
      } catch {
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [token])

  const persistUser = (nextUser: UserProfile, nextToken: string) => {
    setUser(nextUser)
    setToken(nextToken)
    localStorage.setItem(STORAGE_KEYS.token, nextToken)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser))
  }

  const persistAuth = (response: AuthResponse) => {
    persistUser(response.user, response.accessToken)
  }

  const clearSession = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.user)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === 'Admin',
      login: async (payload) => {
        const { data } = await http.post<AuthResponse>('/auth/login', payload)
        persistAuth(data)
      },
      register: async (payload) => {
        const { data } = await http.post<AuthResponse>('/auth/register', payload)
        persistAuth(data)
      },
      logout: clearSession,
      refreshProfile: async () => {
        const { data } = await http.get<UserProfile>('/auth/me')
        if (token) {
          persistUser(data, token)
        }
      },
      updateProfile: async (payload) => {
        const { data } = await http.put<UserProfile>('/auth/me', payload)
        if (token) {
          persistUser(data, token)
        }
      },
      changePassword: async (payload) => {
        await http.put('/auth/change-password', payload)
      },
    }),
    [isLoading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
