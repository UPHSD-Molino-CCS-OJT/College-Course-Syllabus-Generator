const Syllabus = require("./model");

exports.getSyllabi = async (query) => {
  const { page = 1, limit = 10, status, semester, year, department } = query;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (semester) filter.semester = semester;
  if (year) filter.year = parseInt(year);
  if (department) filter.department = new RegExp(department, 'i');

  return Syllabus.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ academicYear: -1, semester: 1, courseCode: 1 })
    .populate('createdBy', 'name email')
    .populate('template')
    .exec();
};

exports.getSyllabusById = async (id) => {
  return Syllabus.findById(id)
    .populate('createdBy', 'name email')
    .populate('template')
    .exec();
};

exports.createSyllabus = (syllabusData) => {
  return Syllabus.create(syllabusData);
};

exports.updateSyllabus = async (id, syllabusData) => {
  return Syllabus.findByIdAndUpdate(
    id,
    syllabusData,
    {
      new: true,
      runValidators: true,
    }
  );
};

exports.deleteSyllabus = async (id) => {
  return Syllabus.findByIdAndDelete(id);
};

exports.getSyllabusBySemester = async (semester, academicYear) => {
  return Syllabus.findBySemester(semester, academicYear);
};

exports.countSyllabi = async (filter = {}) => {
  return Syllabus.countDocuments(filter);
};
