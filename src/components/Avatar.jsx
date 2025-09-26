import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import './Avatar.css';

const Avatar = ({ seed, size = 40, className = '', onClick = null }) => {
  const avatar = useMemo(() => {
    return createAvatar(lorelei, {
      seed: seed || 'default',
      size: size,
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
      // Add some variety to the avatars
      ...(seed && {
        // Use seed to generate consistent but varied avatars
        style: ['lorelei'],
      })
    }).toDataUri();
  }, [seed, size]);

  return (
    <img 
      src={avatar} 
      alt={`Avatar for ${seed}`}
      className={`avatar-image ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
    />
  );
};

export default Avatar;
