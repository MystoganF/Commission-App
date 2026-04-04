import React, { useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. Import createPortal
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // 2. Wrap your existing JSX in a variable
  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );

  // 3. Teleport the modal to the document.body
  return createPortal(modalContent, document.body);
}