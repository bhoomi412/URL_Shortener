import { useState,useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { UrlShortener } from "./components/UrlShortener";
import { Feedback } from "./components/Feedback";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { Routes, Route, useNavigate } from "react-router-dom";
import { SignIn } from "./components/SignIn";
import {SignUp} from "./components/SignUp";

// export default function App() {
//   const navigate = useNavigate();

//   const handleSignInClick = () => {
//     navigate("/signin");
//   };

//   const handleSignUpClick = () => {
//     navigate("/signup");
//   };
//   const [user, setUser] = useState<any>(null);
//   const [token, setToken] = useState(localStorage.getItem("token"));


//   return (
    
//     <div className="min-h-screen bg-white">
//       <Routes>
//         <Route
//           path="/signin"
//           element={
            
//             <SignIn
//               onBack={() => navigate("/")}
//               onSwitchToSignUp={() => navigate("/signup")}
//               onSignInSuccess={(userData, accessToken) => {
//                 setUser(userData);
//                 setToken(accessToken);
//               }}
//             />
//           }
//         />
//         <Route
//           path="/signup"
//           element={
//             <SignUp
//               onBack={() => navigate("/")}
//               onSwitchToSignIn={() => navigate("/signin")}
//             />
//           }
//         />
//       </Routes>
//       <Navigation onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
//       <main>
//         <UrlShortener />
//         <Feedback />
//       </main>
//       <Footer />
//       <Toaster />
//     </div>
//   );
// }
type ViewType = "home" | "signin" | "signup";
export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string|null>(null);
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  },[]);
  const handleSignInClick = () => setCurrentView("signin");
  const handleSignUpClick = () => setCurrentView("signup");
  const handleBackToHome = () => setCurrentView("home");
  const handleSwitchToSignUp = () => setCurrentView("signup");
  const handleSwitchToSignIn = () => setCurrentView("signin");
   const handleSignInSuccess = (userData: any, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
  };

  // Handle successful sign up
  const handleSignUpSuccess = (userData: any, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (currentView === 'signin') {
    return (
      <>
        <SignIn 
          onBack={handleBackToHome}
          onSwitchToSignUp={handleSwitchToSignUp}
          onSignInSuccess={handleSignInSuccess}  // ✅ Add this
        />
        <Toaster />
      </>
    );
  }

  if (currentView === 'signup') {
    return (
      <>
        <SignUp 
          onBack={handleBackToHome}
          onSwitchToSignIn={handleSwitchToSignIn}
          onSignUpSuccess={handleSignUpSuccess}  // Add this
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
        user={user}  //  Pass user to show logout button
        onLogout={handleLogout}  //Pass logout handler
      />
      <main>
        <UrlShortener 
          token={token}  // Pass token to shortener
          user={user}    // Pass user data
          isGuest={!user}  // Track if guest
        />
        <Feedback />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}