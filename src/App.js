import "./App.css";
import AuthContextProvider from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
function App() {
  return (
    <>
      <AuthContextProvider>
        <HomePage />
        {/* This is testing */}
      </AuthContextProvider>
    </>
  );
}

export default App;
