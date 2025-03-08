import React, { useEffect } from 'react';
import { Controller, Control, useFormContext } from 'react-hook-form';
import { Input } from '../ui/input';
import { useDebounceValue } from 'usehooks-ts';
import { useQuery } from '@tanstack/react-query';
import { checkusername } from '@/service/UserService';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';

interface UsernameCheckProps {
  name: string;
  control: Control<any>;
  classname?: string;
  disableLabel?: boolean;
}

const UsernameCheck: React.FC<UsernameCheckProps> = ({ name, control, classname, disableLabel = false }) => {
  // Local state to capture the current input value for debouncing
  const [username, setUsername] = useDebounceValue<string>('', 500);
  const {  setError, clearErrors } = useFormContext();
  const { data, isLoading } = useQuery({
    queryKey: ['usernameCheck', username],
    queryFn: () => checkusername(username),
    enabled: username.length > 2
  });

  
  const showIndicator = username.length > 2;
  const isAvailable = showIndicator && !isLoading && !data?.data?.exists;

  useEffect(() => {
    if(showIndicator) {
        if(isAvailable) {
            clearErrors('username')
        }
        else {
            setError('username', { message: 'Username is already taken'});
        }
    }
  },[isAvailable, username, showIndicator])

  return (
    <div className="relative">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          // Update both the form field and local state for debouncing on change
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(e);
            setUsername(e.target.value);
          }

          return (
            <div className='flex flex-col space-y-2'>
              { !disableLabel && <Label className={`${fieldState.error ? 'text-red-500' : ''} `}>Username</Label>}
            <div className="relative">
              <Input
                {...field}
                onChange={handleChange}
                placeholder="Enter your username"
                className={`pr-10 ${fieldState.error ? 'border-red-500' : ''} ${classname}`}
              />
              
              {/* Status indicators positioned inside the input on the right */}
              {showIndicator && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isLoading && (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  )}
                  
                  {isAvailable && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  
                  {!isAvailable && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
              
              {/* Error message below input */}
            </div>
              {fieldState.error && (
                <p className="text-destructive text-sm font-medium">{fieldState.error.message}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default UsernameCheck;