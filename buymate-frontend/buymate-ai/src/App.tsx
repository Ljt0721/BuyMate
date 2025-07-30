import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExperimentPage from './pages/ExperimentPage';
import QuestionnairePage from './pages/QuestionnairePage';

function App() {
  return (
    <Router>
      <nav>
        <a href="/experiment">实验</a> | <a href="/questionnaire">问卷</a>
      </nav>
      <Routes>
        <Route path="/experiment" element={<ExperimentPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
      </Routes>
    </Router>
  );
}

export default App;
