import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, Header, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { X, Printer, FileText, File } from 'lucide-react';
import { settingsAPI } from '../services/api';
import TemplateRenderer from './TemplateRenderer';

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
      
      // Determine page size based on template or default to legal landscape
      let orientation = 'landscape';
      let format = 'legal';
      
      if (syllabus.template && typeof syllabus.template === 'object') {
        orientation = syllabus.template.orientation || 'landscape';
        format = syllabus.template.pageSize === 'longBond' ? [355.6, 215.9] : 
                syllabus.template.pageSize === 'a4' ? 'a4' :
                syllabus.template.pageSize === 'letter' ? 'letter' : 'legal';
      }
      
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format,
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
      // TODO: Add template support for Word export
      // Currently Word export uses the default layout
      // Future enhancement: Parse template canvasDocument and generate equivalent Word structure
      
      // Prepare header elements
      const headerElements = [];

      // Use new flexible headerContent if available, otherwise fall back to legacy fields
      if (settings?.headerContent && settings.headerContent.length > 0) {
        // Sort by order and process each block
        const sortedBlocks = [...settings.headerContent].sort((a, b) => a.order - b.order);
        
        for (const block of sortedBlocks) {
          if (block.type === 'image' && block.content) {
            try {
              const base64Data = block.content.split(',')[1];
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }

              headerElements.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: bytes,
                      transformation: {
                        width: block.styles?.width || 100,
                        height: block.styles?.height || 100,
                      },
                    }),
                  ],
                  alignment: block.alignment === 'left' ? AlignmentType.LEFT : 
                            block.alignment === 'right' ? AlignmentType.RIGHT : 
                            AlignmentType.CENTER,
                  spacing: { after: 100 },
                })
              );
            } catch (error) {
              console.error('Error adding image to header:', error);
            }
          } else if (block.type === 'text' && block.content) {
            headerElements.push(
              new Paragraph({
                text: block.content,
                bold: block.styles?.fontWeight === 'bold',
                alignment: block.alignment === 'left' ? AlignmentType.LEFT : 
                          block.alignment === 'right' ? AlignmentType.RIGHT : 
                          AlignmentType.CENTER,
                spacing: { after: 50 },
              })
            );
          }
        }
      } else {
        // Legacy fallback - Add logo to header if available
        if (settings?.institutionLogo) {
          try {
            // Convert base64 to buffer
            const base64Data = settings.institutionLogo.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            headerElements.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: bytes,
                    transformation: {
                      width: 100,
                      height: 100,
                    },
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
              })
            );
          } catch (error) {
            console.error('Error adding logo to header:', error);
          }
        }

        // Add institution name to header
        if (settings?.institutionName) {
          headerElements.push(
            new Paragraph({
              text: settings.institutionName,
              bold: true,
              alignment: AlignmentType.CENTER,
              spacing: { after: 50 },
            })
          );
        }

        // Add header text if available
        if (settings?.headerText) {
          headerElements.push(
            new Paragraph({
              text: settings.headerText,
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              width: 20160, // Legal landscape width in twips (14" = 14 * 1440)
              height: 12240, // Legal landscape height in twips (8.5" = 8.5 * 1440)
            },
          },
          headers: {
            default: new Header({
              children: headerElements.length > 0 ? headerElements : [
                new Paragraph({
                  text: 'College Course Syllabus',
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children: [

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

            // Footer - Use flexible footerContent if available
            ...(settings?.footerContent && settings.footerContent.length > 0 ? 
              [
                new Paragraph({
                  text: '',
                  spacing: { before: 400 },
                }),
                ...settings.footerContent
                  .sort((a, b) => a.order - b.order)
                  .flatMap(block => {
                    if (block.type === 'text' && block.content) {
                      return [
                        new Paragraph({
                          text: block.content,
                          bold: block.styles?.fontWeight === 'bold',
                          alignment: block.alignment === 'left' ? AlignmentType.LEFT : 
                                    block.alignment === 'right' ? AlignmentType.RIGHT : 
                                    AlignmentType.CENTER,
                          spacing: { after: 100 },
                        })
                      ];
                    } else if (block.type === 'image' && block.content) {
                      try {
                        const base64Data = block.content.split(',')[1];
                        const binaryString = atob(base64Data);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                          bytes[i] = binaryString.charCodeAt(i);
                        }
                        return [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: bytes,
                                transformation: {
                                  width: block.styles?.width || 50,
                                  height: block.styles?.height || 50,
                                },
                              }),
                            ],
                            alignment: block.alignment === 'left' ? AlignmentType.LEFT : 
                                      block.alignment === 'right' ? AlignmentType.RIGHT : 
                                      AlignmentType.CENTER,
                            spacing: { after: 100 },
                          })
                        ];
                      } catch (error) {
                        console.error('Error adding image to footer:', error);
                        return [];
                      }
                    }
                    return [];
                  }),
              ] 
              : settings?.footerText ? [
                new Paragraph({
                  text: '',
                  spacing: { before: 400 },
                }),
                new Paragraph({
                  text: settings.footerText,
                  alignment: AlignmentType.CENTER,
                  italics: true,
                }),
              ] : []
            ),
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const fontSize = settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px';
  
  // Check if syllabus uses a template
  const usesTemplate = syllabus.template && typeof syllabus.template === 'object' && syllabus.template.canvasDocument;
  
  // Get page dimensions
  const getPageStyle = () => {
    if (usesTemplate) {
      const pageSize = syllabus.template.pageSize || 'longBond';
      const orientation = syllabus.template.orientation || 'landscape';
      
      // Map to CSS page size
      const pageMap = {
        legal: 'legal',
        letter: 'letter',
        a4: 'A4',
        longBond: 'legal', // Use legal as closest match
      };
      
      return {
        size: `${pageMap[pageSize] || 'legal'} ${orientation}`,
        width: orientation === 'landscape' ? 
          (pageSize === 'longBond' ? '1248px' : pageSize === 'letter' ? '1056px' : pageSize === 'a4' ? '1123px' : '1344px') :
          '816px',
      };
    }
    
    return {
      size: 'legal landscape',
      width: '356mm',
    };
  };
  
  const pageStyle = getPageStyle();

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
            size: ${pageStyle.size};
            margin: 1cm;
          }
        }
      `}</style>

      {/* Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
        <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ maxWidth: 'calc(356mm + 48px)' }}>
          {/* Modal Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Print Syllabus</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Printable Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            {usesTemplate ? (
              /* Template-based view */
              <div id="printable-syllabus" ref={printRef} className="mx-auto">
                <TemplateRenderer 
                  template={syllabus.template} 
                  syllabus={syllabus}
                />
              </div>
            ) : (
              /* Default view */
            <div
              id="printable-syllabus"
              ref={printRef}
              className="bg-white mx-auto shadow-lg"
              style={{
                width: pageStyle.width,
                minHeight: '216mm',
                padding: '20mm',
                fontFamily: settings.fontFamily,
                fontSize: fontSize,
              }}
            >
              {/* Header */}
              <div className="mb-6 pb-4 border-b-4" style={{ borderColor: settings.primaryColor }}>
                {settings?.headerContent && settings.headerContent.length > 0 ? (
                  // Use flexible header content
                  <div 
                    className={settings.headerLayout === 'horizontal' ? 'flex items-center gap-4 flex-wrap justify-center' : 'space-y-2'}
                  >
                    {settings.headerContent
                      .sort((a, b) => a.order - b.order)
                      .map((block, index) => (
                        <div
                          key={index}
                          style={{ textAlign: settings.headerLayout === 'horizontal' ? 'initial' : block.alignment }}
                        >
                          {block.type === 'text' ? (
                            <p
                              style={{
                                fontWeight: block.styles?.fontWeight || 'normal',
                                fontSize:
                                  block.styles?.fontSize === 'small'
                                    ? '12px'
                                    : block.styles?.fontSize === 'large'
                                    ? '18px'
                                    : '14px',
                                color: block.styles?.color || '#000000',
                                margin: 0,
                                padding: settings.headerLayout === 'horizontal' ? '0' : '4px 0',
                              }}
                            >
                              {block.content}
                            </p>
                          ) : (
                            <img
                              src={block.content}
                              alt="Header"
                              style={{
                                width: `${block.styles?.width || 100}px`,
                                height: `${block.styles?.height || 100}px`,
                                display: 'inline-block',
                                margin: block.alignment === 'center' ? '0 auto' : block.alignment === 'right' ? '0 0 0 auto' : '0',
                              }}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  // Legacy header display
                  <div className="flex items-start justify-between">
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
                )}
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
              {(settings?.footerContent && settings.footerContent.length > 0) || settings?.footerText ? (
                <div className="mt-6 pt-4 border-t-2" style={{ borderColor: settings.primaryColor }}>
                  {settings?.footerContent && settings.footerContent.length > 0 ? (
                    // Use flexible footer content
                    <div 
                      className={settings.footerLayout === 'horizontal' ? 'flex items-center gap-4 flex-wrap justify-center' : 'space-y-2'}
                    >
                      {settings.footerContent
                        .sort((a, b) => a.order - b.order)
                        .map((block, index) => (
                          <div
                            key={index}
                            style={{ textAlign: settings.footerLayout === 'horizontal' ? 'initial' : block.alignment }}
                          >
                            {block.type === 'text' ? (
                              <p
                                style={{
                                  fontWeight: block.styles?.fontWeight || 'normal',
                                  fontSize:
                                    block.styles?.fontSize === 'small'
                                      ? '12px'
                                      : block.styles?.fontSize === 'large'
                                      ? '18px'
                                      : '14px',
                                  color: block.styles?.color || '#000000',
                                  margin: 0,
                                  padding: settings.footerLayout === 'horizontal' ? '0' : '4px 0',
                                }}
                              >
                                {block.content}
                              </p>
                            ) : (
                              <img
                                src={block.content}
                                alt="Footer"
                                style={{
                                  width: `${block.styles?.width || 50}px`,
                                  height: `${block.styles?.height || 50}px`,
                                  display: 'block',
                                }}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    // Legacy footer display
                    <div className="text-center text-sm text-gray-600">
                      {settings.footerText}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
