import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser, clearAuthError } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: 'student' } });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const role = watch('role');

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to Lumenlearn.');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-2xl font-semibold text-gray-900">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">Start learning — or teaching — today.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input
          label="Full name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Must be at least 6 characters' },
          })}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">I want to</span>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium ${
                role === 'student' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'
              }`}
            >
              <input type="radio" value="student" className="hidden" {...register('role')} />
              Learn
            </label>
            <label
              className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium ${
                role === 'instructor' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'
              }`}
            >
              <input type="radio" value="instructor" className="hidden" {...register('role')} />
              Teach
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" loading={status === 'loading'}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
