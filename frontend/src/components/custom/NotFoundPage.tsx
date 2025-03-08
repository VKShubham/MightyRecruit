import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="p-6 rounded-full inline-flex items-center justify-center">
            <Search className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold">Page not found</h1>
        
        <p className="mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been removed, 
          renamed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go back
          </Button>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm">
          If you believe this is an error, please contact support
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;