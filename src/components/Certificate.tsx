import React from 'react';
import { Certificate } from '../types/achievement';
import { Button } from './ui/button';
import { Download, Share2, CheckCircle } from 'lucide-react';

interface CertificateProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateViewer: React.FC<CertificateProps> = ({ certificate, onClose }) => {
  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    const link = document.createElement('a');
    link.href = certificate.certificateUrl;
    link.download = `Certificate-${certificate.courseTitle.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `My Certificate: ${certificate.courseTitle}`,
          text: `I completed the course "${certificate.courseTitle}" on ${certificate.completionDate.toLocaleDateString()}!`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Certificate of Completion</h2>
            <p className="text-gray-600 mt-2">This certificate is proudly presented to</p>
            <h3 className="text-2xl font-semibold text-indigo-700 my-2">{certificate.userName}</h3>
            <p className="text-gray-600">
              for successfully completing the course
            </p>
            <h4 className="text-xl font-medium text-gray-800 mt-2">{certificate.courseTitle}</h4>
            <div className="mt-4 text-sm text-gray-500">
              <p>Issued on: {certificate.completionDate.toLocaleDateString()}</p>
              <p>Verification Code: {certificate.verificationCode}</p>
              <p className="mt-2 text-xs text-gray-400">
                Issued by {certificate.issuedBy}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={handleDownload}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button 
              onClick={handleShare}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button 
              onClick={onClose}
              variant="ghost"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;
