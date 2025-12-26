import { Copy, Download, ExternalLink, Printer, Upload, Loader2, Building2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import api from '../../utils/api';
import { updateUser } from '../../features/auth/authSlice';

export default function ConsultancySettings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const qrRef = useRef();

  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(user?.consultancy?.name || '');
  const [tagline, setTagline] = useState(user?.consultancy?.tagline || '');
  const [saving, setSaving] = useState(false);

  // The URL students will visit
  const inquiryUrl = `${window.location.origin}/inquiry/${user?.consultancyId}`;

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = 'Visa_Inquiry_QR.png';
    a.href = url;
    a.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inquiryUrl);
    toast.success("Link copied to clipboard!");
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    const canvas = qrRef.current.querySelector('canvas');
    const imgUrl = canvas.toDataURL('image/png');

    printWindow.document.write(`
        <html>
            <head><title>Print QR Code</title></head>
            <body style="text-align: center; font-family: sans-serif; padding-top: 50px;">
                <h1>Scan to Apply</h1>
                <p>Japan Student Visa Inquiry Form</p>
                <img src="${imgUrl}" width="300" style="margin: 20px 0;" />
                <h3>${user?.consultancy?.name || 'Consultancy'}</h3>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, SVG, or WEBP image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size must be less than 2MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const logoUrl = response.data.url;

      // Get consultancy ID (handle both populated object and string ID)
      const consultancyId = user.consultancyId?._id || user.consultancyId;

      // Update consultancy logo
      await api.put(`/consultancies/${consultancyId}`, {
        logo: logoUrl
      });

      // Fetch updated user data to get new consultancy info
      const userResponse = await api.get('/auth/me');

      // Update Redux auth state with new user data
      dispatch(updateUser(userResponse.data.data));

      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const saveBranding = async () => {
    if (!name.trim()) {
      toast.error('Consultancy name is required');
      return;
    }

    setSaving(true);
    try {
      // Get consultancy ID (handle both populated object and string ID)
      const consultancyId = user.consultancyId?._id || user.consultancyId;

      await api.put(`/consultancies/${consultancyId}`, {
        name,
        tagline
      });

      // Fetch updated user data
      const userResponse = await api.get('/auth/me');
      dispatch(updateUser(userResponse.data.data));

      toast.success('Branding saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Settings & Tools</h2>
          <p className="text-secondary-500">Manage your consultancy assets.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'settings'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
              }`}
          >
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'qr'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
              }`}
          >
            QR & Links
          </button>
        </div>
      </div>

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <Card className="p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-secondary-900 mb-2 flex items-center gap-2">
              <Building2 size={24} className="text-primary-600" />
              Consultancy Branding
            </h3>
            <p className="text-sm text-secondary-500">Customize your consultancy's name, logo and tagline for the public landing page</p>
          </div>

          <div className="space-y-6">
            {/* Consultancy Name */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">Consultancy Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Himalaya Education Consultancy"
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-secondary-900"
                maxLength={100}
              />
              <p className="text-xs text-secondary-500 mt-1">
                This name will appear in the navbar and footer of your landing page
              </p>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-3">Logo</label>
              <div className="flex items-center gap-6">
                {/* Logo Preview */}
                <div className="w-32 h-32 border-2 border-secondary-200 rounded-xl flex items-center justify-center bg-secondary-50 overflow-hidden">
                  {user?.consultancy?.logo ? (
                    <img
                      src={user.consultancy.logo}
                      alt="Consultancy Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Building2 className="mx-auto text-secondary-300 mb-1" size={32} />
                      <p className="text-xs text-secondary-400">No logo</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('logo-upload').click()}
                    disabled={uploading}
                    className="px-4 py-2 border border-secondary-300 bg-white text-secondary-700 rounded-xl hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 cursor-pointer font-medium"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload Logo
                      </>
                    )}
                  </button>
                  <p className="text-xs text-secondary-500 mt-2">
                    PNG, JPG, SVG or WEBP. Max size: 2MB. Recommended: 256x256px
                  </p>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">Tagline (Optional)</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., Your Trusted Partner for Japan Study Visa Success"
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-secondary-900"
                maxLength={100}
              />
              <p className="text-xs text-secondary-500 mt-1">
                {tagline.length}/100 characters
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-secondary-100">
              <Button
                onClick={saveBranding}
                disabled={saving}
                variant="primary"
                className="w-full sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save Branding'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* QR & LINKS TAB */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-200">

          {/* QR Code Card */}
          <Card className="flex flex-col items-center text-center p-8">
            <div className="bg-primary-50 p-4 rounded-full mb-4">
              <ExternalLink className="text-secondary-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Student Inquiry QR Code</h3>
            <p className="text-sm text-secondary-500 mb-6 max-w-xs">
              Print this and place it at your reception desk. Students can scan it to fill their initial details directly.
            </p>

            {/* The QR Canvas */}
            <div ref={qrRef} className="p-4 bg-white border-2 border-secondary-100 rounded-xl shadow-inner mb-6">
              <QRCodeCanvas
                value={inquiryUrl}
                size={200}
                level="H" // High error correction
                includeMargin={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                onClick={downloadQR}
                className="flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download PNG
              </Button>
              <Button
                variant="primary"
                onClick={printQR}
                className="flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print Poster
              </Button>
            </div>
          </Card>

          {/* Link Card */}
          <Card className="flex flex-col justify-center p-8">
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Direct Link</h3>
            <p className="text-sm text-secondary-500 mb-6">
              Share this link via WhatsApp, Email, or SMS to invite students remotely.
            </p>

            <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-200 break-all text-xs text-secondary-600 font-mono mb-4">
              {inquiryUrl}
            </div>

            <Button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 bg-secondary-900 hover:bg-secondary-800 text-white shadow-md"
            >
              <Copy size={18} /> Copy Link
            </Button>
          </Card>

        </div>
      )}
    </div>
  );
}
