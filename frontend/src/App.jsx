import { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Pagination from './components/Pagination';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import UserFilters from './components/UserFilters';
import SyllabusForm from './components/SyllabusForm';
import SyllabusList from './components/SyllabusList';
import SyllabusView from './components/SyllabusView';
import SyllabusFilters from './components/SyllabusFilters';
import SyllabusTemplateView from './components/SyllabusTemplateView';
import { userAPI, syllabusAPI } from './services/api';

function App() {
  const [activeSection, setActiveSection] = useState('syllabi');
  
  // User state
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [filterGender, setFilterGender] = useState('');

  // Syllabus state
  const [syllabi, setSyllabi] = useState([]);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [viewingSyllabus, setViewingSyllabus] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [syllabiLoading, setSyllabiLoading] = useState(false);
  const [syllabusPage, setSyllabusPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers();
    } else if (activeSection === 'syllabi') {
      fetchSyllabi();
    }
  }, [activeSection, userPage, filterGender, syllabusPage, filterStatus, filterSemester]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = { page: userPage, limit: 10 };
      if (filterGender) params.gender = filterGender;
      
      const response = await userAPI.getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

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

  // User handlers
  const handleUserCreated = (newUser) => {
    setUsers([newUser, ...users]);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(user => 
      user._id === updatedUser._id ? updatedUser : user
    ));
    setEditingUser(null);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditUser = () => {
    setEditingUser(null);
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            {/* Syllabus View Modal */}
            {viewingSyllabus && (
              <SyllabusView
                syllabus={viewingSyllabus}
                onClose={() => setViewingSyllabus(null)}
                onEdit={handleEditSyllabus}
              />            )}
            {/* Syllabus Template View Modal */}
            {viewingTemplate && (
              <SyllabusTemplateView
                syllabus={viewingTemplate}
                onClose={() => setViewingTemplate(null)}
              />
            )}
          </>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <>
            {/* User Form */}
            <UserForm
              onUserCreated={handleUserCreated}
              editUser={editingUser}
              onUserUpdated={handleUserUpdated}
              onCancel={handleCancelEditUser}
            />

            {/* Filters */}
            <UserFilters
              filterGender={filterGender}
              onGenderChange={(value) => {
                setFilterGender(value);
                setUserPage(1);
              }}
              onRefresh={fetchUsers}
            />

            {/* User List */}
            <UserList
              users={users}
              onEditUser={handleEditUser}
              loading={usersLoading}
            />

            {/* User Pagination */}
            <Pagination
              currentPage={userPage}
              onPageChange={setUserPage}
              itemsCount={users.length}
              itemsPerPage={10}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
