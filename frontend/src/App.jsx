import { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Pagination from './components/Pagination';
import SyllabusForm from './components/SyllabusForm';
import SyllabusList from './components/SyllabusList';
import SyllabusView from './components/SyllabusView';
import SyllabusFilters from './components/SyllabusFilters';
import SyllabusTemplateView from './components/SyllabusTemplateView';
import SyllabusPrintView from './components/SyllabusPrintView';
import CanvasEditor from './components/CanvasEditor';
import { syllabusAPI } from './services/api';

function App() {
  const [activeSection, setActiveSection] = useState('syllabi');
  
  // Syllabus state
  const [syllabi, setSyllabi] = useState([]);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [viewingSyllabus, setViewingSyllabus] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [viewingPrint, setViewingPrint] = useState(null);
  const [editingCanvas, setEditingCanvas] = useState(null);
  const [syllabiLoading, setSyllabiLoading] = useState(false);
  const [syllabusPage, setSyllabusPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  useEffect(() => {
    if (activeSection === 'syllabi') {
      fetchSyllabi();
    }
  }, [activeSection, syllabusPage, filterStatus, filterSemester]);

  const fetchSyllabi = async () => {
    setSyllabiLoading(true);
    try {
      const params = { page: syllabusPage, limit: 12 };
      if (filterStatus) params.status = filterStatus;
      if (filterSemester) params.semester = filterSemester;
      
      const response = await syllabusAPI.getSyllabi(params);
      setSyllabi(response.data.syllabi);
    } catch (error) {
      console.error('Error fetching syllabi:', error);
    } finally {
      setSyllabiLoading(false);
    }
  };

  // Syllabus handlers
  const handleSyllabusCreated = (newSyllabus) => {
    setSyllabi([newSyllabus, ...syllabi]);
    setEditingSyllabus(null);
  };

  const handleSyllabusUpdated = (updatedSyllabus) => {
    setSyllabi(syllabi.map(syllabus => 
      syllabus._id === updatedSyllabus._id ? updatedSyllabus : syllabus
    ));
    setEditingSyllabus(null);
  };

  const handleEditSyllabus = (syllabus) => {
    setEditingSyllabus(syllabus);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewSyllabus = (syllabus) => {
    setViewingSyllabus(syllabus);
  };

  const handleViewTemplate = (syllabus) => {
    setViewingTemplate(syllabus);
  };

  const handleViewPrint = (syllabus) => {
    setViewingPrint(syllabus);
  };

  const handleEditCanvas = (syllabus) => {
    setEditingCanvas(syllabus);
  };

  const handleCanvasSave = async (updatedSyllabus) => {
    try {
      const response = await syllabusAPI.updateSyllabus(updatedSyllabus._id, updatedSyllabus);
      setSyllabi(syllabi.map(syllabus => 
        syllabus._id === updatedSyllabus._id ? response.data.syllabus : syllabus
      ));
      setEditingCanvas(null);
    } catch (error) {
      console.error('Error saving canvas:', error);
    }
  };

  const handleDeleteSyllabus = (id) => {
    setSyllabi(syllabi.filter(syllabus => syllabus._id !== id));
  };

  const handleCancelEditSyllabus = () => {
    setEditingSyllabus(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Syllabi Section */}
        {activeSection === 'syllabi' && (
          <>
            {/* Syllabus Form */}
            {(editingSyllabus || !syllabi.length) && (
              <SyllabusForm
                onSyllabusCreated={handleSyllabusCreated}
                editSyllabus={editingSyllabus}
                onSyllabusUpdated={handleSyllabusUpdated}
                onCancel={handleCancelEditSyllabus}
              />
            )}

            {/* Filters */}
            <SyllabusFilters
              filterStatus={filterStatus}
              filterSemester={filterSemester}
              onStatusChange={(value) => {
                setFilterStatus(value);
                setSyllabusPage(1);
              }}
              onSemesterChange={(value) => {
                setFilterSemester(value);
                setSyllabusPage(1);
              }}
              onRefresh={fetchSyllabi}
              showCreateButton={!editingSyllabus && syllabi.length > 0}
              onCreateClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />

            {/* Syllabus List */}
            <SyllabusList
              onViewTemplate={handleViewTemplate}
              syllabi={syllabi}
              onEditSyllabus={handleEditSyllabus}
              onDeleteSyllabus={handleDeleteSyllabus}
              onViewSyllabus={handleViewSyllabus}
              onViewPrint={handleViewPrint}
              onEditCanvas={handleEditCanvas}
              loading={syllabiLoading}
            />

            {/* Syllabus Pagination */}
            {syllabi.length > 0 && (
              <Pagination
                currentPage={syllabusPage}
                onPageChange={setSyllabusPage}
                itemsCount={syllabi.length}
                itemsPerPage={12}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {viewingSyllabus && (
        <SyllabusView
          syllabus={viewingSyllabus}
          onClose={() => setViewingSyllabus(null)}
          onEdit={handleEditSyllabus}
        />
      )}

      {viewingTemplate && (
        <SyllabusTemplateView
          syllabus={viewingTemplate}
          onClose={() => setViewingTemplate(null)}
        />
      )}

      {viewingPrint && (
        <SyllabusPrintView
          syllabus={viewingPrint}
          onClose={() => setViewingPrint(null)}
        />
      )}

      {editingCanvas && (
        <CanvasEditor
          syllabus={editingCanvas}
          onClose={() => setEditingCanvas(null)}
          onSave={handleCanvasSave}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
