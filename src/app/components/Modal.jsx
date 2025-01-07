import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* <button onClick={onClose} style={styles.closeButton}>
          Close
        </button> */}
        {children}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    background: 'rgba(225, 225, 225, 0.5)',
    width: '80%',
    height: '80%',
    padding: '20px',
    borderRadius: '5px',
    position: 'relative',
    overflow: 'auto',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 1002,
  },
};

export default Modal;
