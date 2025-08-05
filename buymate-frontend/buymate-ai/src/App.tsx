import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IntroPage     from './pages/IntroPage';
import ExperimentPage from './pages/ExperimentPage';
import PreQuestionnaire from "./pages/PreQuestionnaire";
import PostQuestionnaire from "./pages/PostQuestionnaire";
import ResultPage from "./pages/ResultPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"                   element={<IntroPage />} />
                <Route path="/experiment"         element={<ExperimentPage />} />
                <Route path="/pre-questionnaire"  element={<PreQuestionnaire />} />
                <Route path="/post-questionnaire" element={<PostQuestionnaire />} />
                <Route path="/result"             element={<ResultPage />} />
                <Route path="*"                   element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}