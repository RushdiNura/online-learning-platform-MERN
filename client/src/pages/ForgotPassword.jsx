import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-2xl font-semibold text-gray-900">Reset your password</h1>
      <p className="mt-1 text-sm text-gray-500">We'll email you a link to reset it.</p>

      {sent ? (
        <div className="mt-8 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
          If that email exists in our system, a reset link is on its way. Check your inbox.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="font-semibold text-primary-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
