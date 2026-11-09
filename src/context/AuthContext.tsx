
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getUserById } from "@features/users/api/users.api";
import { useCreateUser } from "@features/users/hooks/useUsers";
import { supabase } from "../lib/supabaseClient";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const handledUserIds = useRef(new Set<string>());
  const { mutateAsync: createUser } = useCreateUser();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error(error);
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const authUser = session?.user;

    if (
      !authUser?.email ||
      handledUserIds.current.has(authUser.id)
    ) {
      return;
    }

    handledUserIds.current.add(authUser.id);
    const userId = authUser.id;
    const email = authUser.email;

    void getUserById(userId)
      .then((user) => {
        if (user) {
          return;
        }

        return createUser({
          user_id: userId,
          user_name: email.split("@")[0],
          user_type: "master",
          is_coach: false,
          notes: "",
          is_active: true,
        });
      })
      .catch((error: unknown) => {
        handledUserIds.current.delete(userId);
        console.error("Failed to ensure authenticated user profile exists", error);
      });
  }, [createUser, session]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
