import { useState, useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import Avatar from './Avatar';
import './AvatarSelector.css';

const AvatarSelector = ({ currentSeed, onSelect, onClose }) => {
  const [selectedSeed, setSelectedSeed] = useState(currentSeed);

  // Generate some random avatar options
  const avatarOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 8; i++) {
      const seed = `avatar-${i}-${Math.random().toString(36).substring(2, 15)}`;
      options.push(seed);
    }
    return options;
  }, []);

  const handleSelect = () => {
    onSelect(selectedSeed);
    onClose();
  };

  return (
    <div className="avatar-selector-overlay" onClick={onClose}>
      <div className="avatar-selector" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-selector-header">
          <h3>Choose Your Avatar</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="avatar-options">
          {avatarOptions.map((seed) => (
            <div 
              key={seed}
              className={`avatar-option ${selectedSeed === seed ? 'selected' : ''}`}
              onClick={() => setSelectedSeed(seed)}
            >
              <Avatar seed={seed} size={60} />
            </div>
          ))}
        </div>

        <div className="avatar-selector-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="select-button" onClick={handleSelect}>
            Select Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
