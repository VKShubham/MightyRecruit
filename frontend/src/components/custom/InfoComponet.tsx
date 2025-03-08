import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type InfoType = 'info' | 'success' | 'warning' | 'error';

interface InfoProps {
  title?: string;
  message: string;
  type?: InfoType;
  className?: string;
}

const InfoComponent = ({ 
  title, 
  message, 
  type = 'info',
  className = '' 
}: InfoProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'success':
        return 'border-2 border-green-200 bg-green-50 shadow-sm';
      case 'warning':
        return 'border-2 border-yellow-200 bg-yellow-50 shadow-sm';
      case 'error':
        return 'border-2 border-red-200 bg-red-50 shadow-sm';
      default:
        return 'border-2 border-blue-200 bg-blue-50 shadow-sm';
    }
  };

  const getTitleClass = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 text-lg';
      case 'warning':
        return 'text-yellow-800 text-lg';
      case 'error':
        return 'text-red-800 text-lg';
      default:
        return 'text-blue-800 text-lg';
    }
  };

  const getMessageClass = () => {
    switch (type) {
      case 'success':
        return 'text-green-700 text-base';
      case 'warning':
        return 'text-yellow-700 text-base';
      case 'error':
        return 'text-red-700 text-base';
      default:
        return 'text-blue-700 text-base';
    }
  };

  return (
    <div className="flex justify-center items-center p-6">
      <Alert className={`flex max-w-2xl rounded-lg p-4 ${getAlertClass()} ${className}`}>
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="flex-1 space-y-1">
            {title && (
              <AlertTitle className={`font-semibold ${getTitleClass()}`}>
                {title}
              </AlertTitle>
            )}
            <AlertDescription className={`${getMessageClass()} leading-relaxed`}>
              {message}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default InfoComponent;