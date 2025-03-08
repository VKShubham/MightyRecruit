import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { AlertCircle, ChevronLeft, ChevronRight, Loader, ZoomIn, ZoomOut } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Button } from '../ui/button';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({src}: {src: string}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(0.7);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  }

  function changeZoom(delta: number) {
    const newScale = Math.max(0.3, Math.min(scale + delta, 2.0));
    setScale(newScale);
  }

  return (
    <div className="max-w-[323px] flex flex-col rounded-lg shadow-md p-4 lg:max-w-full">
      {/* PDF Toolbar */}
      <div className="flex flex-wrap justify-center items-center mb-4 bg-background p-3 rounded-lg shadow-sm lg:justify-between space-y-2">
        <div className="text-xs flex items-center space-x-2 md:text-sm">
          <Button
            type='button'
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            variant='outline'
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <span className="font-medium">
            Page {pageNumber} of {numPages || '?'}
          </span>
          
          <Button
            type='button'
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            variant='outline'
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            type='button'
            onClick={() => changeZoom(-0.1)}
            className="p-2 rounded-full"
            variant='outline'
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          
          <span className="text-sm font-medium">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            type='button'
            onClick={() => changeZoom(0.1)}
            className="p-2 rounded-full"
            variant='outline'
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* PDF Container with improved overflow handling */}
      <div className="flex justify-center items-start overflow-auto w-full" style={{ maxHeight: '70vh' }}>
        <div className="inline-block min-w-min">
          <Document
            file={src}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-64 w-full">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-64 w-full">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="mt-2 text-red-600">Failed to load PDF</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              className="shadow-lg border border-secondary bg-primary"
              loading={
                <div className="flex items-center justify-center h-64 w-64 bg-primary shadow-lg">
                  <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-64 w-64 bg-primary shadow-lg">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <p className="mt-2 text-sm text-red-600">Error rendering page</p>
                </div>
              }
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;