// hooks/useAuth.js
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signin = (email, senha) => {
    // ✅ Apenas salva no estado, sem localStorage
    setUser({ email, senha });
    return null; // Retorna null para indicar sucesso
  };

  const signup = (email, senha, area) => {
    // ✅ Apenas salva no estado, sem localStorage
    setUser({ email, senha, area });
    return null;
  };

  const signout = () => {
    // ✅ Apenas limpa o estado, sem localStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, signed: !!user, signin, signup, signout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
