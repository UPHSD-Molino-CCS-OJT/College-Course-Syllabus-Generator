import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { X, Printer, FileText } from 'lucide-react';
import { settingsAPI, templateAPI } from '../services/api';
import TemplateRenderer from './TemplateRenderer';

export default function SyllabusPrintView({ syllabus, onClose }) {
  const printRef = useRef();
  const [settings, setSettings] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings
      const settingsResponse = await settingsAPI.getSettings();
      setSettings(settingsResponse.data.settings);
      
      // Determine which template to use
      if (syllabus.template && typeof syllabus.template === 'object' && syllabus.template.canvasDocument) {
        // Use the linked template
        setTemplate(syllabus.template);
      } else {
        // Fetch and use the default template
        try {
          const templateResponse = await templateAPI.getDefaultTemplate();
          if (templateResponse.data.template) {
            setTemplate(templateResponse.data.template);
          }
        } catch (error) {
          console.log('No default template found:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const element = printRef.current;
      
      // Get actual element dimensions
      const elementWidth = element.scrollWidth;
      const elementHeight = element.scrollHeight;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: elementWidth,
        height: elementHeight,
        windowWidth: elementWidth,
        windowHeight: elementHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Determine page size based on template or default to legal landscape
      let orientation = 'landscape';
      let format = 'legal';
      
      if (template) {
        orientation = template.orientation || 'landscape';
        // Map page sizes to jsPDF formats or custom dimensions
        if (template.pageSize === 'longBond') {
          // Long bond in mm: 215.9 x 355.6
          format = orientation === 'landscape' ? [355.6, 215.9] : [215.9, 355.6];
        } else if (template.pageSize === 'a4') {
          format = 'a4';
        } else if (template.pageSize === 'letter') {
          format = 'letter';
        } else {
          format = 'legal';
        }
      }
      
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Convert pixels to mm (assuming 96 DPI: 1 inch = 25.4mm, 96px = 25.4mm)
      const imgWidthMM = (canvas.width * 25.4) / (96 * 2); // Divide by 2 because of scale:2
      const imgHeightMM = (canvas.height * 25.4) / (96 * 2);
      
      // Scale to fit page while maintaining aspect ratio
      const ratio = Math.min(pdfWidth / imgWidthMM, pdfHeight / imgHeightMM);
      const finalWidth = imgWidthMM * ratio;
      const finalHeight = imgHeightMM * ratio;
      
      // Center the image
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`${syllabus.courseCode}_${syllabus.courseTitle}_Syllabus.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!syllabus || !settings || loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const fontSize = settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px';
  
  // Check if a template is available
  const usesTemplate = template && template.canvasDocument;
  
  // Get page dimensions
  const getPageStyle = () => {
    if (usesTemplate) {
      const pageSize = template.pageSize || 'longBond';
      const orientation = template.orientation || 'landscape';
      
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
                onClick={handleExportPDF}
                disabled={exporting || !usesTemplate}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!usesTemplate ? "Template required for PDF export" : "Export as PDF"}
              >
                <FileText className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
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
                  template={template} 
                  syllabus={syllabus}
                />
              </div>
            ) : (
              /* No template available - show message */
              <div id="printable-syllabus" ref={printRef} className="mx-auto bg-white rounded-lg p-8 shadow-lg" style={{ width: pageStyle.width }}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">No Template Available</h2>
                  <p className="text-gray-600 mb-6">Please create and set a default template, or assign a template to this syllabus to view the formatted version.</p>
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg text-left">
                    <h3 className="font-bold text-lg mb-3">Syllabus Information:</h3>
                    <p className="mb-2"><strong>Course:</strong> {syllabus.courseCode} - {syllabus.courseTitle}</p>
                    <p className="mb-2"><strong>Instructor:</strong> {syllabus.instructorName}</p>
                    <p className="mb-2"><strong>Semester:</strong> {syllabus.semester} {syllabus.academicYear}</p>
                    <p className="mb-2"><strong>Credits:</strong> {syllabus.credits}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
