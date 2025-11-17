// App.jsx
import { AuthProvider } from "./context/Auth";
import RouteApp from "./Routes/RouteApp";

function App() {
  return (
    <AuthProvider>
      <RouteApp />
    </AuthProvider>
  );
}

export default App;
