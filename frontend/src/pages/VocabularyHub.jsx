import React, { useState, useEffect } from 'react';
// Nếu cấu trúc thư mục của bạn khác, hãy điều chỉnh đường dẫn import cho phù hợp
import Toast from '../components/Vocabulary/Toast';
import VocabularyList from '../components/Vocabulary/VocabularyList';
import VocabularyTranslate from '../components/Vocabulary/VocabularyTranslate';
import StudySelection from '../components/Vocabulary/StudySelection';
import FlashcardMode from '../components/Vocabulary/FlashcardMode';
import QuizMode from '../components/Vocabulary/QuizMode';

// Dữ liệu mẫu ban đầu (Sẽ thay bằng gọi axios đến Backend)
const initialVocabs = [
  { id: 1, word: 'Accomplish', phonetic: '/əˈkʌm.plɪʃ/', type: 'Verb', meaning: 'Hoàn thành, đạt được', example: 'She accomplished her goal.', status: 'Đang học' },
  { id: 2, word: 'Efficient', phonetic: '/ɪˈfɪʃ.ənt/', type: 'Adj', meaning: 'Hiệu quả, có năng suất', example: 'This is an efficient method.', status: 'Đang học' },
  { id: 3, word: 'Significant', phonetic: '/sɪɡˈnɪf.ɪ.kənt/', type: 'Adj', meaning: 'Quan trọng, đáng kể', example: 'There was a significant improvement.', status: 'Đã thuộc' },
  { id: 4, word: 'Opportunity', phonetic: '/ˌɒp.əˈtʃuː.nə.ti/', type: 'Noun', meaning: 'Cơ hội, thời cơ', example: 'Don\'t miss this opportunity.', status: 'Đang học' },
  { id: 5, word: 'Implement', phonetic: '/ˈɪm.plɪ.mənt/', type: 'Verb', meaning: 'Thi hành, thực hiện', example: 'We need to implement this new policy.', status: 'Đang học' },
];

const VocabularyHub = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'translate', 'study'
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State điều hướng chế độ học
  const [studyMode, setStudyMode] = useState(null); // 'flashcard' or 'quiz'
  const [studyList, setStudyList] = useState([]);

  // State thông báo
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Gọi API lấy dữ liệu sổ tay từ vựng: axios.get('/api/users/vocabularies')
    setTimeout(() => {
      setVocabularies(initialVocabs);
      setLoading(false);
    }, 500);
  }, []);

  const handleSaveToNotebook = (newWord) => {
    // API Call thêm từ vựng mới
    const newVocab = { ...newWord, id: Date.now(), status: 'Đang học' };
    setVocabularies([newVocab, ...vocabularies]);
    setToast({ message: 'Đã lưu từ vựng vào sổ tay cá nhân!', type: 'success' });
    setActiveTab('list');
  };

  const handleStartStudy = (mode) => {
    const wordsToStudy = vocabularies.filter(v => v.status === 'Đang học');
    if (wordsToStudy.length === 0) {
      setToast({ message: 'Bạn đã thuộc tất cả từ vựng! Hãy thêm từ mới nhé.', type: 'warning' });
      return;
    }
    // Lọc danh sách và trộn ngẫu nhiên
    const shuffled = [...wordsToStudy].sort(() => 0.5 - Math.random());
    setStudyList(shuffled);
    setStudyMode(mode);
  };

  const handleUpdateVocabStatus = (id, newStatus) => {
    // API Call cập nhật status: axios.put(`/api/vocabularies/${id}/status`, { status: newStatus })
    setVocabularies(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-medium text-gray-500">Đang tải dữ liệu từ vựng...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Header Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-extrabold text-blue-900">Vocabulary<span className="text-blue-500">Hub</span></h1>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {setActiveTab('list'); setStudyMode(null);}}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'list' && !studyMode ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
              >Sổ tay từ vựng</button>
              <button 
                onClick={() => {setActiveTab('translate'); setStudyMode(null);}}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'translate' && !studyMode ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
              >Tra từ & Thêm</button>
              <button 
                onClick={() => {setActiveTab('study'); setStudyMode(null);}}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'study' || studyMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-800 text-white hover:bg-gray-700 shadow-sm'}`}
              >
                <span>🔥</span> Ôn tập ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {!studyMode && activeTab === 'list' && <VocabularyList vocabularies={vocabularies} />}
        {!studyMode && activeTab === 'translate' && <VocabularyTranslate onSaveToNotebook={handleSaveToNotebook} />}
        {!studyMode && activeTab === 'study' && <StudySelection onStartStudy={handleStartStudy} />}
        
        {studyMode === 'flashcard' && (
          <FlashcardMode 
            studyList={studyList} 
            onUpdateVocabStatus={handleUpdateVocabStatus} 
            onExit={() => setStudyMode(null)} 
          />
        )}
        
        {studyMode === 'quiz' && (
          <QuizMode 
            studyList={studyList} 
            allVocabularies={vocabularies} 
            onUpdateVocabStatus={handleUpdateVocabStatus} 
            onExit={() => setStudyMode(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default VocabularyHub;
