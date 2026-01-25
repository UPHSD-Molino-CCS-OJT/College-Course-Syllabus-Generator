import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { settingsAPI } from '../services/api';

export default function SyllabusPrintView({ syllabus, onClose }) {
  const printRef = useRef();
  const [settings, setSettings] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings if fetch fails
      setSettings({
        institutionName: 'College Name',
        institutionLogo: '',
        headerText: '',
        footerText: '',
        primaryColor: '#1E40AF',
        secondaryColor: '#3B82F6',
        fontSize: 'medium',
        fontFamily: 'Arial, sans-serif',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${syllabus.courseCode}_${syllabus.courseTitle}_Syllabus.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportWord = async () => {
    setExporting(true);
    try {
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              width: 11906, // A4 landscape width in twips
              height: 8419, // A4 landscape height in twips
            },
          },
          children: [
            // Header
            new Paragraph({
              text: settings?.institutionName || 'College Name',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            ...(settings?.headerText ? [new Paragraph({
              text: settings.headerText,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })] : []),

            // Course Title
            new Paragraph({
              children: [
                new TextRun({
                  text: `${syllabus.courseCode}: ${syllabus.courseTitle}`,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: `${syllabus.department} • ${syllabus.credits} Credits`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: `${syllabus.semester} ${syllabus.year}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Instructor Information
            new Paragraph({
              text: 'Instructor Information',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              text: `Name: ${syllabus.instructorName}`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Email: ${syllabus.instructorEmail}`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Office Hours: ${syllabus.officeHours}`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Office Location: ${syllabus.officeLocation}`,
              spacing: { after: 300 },
            }),

            // Course Description
            new Paragraph({
              text: 'Course Description',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              text: syllabus.description,
              spacing: { after: 300 },
            }),

            // Prerequisites
            ...(syllabus.prerequisites ? [
              new Paragraph({
                text: 'Prerequisites',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                text: syllabus.prerequisites,
                spacing: { after: 300 },
              }),
            ] : []),

            // Learning Outcomes
            ...(syllabus.learningOutcomes && syllabus.learningOutcomes.length > 0 ? [
              new Paragraph({
                text: 'Learning Outcomes',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              }),
              ...syllabus.learningOutcomes.map(outcome => 
                new Paragraph({
                  text: `• ${outcome.outcome}`,
                  spacing: { after: 100 },
                })
              ),
              new Paragraph({ text: '', spacing: { after: 300 } }),
            ] : []),

            // Textbooks
            ...(syllabus.textbooks ? [
              new Paragraph({
                text: 'Required Textbooks',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                text: syllabus.textbooks,
                spacing: { after: 300 },
              }),
            ] : []),

            // Grading Components
            ...(syllabus.gradingComponents && syllabus.gradingComponents.length > 0 ? [
              new Paragraph({
                text: 'Grading Components',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              }),
              ...syllabus.gradingComponents.map(component =>
                new Paragraph({
                  text: `${component.component}: ${component.percentage}% - ${component.description}`,
                  spacing: { after: 100 },
                })
              ),
              new Paragraph({ text: '', spacing: { after: 300 } }),
            ] : []),

            // Grading Scale
            ...(syllabus.gradingScale ? [
              new Paragraph({
                text: 'Grading Scale',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                text: syllabus.gradingScale,
                spacing: { after: 300 },
              }),
            ] : []),

            // Policies
            new Paragraph({
              text: 'Course Policies',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 200 },
            }),
            ...(syllabus.attendancePolicy ? [
              new Paragraph({
                text: 'Attendance Policy',
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 100, after: 100 },
              }),
              new Paragraph({
                text: syllabus.attendancePolicy,
                spacing: { after: 200 },
              }),
            ] : []),
            ...(syllabus.lateSubmissionPolicy ? [
              new Paragraph({
                text: 'Late Submission Policy',
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 100, after: 100 },
              }),
              new Paragraph({
                text: syllabus.lateSubmissionPolicy,
                spacing: { after: 200 },
              }),
            ] : []),
            ...(syllabus.academicIntegrity ? [
              new Paragraph({
                text: 'Academic Integrity',
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 100, after: 100 },
              }),
              new Paragraph({
                text: syllabus.academicIntegrity,
                spacing: { after: 200 },
              }),
            ] : []),

            // Footer
            ...(settings?.footerText ? [
              new Paragraph({
                text: '',
                spacing: { before: 400 },
              }),
              new Paragraph({
                text: settings.footerText,
                alignment: AlignmentType.CENTER,
                italics: true,
              }),
            ] : []),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${syllabus.courseCode}_${syllabus.courseTitle}_Syllabus.docx`);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!syllabus || !settings) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const fontSize = settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px';

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-syllabus, #printable-syllabus * {
            visibility: visible;
          }
          #printable-syllabus {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: landscape;
            margin: 1cm;
          }
        }
      `}</style>

      {/* Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Print/Export Syllabus</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={exporting}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {exporting ? 'Exporting...' : '📄 Export PDF'}
              </button>
              <button
                onClick={handleExportWord}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {exporting ? 'Exporting...' : '📝 Export Word'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Printable Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            <div
              id="printable-syllabus"
              ref={printRef}
              className="bg-white mx-auto shadow-lg"
              style={{
                width: '297mm', // A4 landscape width
                minHeight: '210mm', // A4 landscape height
                padding: '20mm',
                fontFamily: settings.fontFamily,
                fontSize: fontSize,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b-4" style={{ borderColor: settings.primaryColor }}>
                {settings.institutionLogo && (
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={settings.institutionLogo}
                      alt="Institution Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 text-center">
                  <h1 className="text-3xl font-bold mb-1" style={{ color: settings.primaryColor }}>
                    {settings.institutionName}
                  </h1>
                  {settings.headerText && (
                    <p className="text-sm text-gray-600">{settings.headerText}</p>
                  )}
                </div>
                {settings.institutionLogo && <div className="w-24" />} {/* Spacer for balance */}
              </div>

              {/* Course Information */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {syllabus.courseCode}: {syllabus.courseTitle}
                </h2>
                <p className="text-lg text-gray-700">
                  {syllabus.department} • {syllabus.credits} Credits
                </p>
                <p className="text-md text-gray-600 mt-1">
                  {syllabus.semester} {syllabus.year}
                </p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Instructor Information */}
                  <section>
                    <h3 className="text-lg font-bold mb-2 pb-1 border-b-2" style={{ color: settings.secondaryColor, borderColor: settings.secondaryColor }}>
                      Instructor Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Name:</span> {syllabus.instructorName}</p>
                      <p><span className="font-semibold">Email:</span> {syllabus.instructorEmail}</p>
                      <p><span className="font-semibold">Office Hours:</span> {syllabus.officeHours}</p>
                      <p><span className="font-semibold">Office:</span> {syllabus.officeLocation}</p>
                    </div>
                  </section>

                  {/* Course Description */}
                  <section>
                    <h3 className="text-lg font-bold mb-2 pb-1 border-b-2" style={{ color: settings.secondaryColor, borderColor: settings.secondaryColor }}>
                      Course Description
                    </h3>
                    <p className="text-sm text-gray-700">{syllabus.description}</p>
                  </section>

                  {/* Prerequisites */}
                  {syllabus.prerequisites && (
                    <section>
                      <h3 className="text-lg font-bold mb-2 pb-1 border-b-2" style={{ color: settings.secondaryColor, borderColor: settings.secondaryColor }}>
                        Prerequisites
                      </h3>
                      <p className="text-sm text-gray-700">{syllabus.prerequisites}</p>
                    </section>
                  )}

                  {/* Learning Outcomes */}
                  {syllabus.learningOutcomes && syllabus.learningOutcomes.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold mb-2 pb-1 border-b-2" style={{ color: settings.secondaryColor, borderColor: settings.secondaryColor }}>
                        Learning Outcomes
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {syllabus.learningOutcomes.map((outcome, index) => (
                          <li key={index}>{outcome.outcome}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Textbooks */}
                  {syllabus.textbooks && (
                    <section>
                      <h3 className="text-lg font-bold mb-2 pb-1 border-b-2" style={{ color: settings.secondaryColor, borderColor: settings.secondaryColor }}>
                        Required Textbooks
                      </h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{syllabus.textbooks}</p>
                    </section>
                  )}

                  {/* Grading Components */}
                  {syllabus.gradingComponents && syllabus.gradingComponents.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold mb-2 pb-1 border-b-2" style={{ color: settings.secondaryColor, borderColor: settings.secondaryColor }}>
                        Grading Components
                      </h3>
                      <div className="text-sm space-y-1">
                        {syllabus.gradingComponents.map((component, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{component.component}:</span>
                            <span className="font-semibold">{component.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Grading Scale */}
                  {syllabus.gradingScale && (
                    <section>
                      <h3 className="text-lg font-bold mb-2 pb-1 border-b-2" style={{ color: settings.secondaryColor, borderColor: settings.secondaryColor }}>
                        Grading Scale
                      </h3>
                      <p className="text-sm text-gray-700">{syllabus.gradingScale}</p>
                    </section>
                  )}

                  {/* Policies */}
                  <section>
                    <h3 className="text-lg font-bold mb-2 pb-1 border-b-2" style={{ color: settings.secondaryColor, borderColor: settings.secondaryColor }}>
                      Policies
                    </h3>
                    <div className="space-y-2 text-sm">
                      {syllabus.attendancePolicy && (
                        <div>
                          <p className="font-semibold">Attendance:</p>
                          <p className="text-gray-700">{syllabus.attendancePolicy}</p>
                        </div>
                      )}
                      {syllabus.lateSubmissionPolicy && (
                        <div>
                          <p className="font-semibold">Late Submissions:</p>
                          <p className="text-gray-700">{syllabus.lateSubmissionPolicy}</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer */}
              {settings.footerText && (
                <div className="mt-6 pt-4 border-t-2 text-center text-sm text-gray-600" style={{ borderColor: settings.primaryColor }}>
                  {settings.footerText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
