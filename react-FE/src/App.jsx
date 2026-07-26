import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import PostsPage from "./pages/PostsPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import PostWritePage from "./pages/PostWritePage.jsx";
import PostEditPage from "./pages/PostEditPage.jsx";
import UserEditPage from "./pages/UserEditPage.jsx";
import PasswordEditPage from "./pages/PasswordEditPage.jsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/new" element={<PostWritePage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/posts/:postId/edit" element={<PostEditPage />} />
            <Route path="/users/edit" element={<UserEditPage />} />
            <Route path="/users/password-edit" element={<PasswordEditPage />}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;