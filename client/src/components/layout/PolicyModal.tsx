import React from 'react';
import { X, ShieldCheck, Truck, RefreshCw, HelpCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PolicyModalProps {
  type: string | null;
  onClose: () => void;
}

const policyContents: Record<string, { title: string; icon: React.ReactNode; body: React.ReactNode }> = {
  'Help Center': {
    title: 'Help Center & Support',
    icon: <HelpCircle size={24} className="text-accent" />,
    body: (
      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>Need assistance with your AuraStore order, AI search queries, or account management? We are here to help!</p>
        <div className="card p-4 space-y-2 bg-bg-alt">
          <h4 className="font-bold text-text">Contact Support</h4>
          <p>Email: <strong className="text-text">support@aurastore.ai</strong></p>
          <p>Hours: Mon - Fri, 9:00 AM - 6:00 PM EST</p>
        </div>
      </div>
    ),
  },
  'Shipping Policy': {
    title: 'Shipping Policy',
    icon: <Truck size={24} className="text-accent" />,
    body: (
      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>AuraStore offers fast regional dispatch for all orders placed on our AI retail engine platform.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Free Standard Shipping:</strong> Qualified on all orders above $500.00.</li>
          <li><strong>Standard Flat Rate:</strong> $50.00 for orders under $500.00.</li>
          <li><strong>Dispatch Time:</strong> Orders process within 24 hours of checkout confirmation.</li>
        </ul>
      </div>
    ),
  },
  'Return Policy': {
    title: 'Return & Refund Policy',
    icon: <RefreshCw size={24} className="text-accent" />,
    body: (
      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>We want you to be 100% satisfied with your purchases from AuraStore AI.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>30-Day Money-Back Guarantee:</strong> Return any unused item within 30 days for a full refund.</li>
          <li><strong>Easy Returns:</strong> Contact support to generate a prepaid return label.</li>
          <li><strong>Refund Processing:</strong> Refunds are processed back to your original payment method within 3-5 business days upon receiving the return.</li>
        </ul>
      </div>
    ),
  },
  'Privacy Policy': {
    title: 'Privacy & Data Policy',
    icon: <ShieldCheck size={24} className="text-accent" />,
    body: (
      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>Your privacy is important to us. AuraStore AI encrypts all telemetry data and vector search query embeddings.</p>
        <p>We do not sell your personal data to third parties. All JWT credentials and payment transactions are secured using standard 256-bit SSL encryption protocols.</p>
      </div>
    ),
  },
  'Terms of Service': {
    title: 'Terms of Service',
    icon: <FileText size={24} className="text-accent" />,
    body: (
      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>By accessing AuraStore AI, you agree to comply with our terms of service, acceptable use policies, and product purchase terms.</p>
        <p>All product prices, availability, and AI vector similarity scores are calculated dynamically in real-time.</p>
      </div>
    ),
  },
};

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  if (!type || !policyContents[type]) return null;
  const content = policyContents[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 'var(--z-modal)' }} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="card bg-surface w-full max-w-lg overflow-hidden shadow-2xl relative p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              {content.icon}
              <h3 className="font-bold text-lg">{content.title}</h3>
            </div>
            <button onClick={onClose} className="btn-icon"><X size={20} /></button>
          </div>

          <div className="py-2">
            {content.body}
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button onClick={onClose} className="btn btn-primary btn-sm">Close</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
