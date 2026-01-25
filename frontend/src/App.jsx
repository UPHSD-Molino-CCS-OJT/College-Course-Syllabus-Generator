import { useState, useEffect } from 'react';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import SyllabusForm from './components/SyllabusForm';
import SyllabusList from './components/SyllabusList';
import SyllabusView from './components/SyllabusView';
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

  const handleDeleteSyllabus = (id) => {
    setSyllabi(syllabi.filter(syllabus => syllabus._id !== id));
  };

  const handleCancelEditSyllabus = () => {
    setEditingSyllabus(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            College Course Syllabus Generator
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage syllabi and users
          </p>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveSection('syllabi')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'syllabi'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Syllabi
            </button>
            <button
              onClick={() => setActiveSection('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
          </nav>
        </div>
      </div>

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
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Filter:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setSyllabusPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={filterSemester}
                  onChange={(e) => {
                    setFilterSemester(e.target.value);
                    setSyllabusPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Semesters</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                </select>
                {!editingSyllabus && syllabi.length > 0 && (
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Create New Syllabus
                  </button>
                )}
                <button
                  onClick={fetchSyllabi}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Syllabus List */}
            <SyllabusList
              syllabi={syllabi}
              onEditSyllabus={handleEditSyllabus}
              onDeleteSyllabus={handleDeleteSyllabus}
              onViewSyllabus={handleViewSyllabus}
              loading={syllabiLoading}
            />

            {/* Syllabus Pagination */}
            {syllabi.length > 0 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setSyllabusPage(p => Math.max(1, p - 1))}
                  disabled={syllabusPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {syllabusPage}
                </span>
                <button
                  onClick={() => setSyllabusPage(p => p + 1)}
                  disabled={syllabi.length < 12}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* Syllabus View Modal */}
            {viewingSyllabus && (
              <SyllabusView
                syllabus={viewingSyllabus}
                onClose={() => setViewingSyllabus(null)}
                onEdit={handleEditSyllabus}
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
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Gender:
                </label>
                <select
                  value={filterGender}
                  onChange={(e) => {
                    setFilterGender(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  onClick={fetchUsers}
                  className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* User List */}
            <UserList
              users={users}
              onEditUser={handleEditUser}
              loading={usersLoading}
            />

            {/* User Pagination */}
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setUserPage(p => Math.max(1, p - 1))}
                disabled={userPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {userPage}
              </span>
              <button
                onClick={() => setUserPage(p => p + 1)}
                disabled={users.length < 10}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            College Course Syllabus Generator © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
