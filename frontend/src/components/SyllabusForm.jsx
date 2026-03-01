import { useState, useEffect, useCallback } from 'react';
import { syllabusAPI, templateAPI, cloAPI, ploAPI, peoAPI, graduateAttributeAPI, missionKeywordAPI, lloAPI } from '../services/api';
import { useAutoSave, AutoSaveIndicator } from '../utils/useAutoSave.jsx';

const INITIAL_FORM_DATA = {
  courseCode: '',
  courseTitle: '',
  department: '',
  credits: 3,
  semester: 'First Semester',
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  instructorName: '',
  instructorEmail: '',
  officeHours: '',
  officeLocation: '',
  description: '',
  prerequisites: '',
  learningOutcomes: [{ outcome: '' }],
  textbooks: '',
  additionalMaterials: '',
  gradingComponents: [{ component: '', percentage: 0, description: '' }],
  gradingScale: 'A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: Below 60',
  weeklySchedule: [],
  attendancePolicy: '',
  lateSubmissionPolicy: '',
  academicIntegrity: '',
  disabilities: '',
  dateRevised: '',
  dateOfEffectivity: '',
  reviewed: '',
  recommendingApproval: '',
  approved: '',
  status: 'draft',
  template: null,
  courseLearningOutcomes: [],
};

export default function SyllabusForm({ onSyllabusCreated, editSyllabus, onSyllabusUpdated, onCancel }) {
  const [formData, setFormData] = useState(() => {
    if (editSyllabus) {
      return {
        ...editSyllabus,
        // Normalise CLO refs — store only the IDs regardless of population state
        courseLearningOutcomes: (editSyllabus.courseLearningOutcomes || []).map(
          (c) => (typeof c === 'object' ? c._id : c)
        ),
      };
    }
    return INITIAL_FORM_DATA;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [templates, setTemplates] = useState([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(!!editSyllabus);
  const [availableCLOs, setAvailableCLOs] = useState([]);
  const [cloLoading, setCloLoading] = useState(false);
  const [cloForm, setCloForm] = useState(null);
  const [cloSubmitting, setCloSubmitting] = useState(false);

  // Graduate Attributes management
  const [gaList, setGaList] = useState([]);
  const [mkList, setMkList] = useState([]);
  const [gaListLoading, setGaListLoading] = useState(false);
  const [gaForm, setGaForm] = useState(null);
  const [gaSubmitting, setGaSubmitting] = useState(false);
  const [mkForm, setMkForm] = useState(null);
  const [mkSubmitting, setMkSubmitting] = useState(false);
  const [mkListLoading, setMkListLoading] = useState(false);

  // PEOs management
  const [peoList, setPeoList] = useState([]);
  const [peoListLoading, setPeoListLoading] = useState(false);
  const [peoForm, setPeoForm] = useState(null);
  const [peoSubmitting, setPeoSubmitting] = useState(false);

  // PLOs management
  const [ploList, setPloList] = useState([]);
  const [ploListLoading, setPloListLoading] = useState(false);
  const [ploForm, setPloForm] = useState(null);
  const [ploSubmitting, setPloSubmitting] = useState(false);

  // LLOs management
  const [lloList, setLloList] = useState([]);
  const [lloListLoading, setLloListLoading] = useState(false);
  const [lloForm, setLloForm] = useState(null);
  const [lloSubmitting, setLloSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchCLOs();
    fetchMKList();
    fetchGAList();
    fetchPEOList();
    fetchPLOList();
    fetchLLOList();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templateAPI.getTemplates();
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchCLOs = async () => {
    setCloLoading(true);
    try {
      const [cloRes, ploRes] = await Promise.all([
        cloAPI.getAll({ limit: 100 }),
        ploAPI.getAll({ limit: 100 }),
      ]);
      const plos = ploRes.data?.plos || [];
      const clos = (cloRes.data?.clos || []).map((clo) => ({
        ...clo,
        // Attach full PLO objects for display
        _plos: (clo.programLearningOutcomes || []).map((ref) => {
          const id = typeof ref === 'object' ? ref._id : ref;
          return plos.find((p) => String(p._id) === String(id)) || ref;
        }),
      }));
      setAvailableCLOs(clos);
    } catch (err) {
      console.error('Error fetching CLOs:', err);
    } finally {
      setCloLoading(false);
    }
  };

  const fetchMKList = async () => {
    setMkListLoading(true);
    try {
      const res = await missionKeywordAPI.getAll({ limit: 100 });
      setMkList(res.data?.missionKeywords || []);
    } catch (err) {
      console.error('Error fetching mission keywords:', err);
    } finally {
      setMkListLoading(false);
    }
  };

  const fetchGAList = async () => {
    setGaListLoading(true);
    try {
      const res = await graduateAttributeAPI.getAll({ limit: 100 });
      setGaList(res.data?.graduateAttributes || []);
    } catch (err) {
      console.error('Error fetching graduate attributes:', err);
    } finally {
      setGaListLoading(false);
    }
  };

  const fetchPEOList = async () => {
    setPeoListLoading(true);
    try {
      const res = await peoAPI.getAll({ limit: 100 });
      setPeoList(res.data?.peos || []);
    } catch (err) {
      console.error('Error fetching PEOs:', err);
    } finally {
      setPeoListLoading(false);
    }
  };

  const fetchPLOList = async () => {
    setPloListLoading(true);
    try {
      const res = await ploAPI.getAll({ limit: 100 });
      setPloList(res.data?.plos || []);
    } catch (err) {
      console.error('Error fetching PLOs:', err);
    } finally {
      setPloListLoading(false);
    }
  };

  const fetchLLOList = async () => {
    setLloListLoading(true);
    try {
      const res = await lloAPI.getAll({ limit: 500 });
      setLloList(res.data?.llos || []);
    } catch (err) {
      console.error('Error fetching LLOs:', err);
    } finally {
      setLloListLoading(false);
    }
  };

  // --- Mission Keywords CRUD ---
  const MK_BLANK = { code: '', label: '', isActive: true };
  const saveMK = async () => {
    setMkSubmitting(true);
    try {
      if (mkForm._id) {
        await missionKeywordAPI.update(mkForm._id, { code: mkForm.code, label: mkForm.label, isActive: mkForm.isActive });
      } else {
        await missionKeywordAPI.create({ code: mkForm.code, label: mkForm.label, isActive: mkForm.isActive });
      }
      setMkForm(null);
      await fetchMKList();
    } catch (err) {
      console.error('Error saving MK:', err);
    } finally {
      setMkSubmitting(false);
    }
  };
  const deleteMK = async (id) => {
    if (!window.confirm('Delete this Mission Keyword?')) return;
    try { await missionKeywordAPI.delete(id); await fetchMKList(); }
    catch (err) { console.error('Error deleting MK:', err); }
  };
  const editMK = (mk) => setMkForm({ _id: mk._id, code: mk.code, label: mk.label, isActive: mk.isActive !== false });

  // --- CLOs CRUD ---
  const CLO_BLANK = { number: '', title: '', description: '', programLearningOutcomes: [] };
  const saveCLO = async () => {
    setCloSubmitting(true);
    try {
      if (cloForm._id) {
        await cloAPI.update(cloForm._id, {
          number: cloForm.number, title: cloForm.title,
          description: cloForm.description, programLearningOutcomes: cloForm.programLearningOutcomes,
        });
      } else {
        await cloAPI.create(cloForm);
      }
      setCloForm(null);
      await fetchCLOs();
    } catch (err) {
      console.error('Error saving CLO:', err);
    } finally {
      setCloSubmitting(false);
    }
  };
  const deleteCLO = async (id) => {
    if (!window.confirm('Delete this Course Learning Outcome?')) return;
    try { await cloAPI.delete(id); await fetchCLOs(); }
    catch (err) { console.error('Error deleting CLO:', err); }
  };
  const editCLO = (clo) => setCloForm({
    _id: clo._id, number: clo.number, title: clo.title, description: clo.description || '',
    programLearningOutcomes: (clo.programLearningOutcomes || []).map((p) => typeof p === 'object' ? String(p._id) : String(p)),
  });
  const toggleCLOPLO = (ploId) => {
    const id = String(ploId);
    const already = cloForm.programLearningOutcomes.includes(id);
    setCloForm({ ...cloForm, programLearningOutcomes: already ? cloForm.programLearningOutcomes.filter((p) => p !== id) : [...cloForm.programLearningOutcomes, id] });
  };

  // --- Graduate Attributes CRUD ---
  const GA_BLANK = { number: '', category: 'CHARACTER', title: '', description: '', missionKeywords: [] };
  const saveGA = async () => {
    setGaSubmitting(true);
    try {
      if (gaForm._id) {
        await graduateAttributeAPI.update(gaForm._id, {
          number: gaForm.number, category: gaForm.category,
          title: gaForm.title, description: gaForm.description,
          missionKeywords: gaForm.missionKeywords,
        });
      } else {
        await graduateAttributeAPI.create(gaForm);
      }
      setGaForm(null);
      await fetchGAList();
    } catch (err) {
      console.error('Error saving GA:', err);
    } finally {
      setGaSubmitting(false);
    }
  };
  const deleteGA = async (id) => {
    if (!window.confirm('Delete this Graduate Attribute?')) return;
    try { await graduateAttributeAPI.delete(id); await fetchGAList(); }
    catch (err) { console.error('Error deleting GA:', err); }
  };
  const editGA = (ga) => setGaForm({
    _id: ga._id, number: ga.number, category: ga.category,
    title: ga.title, description: ga.description || '',
    missionKeywords: (ga.missionKeywords || []).map((m) => typeof m === 'object' ? String(m._id) : String(m)),
  });
  const toggleGAMK = (mkId) => {
    const id = String(mkId);
    const already = gaForm.missionKeywords.includes(id);
    setGaForm({ ...gaForm, missionKeywords: already ? gaForm.missionKeywords.filter((m) => m !== id) : [...gaForm.missionKeywords, id] });
  };

  // --- PEOs CRUD ---
  const PEO_BLANK = { number: '', title: '', description: '', graduateAttributes: [] };
  const savePEO = async () => {
    setPeoSubmitting(true);
    try {
      if (peoForm._id) {
        await peoAPI.update(peoForm._id, {
          number: peoForm.number, title: peoForm.title,
          description: peoForm.description, graduateAttributes: peoForm.graduateAttributes,
        });
      } else {
        await peoAPI.create(peoForm);
      }
      setPeoForm(null);
      await fetchPEOList();
    } catch (err) {
      console.error('Error saving PEO:', err);
    } finally {
      setPeoSubmitting(false);
    }
  };
  const deletePEO = async (id) => {
    if (!window.confirm('Delete this Program Educational Objective?')) return;
    try { await peoAPI.delete(id); await fetchPEOList(); }
    catch (err) { console.error('Error deleting PEO:', err); }
  };
  const editPEO = (peo) => setPeoForm({
    _id: peo._id, number: peo.number, title: peo.title,
    description: peo.description || '',
    graduateAttributes: (peo.graduateAttributes || []).map((g) => typeof g === 'object' ? String(g._id) : String(g)),
  });
  const togglePEOGA = (gaId) => {
    const id = String(gaId);
    const already = peoForm.graduateAttributes.includes(id);
    setPeoForm({ ...peoForm, graduateAttributes: already ? peoForm.graduateAttributes.filter((g) => g !== id) : [...peoForm.graduateAttributes, id] });
  };

  // --- PLOs CRUD ---
  const PLO_BLANK = { number: '', title: '', description: '', programEducationalObjectives: [] };
  const savePLO = async () => {
    setPloSubmitting(true);
    try {
      if (ploForm._id) {
        await ploAPI.update(ploForm._id, {
          number: ploForm.number, title: ploForm.title,
          description: ploForm.description, programEducationalObjectives: ploForm.programEducationalObjectives,
        });
      } else {
        await ploAPI.create(ploForm);
      }
      setPloForm(null);
      await fetchPLOList();
      // Also refresh the PLO list used in the CLO picker
      await fetchCLOs();
    } catch (err) {
      console.error('Error saving PLO:', err);
    } finally {
      setPloSubmitting(false);
    }
  };
  const deletePLO = async (id) => {
    if (!window.confirm('Delete this Program Learning Outcome?')) return;
    try { await ploAPI.delete(id); await fetchPLOList(); await fetchCLOs(); }
    catch (err) { console.error('Error deleting PLO:', err); }
  };
  const editPLO = (plo) => setPloForm({
    _id: plo._id, number: plo.number, title: plo.title,
    description: plo.description || '',
    programEducationalObjectives: (plo.programEducationalObjectives || []).map((p) => typeof p === 'object' ? String(p._id) : String(p)),
  });
  const togglePLOPEO = (peoId) => {
    const id = String(peoId);
    const already = ploForm.programEducationalObjectives.includes(id);
    setPloForm({ ...ploForm, programEducationalObjectives: already ? ploForm.programEducationalObjectives.filter((p) => p !== id) : [...ploForm.programEducationalObjectives, id] });
  };

  // --- LLOs CRUD ---
  const LLO_BLANK = { text: '', domain: 'K', period: 'PRELIM', weekLabel: '', periodOrder: 0, weekOrder: 0, order: 1, courseLearningOutcomes: [] };
  const saveLLO = async () => {
    setLloSubmitting(true);
    try {
      const payload = {
        text: lloForm.text,
        domain: lloForm.domain,
        period: lloForm.period,
        weekLabel: lloForm.weekLabel,
        periodOrder: Number(lloForm.periodOrder),
        weekOrder: Number(lloForm.weekOrder),
        order: Number(lloForm.order),
        courseLearningOutcomes: lloForm.courseLearningOutcomes,
      };
      if (lloForm._id) {
        await lloAPI.update(lloForm._id, payload);
      } else {
        await lloAPI.create(payload);
      }
      setLloForm(null);
      await fetchLLOList();
    } catch (err) {
      console.error('Error saving LLO:', err);
    } finally {
      setLloSubmitting(false);
    }
  };
  const deleteLLO = async (id) => {
    if (!window.confirm('Delete this Lesson Learning Outcome?')) return;
    try { await lloAPI.delete(id); await fetchLLOList(); }
    catch (err) { console.error('Error deleting LLO:', err); }
  };
  const editLLO = (llo) => setLloForm({
    _id: llo._id,
    text: llo.text || '',
    domain: llo.domain || 'K',
    period: llo.period || 'PRELIM',
    weekLabel: llo.weekLabel || '',
    periodOrder: llo.periodOrder ?? 0,
    weekOrder: llo.weekOrder ?? 0,
    order: llo.order ?? 1,
    courseLearningOutcomes: (llo.courseLearningOutcomes || []).map((c) => typeof c === 'object' ? String(c._id) : String(c)),
  });
  const toggleLLOCLO = (cloId) => {
    const id = String(cloId);
    const already = lloForm.courseLearningOutcomes.includes(id);
    setLloForm({ ...lloForm, courseLearningOutcomes: already ? lloForm.courseLearningOutcomes.filter((c) => c !== id) : [...lloForm.courseLearningOutcomes, id] });
  };

  // Auto-save function
  const autoSaveFunction = useCallback(async (data) => {
    if (editSyllabus && editSyllabus._id) {
      await syllabusAPI.updateSyllabus(editSyllabus._id, data);
      if (onSyllabusUpdated) {
        const response = await syllabusAPI.updateSyllabus(editSyllabus._id, data);
        onSyllabusUpdated(response.data.syllabus);
      }
    }
  }, [editSyllabus, onSyllabusUpdated]);

  // Set up auto-save (only for editing existing syllabi)
  const { saveStatus, lastSaved, error: autoSaveError, manualSave } = useAutoSave(
    autoSaveFunction,
    formData,
    {
      delay: 3000, // 3 seconds for syllabi (more data)
      enabled: autoSaveEnabled,
      shouldSave: (data) => {
        // Only auto-save if we have required fields
        return !!data.courseCode && !!data.courseTitle && !!editSyllabus?._id;
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editSyllabus) {
        const response = await syllabusAPI.updateSyllabus(editSyllabus._id, formData);
        onSyllabusUpdated(response.data.syllabus);
      } else {
        const response = await syllabusAPI.createSyllabus(formData);
        onSyllabusCreated(response.data.syllabus);
      }
      setFormData(INITIAL_FORM_DATA);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addLearningOutcome = () => {
    setFormData({
      ...formData,
      learningOutcomes: [...formData.learningOutcomes, { outcome: '' }],
    });
  };

  const updateLearningOutcome = (index, value) => {
    const updated = [...formData.learningOutcomes];
    updated[index].outcome = value;
    setFormData({ ...formData, learningOutcomes: updated });
  };

  const removeLearningOutcome = (index) => {
    const updated = formData.learningOutcomes.filter((_, i) => i !== index);
    setFormData({ ...formData, learningOutcomes: updated });
  };

  const addGradingComponent = () => {
    setFormData({
      ...formData,
      gradingComponents: [...formData.gradingComponents, { component: '', percentage: 0, description: '' }],
    });
  };

  const updateGradingComponent = (index, field, value) => {
    const updated = [...formData.gradingComponents];
    updated[index][field] = value;
    setFormData({ ...formData, gradingComponents: updated });
  };

  const removeGradingComponent = (index) => {
    const updated = formData.gradingComponents.filter((_, i) => i !== index);
    setFormData({ ...formData, gradingComponents: updated });
  };

  const addWeek = () => {
    setFormData({
      ...formData,
      weeklySchedule: [
        ...formData.weeklySchedule,
        { weekNumber: formData.weeklySchedule.length + 1, topic: '', activities: '', assignments: '' },
      ],
    });
  };

  const updateWeek = (index, field, value) => {
    const updated = [...formData.weeklySchedule];
    updated[index][field] = value;
    setFormData({ ...formData, weeklySchedule: updated });
  };

  const removeWeek = (index) => {
    const updated = formData.weeklySchedule.filter((_, i) => i !== index);
    setFormData({ ...formData, weeklySchedule: updated });
  };

  const toggleCLO = (cloId) => {
    const id = String(cloId);
    const already = formData.courseLearningOutcomes.map(String).includes(id);
    setFormData({
      ...formData,
      courseLearningOutcomes: already
        ? formData.courseLearningOutcomes.filter((c) => String(c) !== id)
        : [...formData.courseLearningOutcomes, id],
    });
  };

  const selectAllCLOs = () => {
    setFormData({ ...formData, courseLearningOutcomes: availableCLOs.map((c) => String(c._id)) });
  };

  const clearAllCLOs = () => {
    setFormData({ ...formData, courseLearningOutcomes: [] });
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'instructor', name: 'Instructor' },
    { id: 'course', name: 'Course Details' },
    { id: 'outcomes', name: 'Outcomes' },
    { id: 'grad-attrs', name: 'Graduate Attrs' },
    { id: 'peos', name: 'PEOs' },
    { id: 'plos', name: 'PLOs' },
    { id: 'llos', name: 'LLOs' },
    { id: 'grading', name: 'Grading' },
    { id: 'schedule', name: 'Schedule' },
    { id: 'policies', name: 'Policies' },
    { id: 'approval', name: 'Approval' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {editSyllabus ? 'Edit Syllabus' : 'Create New Syllabus'}
          </h2>
          {editSyllabus && <AutoSaveIndicator saveStatus={saveStatus} lastSaved={lastSaved} error={autoSaveError} />}
        </div>
        <div className="flex items-center gap-3">
          {editSyllabus && (
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="mr-2"
              />
              Auto-save
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduction to Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Computer Science"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                  pattern="\d{4}-\d{4}"
                  placeholder="2025-2026"
                  title="Format: YYYY-YYYY (e.g., 2025-2026)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template (Optional)</label>
              <select
                name="template"
                value={formData.template || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Template</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name} - {template.pageSize} {template.orientation}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a template to apply formatting when printing the syllabus
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        )}

        {/* Instructor Tab */}
        {activeTab === 'instructor' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name *</label>
              <input
                type="text"
                name="instructorName"
                value={formData.instructorName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Email *</label>
              <input
                type="email"
                name="instructorEmail"
                value={formData.instructorEmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jane.smith@university.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Hours</label>
              <textarea
                name="officeHours"
                value={formData.officeHours}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Monday 2-4 PM, Wednesday 3-5 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
              <input
                type="text"
                name="officeLocation"
                value={formData.officeLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Building A, Room 301"
              />
            </div>
          </div>
        )}

        {/* Course Details Tab */}
        {activeTab === 'course' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="An introduction to..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CS100 or equivalent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Learning Outcomes</label>
                <button
                  type="button"
                  onClick={addLearningOutcome}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Outcome
                </button>
              </div>
              {formData.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={outcome.outcome}
                    onChange={(e) => updateLearningOutcome(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Students will be able to..."
                  />
                  {formData.learningOutcomes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLearningOutcome(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Textbooks</label>
              <textarea
                name="textbooks"
                value={formData.textbooks}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Required textbooks and materials..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Materials</label>
              <textarea
                name="additionalMaterials"
                value={formData.additionalMaterials}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional readings, resources..."
              />
            </div>
          </div>
        )}

        {/* Outcomes Tab */}
        {activeTab === 'outcomes' && (
          <div className="space-y-6">

            {/* ── CLO Management section ── */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex-1">
                  <h3 className="text-sm font-semibold text-teal-800 mb-1">Manage Course Learning Outcomes (CLOs)</h3>
                  <p className="text-xs text-teal-600">
                    Create, edit, and delete CLOs and map each one to Program Learning Outcomes (PLOs).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCloForm({ ...CLO_BLANK })}
                  className="shrink-0 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                >
                  + Add CLO
                </button>
              </div>

              {cloForm && (
                <div className="border-2 border-teal-400 rounded-lg p-5 bg-teal-50 space-y-3">
                  <h4 className="font-semibold text-teal-800 text-sm">
                    {cloForm._id ? 'Edit Course Learning Outcome' : 'New Course Learning Outcome'}
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Number</label>
                    <input
                      type="number"
                      value={cloForm.number}
                      onChange={(e) => setCloForm({ ...cloForm, number: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={cloForm.title}
                      onChange={(e) => setCloForm({ ...cloForm, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. Apply fundamental programming concepts"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={cloForm.description}
                      onChange={(e) => setCloForm({ ...cloForm, description: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Brief description…"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Map to Program Learning Outcomes (PLOs)
                      {ploList.length === 0 && <span className="text-gray-400 font-normal"> — add PLOs in the PLOs tab first</span>}
                    </label>
                    {ploList.length > 0 && (
                      <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                        {ploList.map((plo) => {
                          const id = String(plo._id);
                          const checked = cloForm.programLearningOutcomes.includes(id);
                          return (
                            <label key={id} className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCLOPLO(id)}
                                className="h-3 w-3 rounded text-teal-600"
                              />
                              <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-bold ${checked ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>PLO {plo.number}</span>
                              <span className={checked ? 'font-semibold text-teal-700' : 'text-gray-600'}>{plo.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveCLO}
                      disabled={cloSubmitting || !cloForm.title}
                      className="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                      {cloSubmitting ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCloForm(null)}
                      className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {cloLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading outcomes…
                </div>
              ) : availableCLOs.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                  <p className="font-medium text-sm">No CLOs defined yet.</p>
                  <p className="text-xs mt-1">Click &quot;+ Add CLO&quot; above to create the first one.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {availableCLOs.map((clo) => {
                    const cloId = String(clo._id);
                    return (
                      <div key={cloId} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
                        <span className="shrink-0 text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded mt-0.5">CLO {clo.number}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800">{clo.title}</p>
                          {clo.description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{clo.description}</p>}
                          {clo._plos && clo._plos.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {clo._plos.map((plo, pi) => (
                                <span key={pi} className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200" title={typeof plo === 'object' ? plo.title : ''}>
                                  PLO {typeof plo === 'object' ? plo.number : '?'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => editCLO(clo)}
                            className="px-3 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCLO(clo._id)}
                            className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4" />

            {/* ── Select CLOs for this syllabus ── */}
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-1">Select CLOs for this Syllabus</h3>
                <p className="text-xs text-blue-600">
                  Check the CLOs that apply to this specific course. Selected CLOs will be linked to the syllabus record.
                </p>
              </div>

              {availableCLOs.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">Add CLOs using the section above, then select them here.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {formData.courseLearningOutcomes.length} / {availableCLOs.length} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllCLOs}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllCLOs}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {availableCLOs.map((clo) => {
                      const cloId = String(clo._id);
                      const isChecked = formData.courseLearningOutcomes.map(String).includes(cloId);
                      return (
                        <label
                          key={cloId}
                          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                            isChecked
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCLO(cloId)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                isChecked ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                CLO {clo.number}
                              </span>
                              <span className="font-semibold text-sm text-gray-800">{clo.title}</span>
                            </div>
                            {clo.description && (
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{clo.description}</p>
                            )}
                            {clo._plos && clo._plos.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {clo._plos.map((plo, pi) => (
                                  <span
                                    key={pi}
                                    className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200"
                                    title={typeof plo === 'object' ? plo.title : ''}
                                  >
                                    PLO {typeof plo === 'object' ? plo.number : '?'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Graduate Attributes Tab */}
        {activeTab === 'grad-attrs' && (
          <div className="space-y-6">

            {/* ── Mission Keywords section ── */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex-1">
                  <h3 className="text-sm font-semibold text-indigo-800 mb-1">Mission Keywords</h3>
                  <p className="text-xs text-indigo-600">
                    Define Mission Keywords (e.g. A–F codes) first — Graduate Attributes are then mapped to them.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setMkForm({ ...MK_BLANK }); setGaForm(null); }}
                  className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Add Mission Keyword
                </button>
              </div>

              {mkForm && (
                <div className="border-2 border-indigo-400 rounded-lg p-5 bg-indigo-50 space-y-3">
                  <h4 className="font-semibold text-indigo-800 text-sm">
                    {mkForm._id ? 'Edit Mission Keyword' : 'New Mission Keyword'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
                      <input
                        type="text"
                        value={mkForm.code}
                        onChange={(e) => setMkForm({ ...mkForm, code: e.target.value.toUpperCase() })}
                        maxLength={10}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                        placeholder="A"
                      />
                    </div>
                    <div className="flex items-end gap-4">
                      <label className="flex items-center gap-2 text-xs cursor-pointer mt-5">
                        <input
                          type="checkbox"
                          checked={mkForm.isActive}
                          onChange={(e) => setMkForm({ ...mkForm, isActive: e.target.checked })}
                          className="h-4 w-4 rounded text-indigo-600"
                        />
                        <span className="font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label *</label>
                    <input
                      type="text"
                      value={mkForm.label}
                      onChange={(e) => setMkForm({ ...mkForm, label: e.target.value })}
                      maxLength={300}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Integrity and Professionalism"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveMK}
                      disabled={mkSubmitting || !mkForm.code || !mkForm.label}
                      className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {mkSubmitting ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMkForm(null)}
                      className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {mkListLoading ? (
                <div className="flex items-center justify-center py-6 text-gray-400">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading…
                </div>
              ) : mkList.length === 0 ? (
                <div className="text-center py-6 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                  <p className="font-medium text-sm">No Mission Keywords yet.</p>
                  <p className="text-xs mt-1">Add one above to start mapping Graduate Attributes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {mkList.map((mk) => (
                    <div key={mk._id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
                      <span className="shrink-0 text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{mk.code}</span>
                      <span className="flex-1 text-xs text-gray-700 min-w-0 truncate" title={mk.label}>{mk.label}</span>
                      {!mk.isActive && <span className="text-xs text-gray-400 italic">inactive</span>}
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => { editMK(mk); setGaForm(null); }}
                          className="px-2 py-0.5 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMK(mk._id)}
                          className="px-2 py-0.5 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4" />

            {/* ── Graduate Attributes section ── */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex-1">
                  <h3 className="text-sm font-semibold text-green-800 mb-1">Graduate Attributes (GAs)</h3>
                  <p className="text-xs text-green-600">
                    Manage Graduate Attributes and map each one to the Mission Keywords above.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setGaForm({ ...GA_BLANK }); setMkForm(null); }}
                  className="shrink-0 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Add Graduate Attribute
                </button>
              </div>

              {gaForm && (
                <div className="border-2 border-green-400 rounded-lg p-5 bg-green-50 space-y-3">
                  <h4 className="font-semibold text-green-800 text-sm">
                    {gaForm._id ? 'Edit Graduate Attribute' : 'New Graduate Attribute'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Number</label>
                      <input
                        type="number"
                        value={gaForm.number}
                        onChange={(e) => setGaForm({ ...gaForm, number: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={gaForm.category}
                        onChange={(e) => setGaForm({ ...gaForm, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="CHARACTER">Character</option>
                        <option value="COMPETENCE">Competence</option>
                        <option value="COMMITMENT TO SERVICE">Commitment to Service</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={gaForm.title}
                      onChange={(e) => setGaForm({ ...gaForm, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Ethical Conduct"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={gaForm.description}
                      onChange={(e) => setGaForm({ ...gaForm, description: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Brief description…"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Map to Mission Keywords
                      {mkList.length === 0 && <span className="text-gray-400 font-normal"> (add Mission Keywords above first)</span>}
                    </label>
                    {mkList.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                        {mkList.map((mk) => {
                          const id = String(mk._id);
                          const checked = gaForm.missionKeywords.includes(id);
                          return (
                            <label key={id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleGAMK(id)}
                                className="h-3 w-3 rounded text-green-600"
                              />
                              <span className={`shrink-0 px-1.5 py-0.5 rounded font-bold text-xs ${checked ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>{mk.code}</span>
                              <span className={checked ? 'font-semibold text-green-700' : 'text-gray-600'} title={mk.label}>{mk.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveGA}
                      disabled={gaSubmitting || !gaForm.title}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {gaSubmitting ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGaForm(null)}
                      className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {gaListLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading…
                </div>
              ) : gaList.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-2">🎓</p>
                  <p className="font-medium">No Graduate Attributes yet.</p>
                  <p className="text-sm mt-1">Click &quot;Add Graduate Attribute&quot; to create the first one.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {gaList.map((ga) => {
                    const catColor = ga.category === 'CHARACTER'
                      ? 'bg-blue-100 text-blue-700'
                      : ga.category === 'COMPETENCE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700';
                    return (
                      <div key={ga._id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
                        <span className="shrink-0 text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded mt-0.5">GA {ga.number}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-gray-800">{ga.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{ga.category}</span>
                          </div>
                          {ga.description && <p className="text-xs text-gray-500 mt-0.5">{ga.description}</p>}
                          {(ga.missionKeywords || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {(ga.missionKeywords || []).map((m, i) => {
                                const mk = typeof m === 'object' ? m : mkList.find((k) => String(k._id) === String(m));
                                return (
                                  <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200" title={mk ? mk.label : ''}>
                                    {mk ? mk.code : '?'}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => { editGA(ga); setMkForm(null); }}
                            className="px-3 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGA(ga._id)}
                            className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PEOs Tab */}
        {activeTab === 'peos' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex-1">
                <h3 className="text-sm font-semibold text-purple-800 mb-1">Program Educational Objectives (PEOs)</h3>
                <p className="text-xs text-purple-600">
                  Manage PEOs and their relationships to Graduate Attributes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPeoForm({ ...PEO_BLANK })}
                className="shrink-0 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Add PEO
              </button>
            </div>

            {peoForm && (
              <div className="border-2 border-purple-400 rounded-lg p-5 bg-purple-50 space-y-3">
                <h4 className="font-semibold text-purple-800 text-sm">
                  {peoForm._id ? 'Edit Program Educational Objective' : 'New Program Educational Objective'}
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Number</label>
                  <input
                    type="number"
                    value={peoForm.number}
                    onChange={(e) => setPeoForm({ ...peoForm, number: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={peoForm.title}
                    onChange={(e) => setPeoForm({ ...peoForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Apply technical knowledge effectively"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={peoForm.description}
                    onChange={(e) => setPeoForm({ ...peoForm, description: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description…"
                  />
                </div>
                {gaList.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Linked Graduate Attributes</label>
                    <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                      {gaList.map((ga) => {
                        const id = String(ga._id);
                        const checked = peoForm.graduateAttributes.includes(id);
                        return (
                          <label key={id} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePEOGA(id)}
                              className="h-3 w-3 rounded text-purple-600"
                            />
                            <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-bold ${checked ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>GA {ga.number}</span>
                            <span className={checked ? 'font-semibold text-purple-700' : 'text-gray-600'}>{ga.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={savePEO}
                    disabled={peoSubmitting || !peoForm.title}
                    className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {peoSubmitting ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeoForm(null)}
                    className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {peoListLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading…
              </div>
            ) : peoList.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">🎯</p>
                <p className="font-medium">No Program Educational Objectives yet.</p>
                <p className="text-sm mt-1">Click &quot;Add PEO&quot; to create the first one.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {peoList.map((peo) => (
                  <div key={peo._id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
                    <span className="shrink-0 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-0.5">PEO {peo.number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">{peo.title}</p>
                      {peo.description && <p className="text-xs text-gray-500 mt-0.5">{peo.description}</p>}
                      {(peo.graduateAttributes || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(peo.graduateAttributes || []).map((g, i) => {
                            const ga = typeof g === 'object' ? g : gaList.find((a) => String(a._id) === String(g));
                            return (
                              <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">
                                GA {ga ? ga.number : '?'}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => editPEO(peo)}
                        className="px-3 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePEO(peo._id)}
                        className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLOs Tab */}
        {activeTab === 'plos' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex-1">
                <h3 className="text-sm font-semibold text-orange-800 mb-1">Program Learning Outcomes (PLOs)</h3>
                <p className="text-xs text-orange-600">
                  Manage PLOs and their relationships to Program Educational Objectives. Changes here also refresh the Outcomes tab.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPloForm({ ...PLO_BLANK })}
                className="shrink-0 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
              >
                + Add PLO
              </button>
            </div>

            {ploForm && (
              <div className="border-2 border-orange-400 rounded-lg p-5 bg-orange-50 space-y-3">
                <h4 className="font-semibold text-orange-800 text-sm">
                  {ploForm._id ? 'Edit Program Learning Outcome' : 'New Program Learning Outcome'}
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Number</label>
                  <input
                    type="number"
                    value={ploForm.number}
                    onChange={(e) => setPloForm({ ...ploForm, number: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={ploForm.title}
                    onChange={(e) => setPloForm({ ...ploForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Demonstrate problem-solving skills"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={ploForm.description}
                    onChange={(e) => setPloForm({ ...ploForm, description: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Brief description…"
                  />
                </div>
                {peoList.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Linked Program Educational Objectives</label>
                    <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                      {peoList.map((peo) => {
                        const id = String(peo._id);
                        const checked = ploForm.programEducationalObjectives.includes(id);
                        return (
                          <label key={id} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePLOPEO(id)}
                              className="h-3 w-3 rounded text-orange-600"
                            />
                            <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-bold ${checked ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>PEO {peo.number}</span>
                            <span className={checked ? 'font-semibold text-orange-700' : 'text-gray-600'}>{peo.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={savePLO}
                    disabled={ploSubmitting || !ploForm.title}
                    className="px-4 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {ploSubmitting ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPloForm(null)}
                    className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {ploListLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading…
              </div>
            ) : ploList.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">📋</p>
                <p className="font-medium">No Program Learning Outcomes yet.</p>
                <p className="text-sm mt-1">Click &quot;Add PLO&quot; to create the first one.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {ploList.map((plo) => (
                  <div key={plo._id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
                    <span className="shrink-0 text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded mt-0.5">PLO {plo.number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">{plo.title}</p>
                      {plo.description && <p className="text-xs text-gray-500 mt-0.5">{plo.description}</p>}
                      {(plo.programEducationalObjectives || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(plo.programEducationalObjectives || []).map((p, i) => {
                            const peo = typeof p === 'object' ? p : peoList.find((e) => String(e._id) === String(p));
                            return (
                              <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                                PEO {peo ? peo.number : '?'}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => editPLO(plo)}
                        className="px-3 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePLO(plo._id)}
                        className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LLOs Tab */}
        {activeTab === 'llos' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex-1">
                <h3 className="text-sm font-semibold text-amber-800 mb-1">Lesson Learning Outcomes (LLOs)</h3>
                <p className="text-xs text-amber-600">
                  Manage LLOs grouped by period and week. Map each LLO to the CLOs it supports. These populate the LLO–CLO matrix in the canvas editor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLloForm({ ...LLO_BLANK })}
                className="shrink-0 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
              >
                + Add LLO
              </button>
            </div>

            {lloForm && (
              <div className="border-2 border-amber-400 rounded-lg p-5 bg-amber-50 space-y-3">
                <h4 className="font-semibold text-amber-800 text-sm">
                  {lloForm._id ? 'Edit Lesson Learning Outcome' : 'New Lesson Learning Outcome'}
                </h4>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">LLO Text *</label>
                  <textarea
                    value={lloForm.text}
                    onChange={(e) => setLloForm({ ...lloForm, text: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Explain the fundamental concepts of algorithms…"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Domain</label>
                    <select
                      value={lloForm.domain}
                      onChange={(e) => setLloForm({ ...lloForm, domain: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="K">K – Knowledge</option>
                      <option value="S">S – Skills</option>
                      <option value="A">A – Affective</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Period</label>
                    <select
                      value={lloForm.period}
                      onChange={(e) => setLloForm({ ...lloForm, period: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="PRELIM">PRELIM</option>
                      <option value="MIDTERM">MIDTERM</option>
                      <option value="FINAL">FINAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Week Label</label>
                    <input
                      type="text"
                      value={lloForm.weekLabel}
                      onChange={(e) => setLloForm({ ...lloForm, weekLabel: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g. FIRST WEEK"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Period Order</label>
                    <input
                      type="number"
                      min="0"
                      value={lloForm.periodOrder}
                      onChange={(e) => setLloForm({ ...lloForm, periodOrder: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Week Order</label>
                    <input
                      type="number"
                      min="0"
                      value={lloForm.weekOrder}
                      onChange={(e) => setLloForm({ ...lloForm, weekOrder: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      min="1"
                      value={lloForm.order}
                      onChange={(e) => setLloForm({ ...lloForm, order: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Map to Course Learning Outcomes (CLOs)
                    {availableCLOs.length === 0 && <span className="text-gray-400 font-normal"> — add CLOs in the Outcomes tab first</span>}
                  </label>
                  {availableCLOs.length > 0 && (
                    <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                      {availableCLOs.map((clo) => {
                        const id = String(clo._id);
                        const checked = lloForm.courseLearningOutcomes.includes(id);
                        return (
                          <label key={id} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleLLOCLO(id)}
                              className="h-3 w-3 rounded text-amber-600"
                            />
                            <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-bold ${checked ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                              CLO {clo.number}
                            </span>
                            <span className={checked ? 'font-semibold text-amber-700' : 'text-gray-600'}>{clo.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={saveLLO}
                    disabled={lloSubmitting || !lloForm.text}
                    className="px-4 py-1.5 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {lloSubmitting ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLloForm(null)}
                    className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {lloListLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading…
              </div>
            ) : lloList.length === 0 ? (
              <div className="text-center py-10 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                <p className="text-4xl mb-2">📖</p>
                <p className="font-medium">No Lesson Learning Outcomes yet.</p>
                <p className="text-sm mt-1">Click &quot;Add LLO&quot; to create the first one.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {/* Group by period → week */}
                {['PRELIM', 'MIDTERM', 'FINAL'].map((period) => {
                  const periodLLOs = lloList.filter((l) => l.period === period);
                  if (periodLLOs.length === 0) return null;
                  // Collect unique weekLabels in weekOrder order
                  const weeks = [];
                  const seenWeeks = new Set();
                  [...periodLLOs].sort((a, b) => (a.weekOrder ?? 0) - (b.weekOrder ?? 0)).forEach((l) => {
                    const key = l.weekLabel || '(no week label)';
                    if (!seenWeeks.has(key)) { seenWeeks.add(key); weeks.push({ label: key, weekOrder: l.weekOrder ?? 0 }); }
                  });
                  const periodColor = period === 'PRELIM' ? 'bg-red-100 text-red-700 border-red-200' : period === 'MIDTERM' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-100 text-blue-700 border-blue-200';
                  return (
                    <div key={period} className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border-b ${periodColor}`}>{period} PERIOD</div>
                      <div className="divide-y divide-gray-100">
                        {weeks.map(({ label: weekLabel }) => {
                          const weekLLOs = periodLLOs
                            .filter((l) => (l.weekLabel || '(no week label)') === weekLabel)
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                          return (
                            <div key={weekLabel}>
                              <div className="px-4 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">{weekLabel}</div>
                              {weekLLOs.map((llo) => (
                                <div key={llo._id} className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded mt-0.5 ${llo.domain === 'K' ? 'bg-blue-100 text-blue-700' : llo.domain === 'S' ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>
                                    {llo.domain}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 leading-relaxed">{llo.text}</p>
                                    {(llo.courseLearningOutcomes || []).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {(llo.courseLearningOutcomes || []).map((c, ci) => {
                                          const clo = typeof c === 'object' ? c : availableCLOs.find((cl) => String(cl._id) === String(c));
                                          return (
                                            <span key={ci} className="text-xs px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 border border-teal-200">
                                              CLO {clo ? clo.number : '?'}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => editLLO(llo)}
                                      className="px-3 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteLLO(llo._id)}
                                      className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Grading Tab */}
        {activeTab === 'grading' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Grading Components</label>
                <button
                  type="button"
                  onClick={addGradingComponent}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Component
                </button>
              </div>
              {formData.gradingComponents.map((component, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-3 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      value={component.component}
                      onChange={(e) => updateGradingComponent(index, 'component', e.target.value)}
                      placeholder="Component name"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={component.percentage}
                      onChange={(e) => updateGradingComponent(index, 'percentage', parseFloat(e.target.value))}
                      placeholder="Percentage"
                      min="0"
                      max="100"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeGradingComponent(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 border border-gray-300 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={component.description}
                    onChange={(e) => updateGradingComponent(index, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grading Scale</label>
              <textarea
                name="gradingScale"
                value={formData.gradingScale}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A: 90-100, B: 80-89..."
              />
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Weekly Schedule</label>
              <button
                type="button"
                onClick={addWeek}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Week
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.weeklySchedule.map((week, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Week {week.weekNumber}</span>
                    <button
                      type="button"
                      onClick={() => removeWeek(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={week.topic}
                    onChange={(e) => updateWeek(index, 'topic', e.target.value)}
                    placeholder="Topic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <textarea
                    value={week.activities}
                    onChange={(e) => updateWeek(index, 'activities', e.target.value)}
                    placeholder="Activities"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <input
                    type="text"
                    value={week.assignments}
                    onChange={(e) => updateWeek(index, 'assignments', e.target.value)}
                    placeholder="Assignments"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Policy</label>
              <textarea
                name="attendancePolicy"
                value={formData.attendancePolicy}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Attendance requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Late Submission Policy</label>
              <textarea
                name="lateSubmissionPolicy"
                value={formData.lateSubmissionPolicy}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Policy for late assignments..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Integrity</label>
              <textarea
                name="academicIntegrity"
                value={formData.academicIntegrity}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Academic honesty policies..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disabilities Accommodation</label>
              <textarea
                name="disabilities"
                value={formData.disabilities}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Accommodation policies..."
              />
            </div>
          </div>
        )}

        {/* Approval Tab */}
        {activeTab === 'approval' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Revised (Month/Year)</label>
              <input
                type="month"
                name="dateRevised"
                value={formData.dateRevised || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Effectivity (Month/Year)</label>
              <input
                type="month"
                name="dateOfEffectivity"
                value={formData.dateOfEffectivity || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By</label>
              <input
                type="text"
                name="reviewed"
                value={formData.reviewed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name of reviewer..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recommending Approval</label>
              <input
                type="text"
                name="recommendingApproval"
                value={formData.recommendingApproval}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name of person recommending approval..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
              <input
                type="text"
                name="approved"
                value={formData.approved}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name of approver..."
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : editSyllabus ? 'Update Syllabus' : 'Create Syllabus'}
          </button>
          {editSyllabus && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
