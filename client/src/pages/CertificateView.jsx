import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiAward, FiDownload, FiShare2 } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

// Certificates are created server-side automatically when a student reaches
// 100% course progress (see server/controllers/progressController.js).
// This page looks one up by its verification code.
const CertificateView = () => {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/certificates/verify/${code}`);
        setCertificate(data.certificate);
      } catch {
        setError('This certificate could not be found or verified.');
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const handlePrint = () => window.print();
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'My course certificate', url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) return <Spinner className="py-32" />;
  if (error) return <div className="py-32 text-center text-gray-500">{error}</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border-4 border-primary-100 bg-white p-10 text-center shadow-sm">
        <FiAward className="mx-auto text-5xl text-primary-600" />
        <p className="mt-4 text-sm font-medium uppercase tracking-widest text-gray-400">Certificate of Completion</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-gray-900">{certificate?.userId?.name}</h1>
        <p className="mt-2 text-gray-600">has successfully completed</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-primary-700">{certificate?.courseId?.title}</h2>
        <p className="mt-4 text-sm text-gray-500">
          Issued {new Date(certificate?.issuedAt).toLocaleDateString()} · Verification code: {certificate?.verificationCode}
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-3 print:hidden">
        <Button onClick={handlePrint}><FiDownload /> Download / Print</Button>
        <Button variant="secondary" onClick={handleShare}><FiShare2 /> Share</Button>
      </div>
    </div>
  );
};

export default CertificateView;
