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
import TemplateForm from './components/TemplateForm';
import TemplateList from './components/TemplateList';
import CanvasEditor from './components/CanvasEditor';
import { syllabusAPI, templateAPI } from './services/api';

function App() {
  const [activeSection, setActiveSection] = useState('syllabi');
  
  // Syllabus state
  const [syllabi, setSyllabi] = useState([]);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [viewingSyllabus, setViewingSyllabus] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [viewingPrint, setViewingPrint] = useState(null);
  const [syllabiLoading, setSyllabiLoading] = useState(false);
  const [syllabusPage, setSyllabusPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  // Template state
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingCanvas, setEditingCanvas] = useState(null);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatePage, setTemplatePage] = useState(1);

  useEffect(() => {
    if (activeSection === 'syllabi') {
      fetchSyllabi();
    } else if (activeSection === 'templates') {
      fetchTemplates();
    }
  }, [activeSection, syllabusPage, filterStatus, filterSemester, templatePage]);

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

  const handleDeleteSyllabus = (id) => {
    setSyllabi(syllabi.filter(syllabus => syllabus._id !== id));
  };

  const handleCancelEditSyllabus = () => {
    setEditingSyllabus(null);
  };

  // Template handlers
  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const params = { page: templatePage, limit: 12 };
      const response = await templateAPI.getTemplates(params);
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleTemplateCreated = (newTemplate) => {
    setTemplates([newTemplate, ...templates]);
    setEditingTemplate(null);
  };

  const handleTemplateUpdated = (updatedTemplate) => {
    setTemplates(templates.map(template => 
      template._id === updatedTemplate._id ? updatedTemplate : template
    ));
    setEditingTemplate(null);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTemplate = (id) => {
    setTemplates(templates.filter(template => template._id !== id));
  };

  const handleCancelEditTemplate = () => {
    setEditingTemplate(null);
  };

  const handleEditCanvas = (template) => {
    setEditingCanvas(template);
  };

  const handleCanvasSave = async (updatedTemplate) => {
    try {
      const response = await templateAPI.updateTemplate(updatedTemplate._id, updatedTemplate);
      setTemplates(templates.map(template => 
        template._id === updatedTemplate._id ? response.data.template : template
      ));
      setEditingCanvas(null);
    } catch (error) {
      console.error('Error saving canvas:', error);
    }
  };

  const handleSetDefault = (id) => {
    setTemplates(templates.map(template => ({
      ...template,
      isDefault: template._id === id
    })));
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

        {/* Templates Section */}
        {activeSection === 'templates' && (
          <>
            {/* Template Form */}
            {(editingTemplate || !templates.length) && (
              <TemplateForm
                onTemplateCreated={handleTemplateCreated}
                editTemplate={editingTemplate}
                onTemplateUpdated={handleTemplateUpdated}
                onCancel={handleCancelEditTemplate}
              />
            )}

            {/* Create Button for Templates */}
            {!editingTemplate && templates.length > 0 && (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Create New Template
                </button>
              </div>
            )}

            {/* Template List */}
            <TemplateList
              templates={templates}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onEditCanvas={handleEditCanvas}
              onSetDefault={handleSetDefault}
              loading={templatesLoading}
            />

            {/* Template Pagination */}
            {templates.length > 0 && (
              <Pagination
                currentPage={templatePage}
                onPageChange={setTemplatePage}
                itemsCount={templates.length}
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
