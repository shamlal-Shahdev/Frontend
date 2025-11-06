import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Verification token is missing',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        toast({
          title: 'Success',
          description: data.message,
        });

        // Redirect to login page after successful verification
        setTimeout(() => {
          navigate(data.redirectUrl || '/');
        }, 2000);

      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Email verification failed',
          variant: 'destructive',
        });
        // Redirect to login page after error
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      {isVerifying ? (
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-lg">Verifying your email...</p>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-lg">Redirecting to login page...</p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;