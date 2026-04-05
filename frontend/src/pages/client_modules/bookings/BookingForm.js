import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './Booking.module.css';

export default function BookingForm() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Project Content State
  const [details, setDetails] = useState('');
  const [references, setReferences] = useState('');
  const [refFile, setRefFile] = useState(null);

  // Payment Submission State (Mandatory)
  const [payRef, setPayRef] = useState('');
  const [payFile, setPayFile] = useState(null);

  useEffect(() => {
    api.get(`/public/services/${serviceId}`)
      .then(res => setService(res.data))
      .catch(() => setError("Service unavailable."))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const downpayment = service ? Number(service.price) * 0.3 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!details.trim()) {
      setError("Please provide project instructions.");
      return;
    }
    if (!payRef || !payFile) {
      setError("Downpayment reference and proof image are required to secure your slot.");
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('serviceId', serviceId);
    formData.append('details', `INSTRUCTIONS:\n${details}\n\nREFS:\n${references || 'None'}`);
    
    if (refFile) formData.append('file', refFile);
    formData.append('paymentReference', payRef);
    formData.append('paymentFile', payFile);

    try {
      await api.post('/client/bookings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/client/my-bookings', { 
        state: { toastMsg: "Request sent! The artist will review your proof soon." } 
      });
    } catch (err) {
      setError("Failed to submit. Please check your connection or file size.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Service...</div>;
  if (!service) return <div className={styles.errorPage}>{error}</div>;

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
      
      <div className={styles.layout}>
        {/* ── LEFT SIDE: SUMMARY ── */}
        <aside className={styles.summarySidebar}>
          <h2 className={styles.summaryTitle}>Booking Summary</h2>
          <div className={styles.servicePreview}>
            {service.samples?.length > 0 ? (
              <img src={service.samples[0]} className={styles.previewImg} alt="" />
            ) : (
              <div className={styles.noPreview}>No Image</div>
            )}
          </div>
          <h3 className={styles.serviceName}>{service.name}</h3>
          <p className={styles.artistLink} onClick={() => navigate(`/client/artist/${service.artistId}`)}>
            Artist: <span>{service.artistName}</span>
          </p>
          
          <div className={styles.detailsBox}>
            <div className={styles.detailRow}>
              <span>Total Price</span>
              <span className={styles.priceHighlight}>₱ {Number(service.price).toLocaleString()}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Downpayment (30%)</span>
              <span style={{color: '#fff', fontWeight: '700'}}>₱ {downpayment.toLocaleString()}</span>
            </div>
          </div>

          {(service.gcashNumber || service.paymayaNumber) && (
            <div className={styles.paymentNotice}>
              <p className={styles.payNoticeTitle}>Artist Payment Channels:</p>
              {service.gcashNumber && (
                <div className={styles.payMethod}>
                  <strong>GCash:</strong> {service.gcashNumber} <br/><small>({service.gcashName})</small>
                </div>
              )}
              {service.paymayaNumber && (
                <div className={styles.payMethod}>
                  <strong>Paymaya:</strong> {service.paymayaNumber} <br/><small>({service.paymayaName})</small>
                </div>
              )}
            </div>
          )}
          <p className={styles.disclaimer}>Note: Work officially begins once the 30% downpayment is verified.</p>
        </aside>

        {/* ── RIGHT SIDE: FORM ── */}
        <main className={styles.formMain}>
          <div className={styles.formHeader}>
            <span className={styles.formLabel}>New Commission</span>
            <h1 className={styles.formTitle}>Request Details</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Instructions */}
            <div className={styles.field}>
              <label className={styles.label}>Instructions <span className={styles.required}>*</span></label>
              <textarea 
                className={styles.textarea} 
                value={details} 
                onChange={(e) => setDetails(e.target.value)} 
                rows={5} 
                placeholder="Describe what you want the artist to create..."
                required 
              />
            </div>

            {/* Optional Reference Image */}
            <div className={styles.field}>
              <label className={styles.label}>Reference Image (Optional)</label>
              <div className={styles.fileUploadWrapper}>
                <div className={styles.filePlaceholder}>
                  {refFile ? refFile.name : "Select visual reference..."}
                  <span>Browse</span>
                </div>
                <input type="file" accept="image/*" onChange={(e) => setRefFile(e.target.files[0])} className={styles.fileInput} />
              </div>
            </div>

            {/* MANDATORY PAYMENT SECTION */}
            <div className={styles.paymentSubmissionBox}>
               <div className={styles.formHeader} style={{marginBottom: '20px'}}>
                  <span className={styles.formLabel}>Payment</span>
                  <h3 className={styles.paymentTitle}>Secure your slot</h3>
                  <p className={styles.paymentNote}>Submit proof of 30% downpayment (₱ {downpayment.toLocaleString()})</p>
               </div>
               
               <div className={styles.field}>
                 <label className={styles.label}>Payment Reference ID <span className={styles.required}>*</span></label>
                 <input 
                   className={styles.input} 
                   placeholder="GCash or Paymaya Ref No." 
                   value={payRef} 
                   onChange={e => setPayRef(e.target.value)} 
                   required
                 />
               </div>

               <div className={styles.field} style={{marginTop: '15px'}}>
                 <label className={styles.label}>Proof of Payment <span className={styles.required}>*</span></label>
                 <div className={styles.fileUploadWrapper}>
                    <div className={styles.filePlaceholder}>
                      {payFile ? payFile.name : "Upload receipt/screenshot..."}
                      <span>Browse</span>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => setPayFile(e.target.files[0])} required className={styles.fileInput} />
                 </div>
               </div>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.btn} disabled={submitting}>
                {submitting ? <span className={styles.spinner} /> : 'Send Commission Request →'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}