export default function SnapGuides({ guides }) {
  return (
    <>
      {guides.map((guide, index) => {
        if (guide.type === 'vertical') {
          return (
            <div
              key={`guide-v-${index}`}
              className="absolute pointer-events-none"
              style={{
                left: guide.x,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: '#3b82f6',
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)',
                zIndex: 9999
              }}
            >
              {guide.label && (
                <div 
                  className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
                  style={{
                    top: 10,
                    left: 5,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {guide.label}
                </div>
              )}
            </div>
          );
        } else if (guide.type === 'horizontal') {
          return (
            <div
              key={`guide-h-${index}`}
              className="absolute pointer-events-none"
              style={{
                top: guide.y,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: '#3b82f6',
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)',
                zIndex: 9999
              }}
            >
              {guide.label && (
                <div 
                  className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
                  style={{
                    left: 10,
                    top: 5,
                    transform: 'translateY(-50%)'
                  }}
                >
                  {guide.label}
                </div>
              )}
            </div>
          );
        }
        return null;
      })}
    </>
  );
}
